import { describe, expect, it } from 'vitest'
import { articles, owners, brands, seedIssues, SNAPSHOT, WINDOW_START, createSeedState, selectScope, deadlineMinutes, deadlineLabel, ageLabel, assignOwner, changeStatus, parseSavedState } from '../src/domain'

describe('fictional deterministic dataset', () => {
  it('contains consistent distinct entities and syndicated coverage within the fixed 48h window', () => {
    expect(articles).toHaveLength(72)
    expect(seedIssues).toHaveLength(18)
    expect(owners).toHaveLength(5)
    expect(brands).toHaveLength(3)
    expect(new Set(articles.map(a => a.id)).size).toBe(72)
    expect(new Set(articles.map(a => a.originalStoryId)).size).toBe(54)
    expect(articles.filter(a => a.isSyndicated)).toHaveLength(18)
    for (const copy of articles.filter(a => a.isSyndicated)) {
      const originals = articles.filter(a => a.originalStoryId === copy.originalStoryId && !a.isSyndicated)
      expect(originals).toHaveLength(1)
      expect(Date.parse(copy.publishedAt)).toBeGreaterThanOrEqual(Date.parse(originals[0]!.publishedAt))
    }
    expect(Math.max(...articles.filter(a => a.issueId === 'issue-01').map(a => Date.parse(a.publishedAt)))).toBe(Date.parse(SNAPSHOT) - 15 * 60000)
    for (const article of articles) {
      expect(seedIssues.some(i => i.id === article.issueId)).toBe(true)
      expect(Date.parse(article.publishedAt)).toBeGreaterThanOrEqual(Date.parse(WINDOW_START))
      expect(Date.parse(article.publishedAt)).toBeLessThanOrEqual(Date.parse(SNAPSHOT))
    }
  })
})
describe('scope and denominators', () => {
  it('counts distinct open issues and article volume separately', () => {
    const scope = selectScope(seedIssues)
    expect(scope.counts).toEqual({ open: 15, unassigned: 8, overdue: 3, coverage: 72 })
    expect(scope.issues).toHaveLength(18)
    expect(scope.issues[0]?.id).toBe('issue-01')
    expect(scope.hourly.reduce((sum,h) => sum + h.count,0)).toBe(72)
    expect(scope.openByBrand.reduce((sum,b) => sum + b.count,0)).toBe(15)
  })
  it('uses matching articles for region membership without duplicating issues', () => {
    const scope = selectScope(seedIssues, { region: 'Europe' })
    expect(scope.issues).toHaveLength(18)
    expect(new Set(scope.issues.map(i => i.id)).size).toBe(18)
    expect(scope.articles.every(a => a.region === 'Europe')).toBe(true)
    expect(scope.counts.coverage).toBe(scope.articles.length)
    expect(scope.counts.open).toBe(15)
    expect(scope.hourly.reduce((sum,h) => sum + h.count,0)).toBe(scope.articles.length)
  })
  it('combines all issue filters with article membership consistently', () => {
    const scope = selectScope(seedIssues, { brand: 'Echo Live', severity: 'high', status: 'new', region: 'North America' })
    expect(scope.issues.map(i => i.id)).toEqual(['issue-05', 'issue-11'])
    expect(scope.articles.every(a => ['issue-05','issue-11'].includes(a.issueId) && a.region === 'North America')).toBe(true)
    expect(scope.counts.open).toBe(2)
    expect(scope.counts.unassigned).toBe(1)
  })
  it('supports empty and resolved-only scopes with honest zero open counts', () => {
    expect(selectScope(seedIssues, { brand: 'Folio Press', region: 'Asia Pacific' }).counts).toEqual({ open: 0, unassigned: 0, overdue: 0, coverage: 0 })
    const resolved = selectScope(seedIssues, { status: 'resolved' })
    expect(resolved.issues).toHaveLength(3)
    expect(resolved.counts).toEqual({ open: 0, unassigned: 0, overdue: 0, coverage: 12 })
  })
})
describe('fixed-clock deadlines', () => {
  it('remains tied to snapshot and handles boundary exactly', () => {
    expect(deadlineMinutes(seedIssues[0]!)).toBe(-90)
    expect(deadlineMinutes(SNAPSHOT)).toBe(0)
    expect(deadlineLabel(SNAPSHOT)).toBe('Due now')
    expect(deadlineLabel('2025-10-21T16:25:00Z')).toBe('Due in 25m')
    expect(deadlineLabel(seedIssues[0]!)).toBe('1h 30m overdue')
    expect(ageLabel('2025-10-21T15:45:00Z')).toBe('15m ago')
    const issues = createSeedState().issues
    issues[0]!.deadline = SNAPSHOT
    expect(selectScope(issues).counts.overdue).toBe(2)
  })
})
describe('local response state', () => {
  it('separates ownership and status and retains history through reopen', () => {
    const seed = createSeedState()
    const assigned = assignOwner(seed, 'issue-01', 'owner-01')
    expect(seed.issues[0]!.ownerId).toBeNull()
    expect(assigned.issues[0]!.status).toBe('new')
    expect(selectScope(assigned.issues).counts.unassigned).toBe(7)
    const acknowledged = changeStatus(assigned, 'issue-01', 'acknowledged')
    expect(selectScope(acknowledged.issues).counts.open).toBe(15)
    const resolved = changeStatus(acknowledged, 'issue-01', 'resolved')
    expect(selectScope(resolved.issues).counts).toEqual({ open: 14, unassigned: 7, overdue: 2, coverage: 72 })
    const reopened = changeStatus(resolved, 'issue-01', 'new')
    expect(reopened.issues[0]!.ownerId).toBe('owner-01')
    expect(reopened.activity.map(a => a.kind)).toEqual(['assignment','status','status','status'])
    expect(selectScope(reopened.issues).counts.open).toBe(15)
    expect(assignOwner(reopened, 'issue-01', null).issues[0]!.status).toBe('new')
  })
  it('rejects invalid updates and avoids no-op history', () => {
    const state = createSeedState()
    expect(() => assignOwner(state, 'issue-01', 'not-an-owner')).toThrow()
    expect(() => changeStatus(state, 'missing', 'resolved')).toThrow()
    expect(assignOwner(state, 'issue-01', null)).toBe(state)
    expect(changeStatus(state, 'issue-01', 'new')).toBe(state)
  })
  it('round trips saved state, reconstructs immutable content, and rejects corrupt state', () => {
    const state = changeStatus(assignOwner(createSeedState(), 'issue-01', 'owner-02'), 'issue-01', 'acknowledged')
    expect(parseSavedState(JSON.stringify(state))).toEqual(state)
    const tampered = structuredClone(state)
    tampered.issues[0]!.title = 'Untrusted saved title'
    expect(parseSavedState(JSON.stringify(tampered)).issues[0]!.title).toBe(seedIssues[0]!.title)
    for (const raw of ['bad json','null','{}',JSON.stringify({ ...state, version: 2 }),JSON.stringify({ ...state, issues: [state.issues[0]] })]) expect(() => parseSavedState(raw)).toThrow()
    state.issues[0]!.ownerId = 'missing-owner'
    expect(() => parseSavedState(JSON.stringify(state))).toThrow()
    expect(createSeedState().activity).toEqual([])
  })
})
