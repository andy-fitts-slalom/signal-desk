// Historical Meridian-release capture recipe; run only at that historical revision.
// For current Vesper screenshots use capture-vesper.mjs; preserve archived evidence.
// Serve `npm run preview -- --port 4372 --strictPort` first.
import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
const baseURL = 'http://127.0.0.1:4372'
const output = 'docs/images/meridian-1.0.0'
await mkdir(output, { recursive: true })
const browser = await chromium.launch()
const records = []
const errors = []
async function open(width, height = 900, query = '', deviceScaleFactor = 1) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor,
    reducedMotion: 'reduce',
  })
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto(baseURL + '/' + query)
  await expect(page.locator('html')).toHaveAttribute('data-ms-theme', 'dark')
  await expect(page.locator('.ms-brand__mark')).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
  return page
}
async function shot(page, file, state) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .map((animation) => animation.finished.catch(() => {})),
    ),
  )
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  )
  await page.screenshot({ path: `${output}/${file}.png` })
  records.push({
    file: `${file}.png`,
    viewport: page.viewportSize(),
    devicePixelRatio: await page.evaluate(() => window.devicePixelRatio),
    state,
    reducedMotion: true,
    url: page.url().replace(baseURL, ''),
    capture: 'Chromium viewport screenshot, local production build',
  })
}
async function select(page, name, option) {
  const field = page.getByRole('combobox', { name, exact: true })
  await field.focus()
  await field.press('Enter')
  await page.getByRole('option', { name: option, exact: true }).click()
}
const desktop = await open(1440, 1000)
await shot(
  desktop,
  'desktop-1440',
  'Original snapshot; 15 open, 8 unassigned, 3 overdue, 72 articles',
)
await desktop.getByTestId('open-issue-01').click()
await shot(
  desktop,
  'detail-1440',
  'Urgent unassigned SD-01; desktop side detail',
)
await select(desktop, 'Response owner', 'Mara Ellery · Central communications')
await desktop.getByRole('button', { name: 'Save owner', exact: true }).click()
await desktop.getByRole('button', { name: 'Acknowledge', exact: true }).click()
await desktop
  .getByRole('button', { name: 'Resolve issue', exact: true })
  .click()
await desktop.locator('.activity-list').scrollIntoViewIfNeeded()
await shot(
  desktop,
  'activity-1440',
  'SD-01 assigned, acknowledged, resolved; grouped evidence and ordered local activity',
)
await desktop.close()
for (const width of [320, 390, 768]) {
  const page = await open(width, 900)
  await shot(
    page,
    `dashboard-${width}`,
    'Original snapshot; responsive masthead, filters and scoped metrics',
  )
  await page
    .locator('#queue')
    .evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await shot(
    page,
    `queue-${width}`,
    'Original snapshot; response queue and targets',
  )
  await page.getByTestId('open-issue-01').click()
  await shot(
    page,
    `detail-${width}`,
    'SD-01; full-width phone detail or desktop side detail at 768px',
  )
  if (width === 390) {
    await page
      .getByRole('combobox', { name: 'Response owner', exact: true })
      .focus()
    await page.keyboard.press('Enter')
    await shot(
      page,
      'owner-picker-390',
      'Open keyboard-focused owner picker; all local owner choices',
    )
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Acknowledge', exact: true }).click()
    await shot(
      page,
      'snackbar-390',
      'Local acknowledgment feedback; no shared-state claim',
    )
  }
  await page.getByRole('button', { name: 'Close issue detail' }).click()
  await select(page, 'Brand', 'Folio Press')
  await select(page, 'Region', 'Asia Pacific')
  await page.locator('.empty-state').scrollIntoViewIfNeeded()
  await shot(
    page,
    `empty-${width}`,
    'Folio Press + Asia Pacific; zero scoped issues/articles with clear recovery',
  )
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click()
  if (width === 390)
    await shot(
      page,
      'reset-confirm-390',
      'Reset confirmation; keep changes or explicit restore',
    )
  await page.getByRole('button', { name: 'Keep changes' }).click()
  await page.evaluate(() => localStorage.setItem('signal-desk:v1', '{broken'))
  await page.goto(baseURL)
  await shot(
    page,
    `corrupt-${width}`,
    'Corrupt saved state; seed fallback and visible Retry save',
  )
  await page.getByRole('button', { name: 'Retry save' }).click()
  await page.getByTestId('open-issue-01').click()
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage blocked', 'QuotaExceededError')
    }
  })
  await page.getByRole('button', { name: 'Acknowledge', exact: true }).click()
  await page.getByRole('button', { name: 'Close issue detail' }).click()
  await page.getByRole('alert').scrollIntoViewIfNeeded()
  await shot(
    page,
    `blocked-${width}`,
    'Failed storage write; in-memory acknowledgment with retry action',
  )
  await page.close()
}
const zoom = await open(720, 500, '', 2)
await shot(
  zoom,
  'zoom-200-1440',
  '200% browser-zoom reflow proxy: 720x500 CSS pixels at DPR2, 1440x1000 output; not native browser zoom certification',
)
await zoom.getByTestId('open-issue-01').click()
await shot(
  zoom,
  'zoom-detail-200-1440',
  'SD-01 at 200% browser-zoom reflow proxy (720x500 CSS pixels, DPR2)',
)
await zoom.close()
await browser.close()
await writeFile(
  `${output}/manifest.json`,
  JSON.stringify(
    {
      environment: 'Local production build at 127.0.0.1:4372',
      errors,
      screenshots: records,
    },
    null,
    2,
  ) + '\n',
)
if (errors.length) throw new Error(errors.join('\n'))
console.log(`Captured ${records.length} screens; no browser page errors.`)
