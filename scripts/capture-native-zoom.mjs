import { chromium, expect } from '@playwright/test'
import { mkdtemp, writeFile, rm, mkdir } from 'node:fs/promises'
// Actual Chromium browser zoom through an isolated, temporary extension/profile.
// Start the production preview on strict port 4372 before running this script.
const output = 'docs/images/vesper-2.0.0'
await mkdir(output, { recursive: true })
const extension = await mkdtemp('/tmp/watchlight-zoom-extension-')
await writeFile(
  `${extension}/manifest.json`,
  JSON.stringify({
    manifest_version: 3,
    name: 'Local Watchlight zoom verification',
    version: '1.0',
    permissions: ['tabs'],
    background: { service_worker: 'background.js' },
  }),
)
await writeFile(
  `${extension}/background.js`,
  'chrome.runtime.onInstalled.addListener(() => {});',
)
const profile = await mkdtemp('/tmp/watchlight-zoom-profile-')
const context = await chromium.launchPersistentContext(profile, {
  channel: 'chromium',
  headless: true,
  viewport: null,
  args: [
    `--disable-extensions-except=${extension}`,
    `--load-extension=${extension}`,
    '--window-size=1440,1000',
  ],
})
async function screenshot(page, file) {
  console.log(`Capturing ${file}`)
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.effect?.getComputedTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished.catch(() => {})),
    ),
  )
  console.log('Animations settled')
  const cdp = await page.context().newCDPSession(page)
  // Chromium tab zoom changes CSS pixels; capture the viewport without Playwright's CSS clip.
  const { data } = await Promise.race([
    cdp.send('Page.captureScreenshot', { format: 'png', fromSurface: false }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Screenshot timeout')), 10000),
    ),
  ])
  await writeFile(`${output}/${file}`, Buffer.from(data, 'base64'))
  await cdp.detach()
}
try {
  const worker =
    context.serviceWorkers()[0] || (await context.waitForEvent('serviceworker'))
  const page = context.pages()[0]
  await page.goto('http://127.0.0.1:4372')
  const before = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    dpr: devicePixelRatio,
  }))
  const zoom = await worker.evaluate(async () => {
    const tabs = await chrome.tabs.query({})
    const tab = tabs.find((t) => t.url?.startsWith('http://127.0.0.1:4372'))
    await chrome.tabs.setZoom(tab.id, 2)
    return chrome.tabs.getZoom(tab.id)
  })
  await expect
    .poll(() => page.evaluate(() => devicePixelRatio))
    .toBe(before.dpr * 2)
  const after = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    dpr: devicePixelRatio,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(zoom).toBe(2)
  expect(after.width).toBe(before.width / 2)
  expect(after.scrollWidth).toBeLessThanOrEqual(after.width)
  await page.evaluate(() => document.fonts.ready)
  await screenshot(page, 'native-zoom-200-dashboard.png')
  await page
    .getByRole('button', { name: 'Review first urgent unassigned issue' })
    .click()
  await expect(page.locator('.detail-body')).toBeVisible()
  expect(
    await page
      .locator('.detail-body')
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true)
  await screenshot(page, 'native-zoom-200-detail.png')
  const field = page.getByRole('combobox', {
    name: 'Response owner',
    exact: true,
  })
  await field.focus()
  await field.press('Enter')
  await page
    .getByRole('option', {
      name: 'Mara Ellery · Central communications',
      exact: true,
    })
    .click()
  await page.getByRole('button', { name: 'Save owner', exact: true }).click()
  await page.getByRole('button', { name: 'Acknowledge', exact: true }).click()
  await page.getByRole('button', { name: 'Resolve issue', exact: true }).click()
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Reopen issue', exact: true }),
  ).toBeVisible()
  await expect(page.locator('.activity-list')).toContainText(
    'Assigned to Mara Ellery.',
  )
  await expect(page.getByTestId('count-open')).toHaveText('14')
  await page.getByRole('button', { name: 'Close issue detail' }).click()
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click()
  await page
    .getByRole('button', { name: 'Reset demo data', exact: true })
    .click()
  await page.reload()
  await expect(page.getByTestId('count-open')).toHaveText('15')
  await expect(page.getByTestId('count-unassigned')).toContainText('8')
  await expect(page.getByTestId('count-overdue')).toHaveText('3')
  await expect(page.getByTestId('count-coverage')).toHaveText('72')
  const evidence = {
    method:
      'Actual Chromium chrome.tabs.setZoom(2), isolated temporary profile/extension, no CSS zoom or viewport emulation',
    zoom,
    before,
    after,
    flows:
      'Owner assignment, acknowledge, resolve, reload persistence, confirmed reset and reload passed',
    screenshots: [
      'native-zoom-200-dashboard.png',
      'native-zoom-200-detail.png',
    ],
  }
  await writeFile(
    `${output}/native-zoom.json`,
    JSON.stringify(evidence, null, 2) + '\n',
  )
  console.log(JSON.stringify(evidence))
} finally {
  await context.close()
  await rm(profile, { recursive: true, force: true })
  await rm(extension, { recursive: true, force: true })
}
