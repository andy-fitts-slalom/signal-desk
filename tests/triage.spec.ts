import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function counts(page: Page, expected: number[]) {
  for (const [index, key] of [
    'open',
    'unassigned',
    'overdue',
    'coverage',
  ].entries()) {
    await expect(page.getByTestId(`count-${key}`)).toHaveText(
      new RegExp(`^${expected[index]}(?:Needs an owner)?$`),
    )
  }
}
async function select(page: Page, name: string, option: string) {
  await page.getByRole('combobox', { name, exact: true }).focus()
  await page.getByRole('combobox', { name, exact: true }).press('Enter')
  await page.getByRole('option', { name: option, exact: true }).click()
}

test('urgent triage preserves ownership, status, counts and activity through reload and confirmed reset', async ({
  page,
}) => {
  await page.goto('/')
  await counts(page, [15, 8, 3, 72])
  await page
    .getByRole('button', { name: 'Review first urgent unassigned issue' })
    .click()
  await expect(page).toHaveURL(/issue=issue-01/)
  await expect(
    page.getByRole('heading', { name: 'Supporting coverage' }),
  ).toBeVisible()
  await expect(
    page.getByText(
      '3 original stories · 4 articles including syndicated copies',
    ),
  ).toBeVisible()
  await select(page, 'Response owner', 'Mara Ellery · Central communications')
  await page.getByRole('button', { name: 'Save owner', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Acknowledge', exact: true }),
  ).toBeVisible()
  await counts(page, [15, 7, 3, 72])
  await page.getByRole('button', { name: 'Acknowledge', exact: true }).click()
  await counts(page, [15, 7, 3, 72])
  await page.getByRole('button', { name: 'Resolve issue', exact: true }).click()
  await counts(page, [14, 7, 2, 72])
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Reopen issue', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.activity-list')).toContainText(
    'Assigned to Mara Ellery.',
  )
  await counts(page, [14, 7, 2, 72])
  await page.getByRole('button', { name: 'Reopen issue', exact: true }).click()
  await counts(page, [15, 7, 3, 72])
  await page
    .getByRole('button', { name: 'Undo status change', exact: true })
    .click()
  await counts(page, [14, 7, 2, 72])
  await page.getByRole('button', { name: 'Close issue detail' }).click()
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click()
  await page.getByRole('button', { name: 'Keep changes' }).click()
  await counts(page, [14, 7, 2, 72])
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click()
  await page
    .getByRole('button', { name: 'Reset demo data', exact: true })
    .click()
  await counts(page, [15, 8, 3, 72])
  await page.reload()
  await counts(page, [15, 8, 3, 72])
})

test('region scope counts distinct issues, survives detail reload, and clears an empty combination', async ({
  page,
}) => {
  await page.goto('/')
  await select(page, 'Region', 'Europe')
  await counts(page, [15, 8, 3, 29])
  await expect(page.locator('.issue-table tbody tr')).toHaveCount(18)
  await page.getByTestId('open-issue-01').click()
  await page.reload()
  await expect(page).toHaveURL(/region=Europe.*issue=issue-01/)
  await expect(
    page.getByText('Showing all evidence for this issue.', { exact: false }),
  ).toBeVisible()
  await expect(
    page.getByText('Outside selected region', { exact: false }).first(),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Close issue detail' }).click()
  await expect(
    page.getByRole('combobox', { name: 'Region', exact: true }),
  ).toHaveValue('Europe')
  await select(page, 'Brand', 'Folio Press')
  await select(page, 'Region', 'Asia Pacific')
  await counts(page, [0, 0, 0, 0])
  await expect(
    page.getByRole('heading', { name: 'No issues in this scope' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click()
  await counts(page, [15, 8, 3, 72])
})

test('corrupt saved data recovers with explicit retry and invalid links remain usable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('signal-desk:v1', '{broken')
  })
  await page.goto('/?issue=missing')
  await expect(
    page.getByRole('alert').filter({ hasText: 'Saved demo' }),
  ).toContainText('Saved demo data could not be loaded')
  await expect(
    page.getByText('That issue link is unavailable.', { exact: false }),
  ).toBeVisible()
  await counts(page, [15, 8, 3, 72])
  await page.getByRole('button', { name: 'Retry save' }).click()
  await expect(page.getByRole('button', { name: 'Retry save' })).toHaveCount(0)
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('signal-desk:v1')!),
  )
  expect(saved.issues).toHaveLength(18)
})

test('blocked writes keep changes active and retry persists them', async ({
  page,
}) => {
  await page.goto('/?issue=issue-01')
  await page.evaluate(() => {
    const original = Storage.prototype.setItem
    ;(window as any).__restoreStorage = () => {
      Storage.prototype.setItem = original
    }
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage blocked', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: 'Acknowledge', exact: true }).click()
  await expect(page.locator('.detail-bottom')).toContainText(
    'Changes may not survive a reload',
  )
  await page.getByRole('button', { name: 'Close issue detail' }).click()
  await expect(page.getByRole('alert')).toContainText('could not be saved')
  await page.evaluate(() => (window as any).__restoreStorage())
  await page.getByRole('button', { name: 'Retry save' }).click()
  await page.reload()
  await page.getByTestId('open-issue-01').click()
  await expect(page.locator('.detail-body > .issue-meta')).toContainText(
    'Acknowledged',
  )
})

for (const width of [390, 320]) {
  test(`phone ${width}px supports queue, filters and full-width detail without horizontal overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
    await page.getByTestId('open-issue-01').click()
    await expect(
      page.getByRole('heading', { name: 'Coordinate the response' }),
    ).toBeVisible()
    const box = await page.locator('.detail-card').boundingBox()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(width)
    expect(
      await page
        .locator('.detail-body')
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true)
    await page.getByRole('button', { name: 'Close issue detail' }).click()
    await select(page, 'Region', 'Asia Pacific')
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width)
  })
}

test('dashboard and detail pass automated accessibility basics and keyboard dismissal', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Watchlight.' })).toBeVisible()
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([])
  await page.getByTestId('open-issue-01').focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('.detail-dialog .v-overlay__content')).toHaveCSS(
    'opacity',
    '1',
  )
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
    ).violations,
  ).toEqual([])
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.getByTestId('open-issue-01')).toBeFocused()
})

test('nested direct issue load refreshes and closing detail preserves queue position', async ({
  page,
}) => {
  await page.goto('/queue?region=Europe&issue=issue-01')
  await expect(
    page.getByRole('heading', { name: 'Subscription feature claims spread' }),
  ).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('heading', { name: 'Subscription feature claims spread' }),
  ).toBeVisible()
  await counts(page, [15, 8, 3, 29])
  await page.getByRole('button', { name: 'Close issue detail' }).click()
  const opener = page.getByTestId('open-issue-18')
  await opener.scrollIntoViewIfNeeded()
  await opener.focus()
  const priorScroll = await page.evaluate(() => window.scrollY)
  await opener.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(opener).toBeFocused()
  expect(
    Math.abs((await page.evaluate(() => window.scrollY)) - priorScroll),
  ).toBeLessThanOrEqual(2)
  await expect(page).toHaveURL(/\/queue\?region=Europe$/)
})
