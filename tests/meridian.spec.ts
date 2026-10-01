import { test, expect, type Page, type Locator } from '@playwright/test'

async function fitsPage(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    viewport: document.documentElement.clientWidth,
  }))
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport + 1)
}

async function alertContentDoesNotOverlapAction(page: Page) {
  const alert = page
    .getByRole('alert')
    .filter({ has: page.getByRole('button', { name: 'Retry save' }) })
  const content = await alert.locator('.v-alert__content').boundingBox()
  const action = await alert
    .getByRole('button', { name: 'Retry save' })
    .boundingBox()
  expect(content).not.toBeNull()
  expect(action).not.toBeNull()
  const disjoint =
    content!.x + content!.width <= action!.x + 1 ||
    action!.x + action!.width <= content!.x + 1 ||
    content!.y + content!.height <= action!.y + 1 ||
    action!.y + action!.height <= content!.y + 1
  expect(disjoint, 'Persistent recovery action must not cover error text').toBe(
    true,
  )
}

async function targets(container: Locator, minimum: number) {
  // VSelect's input does not own the whole pointer target; its visible field does.
  const controls = container.locator(
    'button:enabled, .v-field:not(.v-field--disabled)',
  )
  for (const control of await controls.all()) {
    if (!(await control.isVisible())) continue
    const name =
      (await control.getAttribute('aria-label')) || (await control.innerText())
    // Poll through framework overlay entrance transforms before measuring targets.
    await expect
      .poll(async () => (await control.boundingBox())?.height ?? 0, {
        message: name,
      })
      .toBeGreaterThanOrEqual(minimum - 0.5)
    await expect
      .poll(async () => (await control.boundingBox())?.width ?? 0, {
        message: name,
      })
      .toBeGreaterThanOrEqual(minimum - 0.5)
  }
}

async function select(page: Page, name: string, option: string) {
  const field = page.getByRole('combobox', { name, exact: true })
  await field.focus()
  await field.press('Enter')
  await page.getByRole('option', { name: option, exact: true }).click()
}

for (const width of [320, 390, 768, 1440]) {
  test(`Meridian ${width}px queue, detail, empty and storage recovery fit with usable targets`, async ({
    page,
  }) => {
    const minimum = width <= 700 ? 48 : 44
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await fitsPage(page)
    await targets(page.locator('body'), minimum)
    await page.getByTestId('open-issue-01').click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await targets(page.getByRole('dialog'), minimum)
    expect(
      await page
        .locator('.detail-body')
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true)
    const detail = await page.locator('.detail-card').boundingBox()
    expect(detail!.x).toBeGreaterThanOrEqual(0)
    expect(detail!.x + detail!.width).toBeLessThanOrEqual(width + 1)
    await page.getByRole('button', { name: 'Close issue detail' }).click()
    await select(page, 'Brand', 'Folio Press')
    await select(page, 'Region', 'Asia Pacific')
    await expect(
      page.getByRole('heading', { name: 'No issues in this scope' }),
    ).toBeVisible()
    await fitsPage(page)
    await targets(page.locator('body'), minimum)
    await page.evaluate(() => localStorage.setItem('signal-desk:v1', '{broken'))
    await page.goto('/')
    await expect(page.getByRole('alert')).toContainText('could not be loaded')
    await alertContentDoesNotOverlapAction(page)
    await fitsPage(page)
    await targets(page.locator('body'), minimum)
    await page.getByRole('button', { name: 'Retry save' }).click()
    await page.getByTestId('open-issue-01').click()
    await page.evaluate(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('Storage blocked', 'QuotaExceededError')
      }
    })
    await page.getByRole('button', { name: 'Acknowledge', exact: true }).click()
    await expect(page.locator('.detail-bottom')).toContainText(
      'Changes may not survive a reload',
    )
    expect(
      await page
        .locator('.detail-body')
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true)
    await targets(page.getByRole('dialog'), minimum)
    await page.getByRole('button', { name: 'Close issue detail' }).click()
    await expect(page.getByRole('alert')).toContainText('could not be saved')
    await alertContentDoesNotOverlapAction(page)
    await fitsPage(page)
    await targets(page.locator('body'), minimum)
  })
}

test('Meridian foundation, local fonts and actual canvas labels use the shared operational theme', async ({
  page,
}) => {
  const fontRequests: string[] = []
  page.on('request', (request) => {
    if (request.resourceType() === 'font') fontRequests.push(request.url())
  })
  await page.addInitScript(() => {
    const captured: { font: string; color: string }[] = []
    ;(window as any).__canvasLabels = captured
    const fillText = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (
      ...args: Parameters<typeof fillText>
    ) {
      captured.push({ font: this.font, color: String(this.fillStyle) })
      return fillText.apply(this, args)
    }
  })
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-ms-theme', 'dark')
  await expect(page.locator('html')).toHaveAttribute(
    'data-ms-mode',
    'operations',
  )
  await expect(page.locator('body')).toHaveClass(/ms-root/)
  await expect(page.locator('.ms-brand__mark')).toBeVisible()
  await expect(page.locator('.ms-brand')).toContainText('MERIDIAN')
  await expect(
    page.getByRole('heading', { name: 'Signal Desk.' }),
  ).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  const foundation = await page.evaluate(() => ({
    font: getComputedStyle(document.querySelector('.v-application')!)
      .fontFamily,
    loaded: document.fonts.check('400 16px "DM Sans"'),
    metrics: getComputedStyle(document.querySelector('.stat-value')!)
      .fontVariantNumeric,
  }))
  expect(foundation.font).toContain('DM Sans')
  expect(foundation.loaded).toBe(true)
  expect(foundation.metrics).toContain('tabular-nums')
  const semanticStates = await page.evaluate(() => {
    const probe = document.createElement('span')
    document.body.append(probe)
    const states = [
      ['.severity.critical', '--ms-danger', 'color'],
      ['.severity.high', '--ms-warning', 'color'],
      ['.resolved-row .status', '--ms-success', 'color'],
    ] as const
    const comparisons = states.map(([selector, token, property]) => {
      probe.style.color = `var(${token})`
      return {
        selector,
        actual: getComputedStyle(document.querySelector(selector)!)[property],
        expected: getComputedStyle(probe).color,
      }
    })
    probe.remove()
    return comparisons
  })
  for (const state of semanticStates)
    expect(state.actual, state.selector).toBe(state.expected)
  expect(fontRequests.length).toBeGreaterThan(0)
  for (const request of fontRequests)
    expect(new URL(request).origin).toBe(new URL(page.url()).origin)
  await expect
    .poll(() => page.evaluate(() => (window as any).__canvasLabels.length))
    .toBeGreaterThan(0)
  const labels: { font: string; color: string }[] = await page.evaluate(
    () => (window as any).__canvasLabels,
  )
  for (const label of labels) {
    expect(label.font).toContain('DM Sans')
    expect(Number(label.font.match(/([\d.]+)px/)?.[1])).toBeGreaterThanOrEqual(
      12,
    )
    expect(label.color).not.toContain('var(')
  }
})

test('keyboard VSelect focus remains visible in filters and owner overlay', async ({
  page,
}) => {
  await page.goto('/')
  for (const name of ['Brand', 'Response owner']) {
    if (name === 'Response owner')
      await page.getByTestId('open-issue-01').click()
    const input = page.getByRole('combobox', { name, exact: true })
    await input.focus()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Shift+Tab')
    await expect(input).toBeFocused()
    const focus = await input.evaluate((el) => {
      const style = getComputedStyle(el.closest('.v-field')!)
      return {
        width: parseFloat(style.outlineWidth),
        style: style.outlineStyle,
        color: style.outlineColor,
      }
    })
    expect(focus.width).toBeGreaterThanOrEqual(2)
    expect(focus.style).not.toBe('none')
    expect(focus.color).not.toBe('rgba(0, 0, 0, 0)')
    await input.press('Enter')
    await expect(page.getByRole('option').first()).toBeVisible()
    await page.keyboard.press('Escape')
  }
})

test('200% browser-zoom reflow proxy uses 720 CSS pixels at 2x device scale', async ({
  browser,
  baseURL,
}) => {
  // 720x500 CSS viewport at DPR2 represents 1440x1000 physical pixels.
  // This exercises zoom-equivalent media queries, not native browser zoom controls.
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 720, height: 500 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()
  try {
    await page.goto('/')
    await fitsPage(page)
    expect(await page.evaluate(() => window.devicePixelRatio)).toBe(2)
    expect(
      await page
        .locator('.queue-scroll')
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true)
    const readable = async () => {
      for (const text of await page
        .locator(
          '.issue-meta, .coverage-meta, .deadline-date, .article-meta, .article-time, .scope-caption, .stat-card p',
        )
        .all()) {
        if (await text.isVisible())
          expect(
            await text.evaluate((el) =>
              parseFloat(getComputedStyle(el).fontSize),
            ),
          ).toBeGreaterThanOrEqual(12)
      }
    }
    await readable()
    await page
      .getByRole('button', { name: 'Review first urgent unassigned issue' })
      .click()
    await expect(
      page.getByRole('heading', { name: 'Coordinate the response' }),
    ).toBeVisible()
    expect(
      await page
        .locator('.detail-body')
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true)
    await readable()
    await select(page, 'Response owner', 'Mara Ellery · Central communications')
    await page.getByRole('button', { name: 'Save owner', exact: true }).click()
    await page.getByRole('button', { name: 'Acknowledge', exact: true }).click()
    await page
      .getByRole('button', { name: 'Resolve issue', exact: true })
      .click()
    await expect(page.getByTestId('count-open')).toHaveText('14')
    await page.getByRole('button', { name: 'Close issue detail' }).click()
    await select(page, 'Brand', 'Folio Press')
    await select(page, 'Region', 'Asia Pacific')
    await expect(
      page.getByRole('heading', { name: 'No issues in this scope' }),
    ).toBeVisible()
    await fitsPage(page)
    expect(
      await page
        .locator('.queue')
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true)
    await page
      .getByRole('button', { name: 'Clear filters', exact: true })
      .click()
    await expect(page.getByTestId('count-open')).toHaveText('14')
    await expect(page.getByTestId('open-issue-01')).toBeVisible()
  } finally {
    await context.close()
  }
})

test('reduced-motion preference disables UI transitions while keeping the triage path operable', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    const overlayAnimations: number[] = []
    ;(window as any).__overlayAnimations = overlayAnimations
    const animate = Element.prototype.animate
    Element.prototype.animate = function (keyframes, options) {
      if (this.closest('.v-overlay')) {
        overlayAnimations.push(
          Number(
            typeof options === 'number' ? options : options?.duration || 0,
          ),
        )
      }
      return animate.call(this, keyframes, options)
    }
  })
  await page.goto('/')
  await page.getByTestId('open-issue-01').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  const owner = page.getByRole('combobox', {
    name: 'Response owner',
    exact: true,
  })
  await owner.focus()
  await owner.press('Enter')
  await expect(page.getByRole('option').first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(owner).toBeFocused()
  const motion = await page
    .getByRole('button', { name: 'Acknowledge', exact: true })
    .evaluate((el) => {
      const style = getComputedStyle(el)
      return {
        transition: style.transitionDuration,
        animation: style.animationName,
      }
    })
  expect(
    motion.transition.split(',').every((value) => parseFloat(value) === 0),
  ).toBe(true)
  expect(motion.animation).toBe('none')
  await page.getByRole('button', { name: 'Acknowledge', exact: true }).click()
  await expect(page.locator('.detail-body > .issue-meta')).toContainText(
    'Acknowledged',
  )
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByTestId('open-issue-01')).toBeFocused()
  const animations: number[] = await page.evaluate(
    () => (window as any).__overlayAnimations,
  )
  expect(
    animations.filter((duration) => duration > 0),
    'Reduced motion must disable JS overlay animations too',
  ).toEqual([])
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`nested Escape closes owner menu before detail with ${reducedMotion} motion`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion })
    await page.goto('/')
    // Repeat through fresh overlay registrations; no timed sleeps or animation disabling.
    for (let attempt = 0; attempt < 3; attempt++) {
      const opener = page.getByTestId('open-issue-01')
      await opener.click()
      const owner = page.getByRole('combobox', {
        name: 'Response owner',
        exact: true,
      })
      await owner.focus()
      await owner.press('Enter')
      await expect(page.getByRole('option').first()).toBeVisible()
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByRole('option')).toHaveCount(0)
      await expect(owner).toBeFocused()
      await page.keyboard.press('Escape')
      await expect(page.getByRole('dialog')).toHaveCount(0)
      await expect(opener).toBeFocused()
    }
  })
}
