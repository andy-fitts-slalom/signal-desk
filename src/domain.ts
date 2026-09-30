import articleData from './data/articles.json'
import issueData from './data/issues.json'
import ownerData from './data/owners.json'
import brandData from './data/brands.json'

export type Severity = 'critical' | 'high' | 'normal'
export type Status = 'new' | 'acknowledged' | 'resolved'
export interface Issue { id: string; title: string; brand: string; topic: string; severity: Severity; status: Status; ownerId: string | null; deadline: string; severityReason: string }
export interface Article { id: string; issueId: string; headline: string; excerpt: string; outlet: string; publishedAt: string; region: string; channel: string; originalStoryId: string }
export interface Owner { id: string; name: string; team: string }
export interface Activity { id: string; issueId: string; kind: 'assignment' | 'status'; at: string; message: string }
export interface DemoState { version: 1; issues: Issue[]; activity: Activity[] }
export interface Filters { brand: string; region: string; severity: string; status: string }
export const SNAPSHOT = '2025-10-21T16:00:00.000Z'
export const WINDOW_START = '2025-10-19T16:00:00.000Z'
export const brands: string[] = brandData
export const owners: Owner[] = ownerData
export const articles: Article[] = articleData
export const seedIssues = issueData as Issue[]
export const regions = ['North America', 'Europe', 'Asia Pacific']
export const EMPTY_FILTERS: Filters = { brand: '', region: '', severity: '', status: '' }
export function createSeedState(): DemoState { return { version: 1, issues: structuredClone(seedIssues), activity: [] } }
export function deadlineMinutes(issue: Issue | string): number { return (Date.parse(typeof issue === 'string' ? issue : issue.deadline) - Date.parse(SNAPSHOT)) / 60000 }
export function deadlineLabel(issue: Issue | string): string {
  const minutes = deadlineMinutes(issue)
  const abs = Math.abs(minutes)
  const duration = abs < 60 ? `${Math.round(abs)}m` : `${Math.floor(abs / 60)}h${abs % 60 ? ` ${Math.round(abs % 60)}m` : ''}`
  return minutes < 0 ? `${duration} overdue` : minutes === 0 ? 'Due now' : `Due in ${duration}`
}
export function ageLabel(timestamp: string): string {
  const minutes = Math.max(0, Math.floor((Date.parse(SNAPSHOT) - Date.parse(timestamp)) / 60000))
  return minutes < 60 ? `${minutes}m ago` : `${Math.floor(minutes / 60)}h ago`
}
export function latestCoverage(issueId: string): Article | undefined { return articles.filter(a => a.issueId === issueId).sort((a,b) => b.publishedAt.localeCompare(a.publishedAt))[0] }
const priority: Record<Severity, number> = { critical: 0, high: 1, normal: 2 }
export function selectScope(issues: Issue[], filters: Partial<Filters> = {}) {
  const windowArticles = articles.filter(a => a.publishedAt >= WINDOW_START && a.publishedAt <= SNAPSHOT && (!filters.region || a.region === filters.region))
  const membership = new Set(windowArticles.map(a => a.issueId))
  const scopedIssues = issues.filter(i => membership.has(i.id) && (!filters.brand || i.brand === filters.brand) && (!filters.severity || i.severity === filters.severity) && (!filters.status || i.status === filters.status))
    .sort((a,b) => Number(a.status === 'resolved') - Number(b.status === 'resolved') || priority[a.severity] - priority[b.severity] || a.deadline.localeCompare(b.deadline) || a.id.localeCompare(b.id))
  const ids = new Set(scopedIssues.map(i => i.id))
  const scopedArticles = windowArticles.filter(a => ids.has(a.issueId))
  const open = scopedIssues.filter(i => i.status !== 'resolved')
  const hourly = Array.from({ length: 48 }, (_, index) => {
    const start = Date.parse(WINDOW_START) + index * 3600000
    return { at: new Date(start).toISOString(), count: scopedArticles.filter(a => { const time = Date.parse(a.publishedAt); return time >= start && (index === 47 ? time <= start + 3600000 : time < start + 3600000) }).length }
  })
  return { issues: scopedIssues, articles: scopedArticles, counts: { open: open.length, unassigned: open.filter(i => !i.ownerId).length, overdue: open.filter(i => deadlineMinutes(i) < 0).length, coverage: scopedArticles.length }, hourly, openByBrand: brands.map(brand => ({ brand, count: open.filter(i => i.brand === brand).length })) }
}
function transition(state: DemoState, issueId: string, kind: Activity['kind'], update: Partial<Issue>, message: string): DemoState {
  if (!state.issues.some(i => i.id === issueId)) throw new Error('This issue could not be found. Reset the demo and try again.')
  return { version: 1, issues: state.issues.map(i => i.id === issueId ? { ...i, ...update } : { ...i }), activity: [...state.activity, { id: `activity-${state.activity.length + 1}`, issueId, kind, at: SNAPSHOT, message }] }
}
export function assignOwner(state: DemoState, issueId: string, ownerId: string | null): DemoState {
  const owner = owners.find(o => o.id === ownerId)
  if (ownerId !== null && !owner) throw new Error('Choose a valid response owner.')
  const issue = state.issues.find(i => i.id === issueId)
  if (issue && issue.ownerId === ownerId) return state
  return transition(state, issueId, 'assignment', { ownerId }, owner ? `Assigned to ${owner.name}.` : 'Owner removed; issue is unassigned.')
}
export function changeStatus(state: DemoState, issueId: string, status: Status): DemoState {
  if (!['new', 'acknowledged', 'resolved'].includes(status)) throw new Error('Choose a valid status.')
  const issue = state.issues.find(i => i.id === issueId)
  if (issue && issue.status === status) return state
  const message = status === 'new' ? 'Reopened for review.' : status === 'acknowledged' ? 'Acknowledged; reviewed, with work still open.' : 'Resolved in this local demo.'
  return transition(state, issueId, 'status', { status }, message)
}
/** Reject incompatible/corrupt storage and reconstruct immutable content from the fictional seed. */
export function parseSavedState(raw: string): DemoState {
  const saved: unknown = JSON.parse(raw)
  if (!saved || typeof saved !== 'object') throw new Error('Saved demo data is invalid.')
  const candidate = saved as Record<string, unknown>
  if (candidate.version !== 1 || !Array.isArray(candidate.issues) || candidate.issues.length !== seedIssues.length || !Array.isArray(candidate.activity)) throw new Error('Saved demo data is incompatible. Reset to recover.')
  const records = candidate.issues as Record<string, unknown>[]
  if (records.some(i => !i || typeof i !== 'object') || new Set(records.map(i => i.id)).size !== seedIssues.length) throw new Error('Saved issues are invalid.')
  const issues = seedIssues.map(seed => {
    const savedIssue = records.find(i => i.id === seed.id)
    if (!savedIssue || !['new','acknowledged','resolved'].includes(String(savedIssue.status)) || !(savedIssue.ownerId === null || owners.some(o => o.id === savedIssue.ownerId))) throw new Error('Saved issue state is invalid.')
    return { ...seed, status: savedIssue.status as Status, ownerId: savedIssue.ownerId as string | null }
  })
  const activity: Activity[] = candidate.activity.map((record: unknown) => {
    if (!record || typeof record !== 'object') throw new Error('Saved activity is invalid.')
    const a = record as Record<string, unknown>
    if (typeof a.id !== 'string' || !seedIssues.some(i => i.id === a.issueId) || !['assignment','status'].includes(String(a.kind)) || a.at !== SNAPSHOT || typeof a.message !== 'string' || a.message.length > 300) throw new Error('Saved activity is invalid.')
    return { id: a.id, issueId: a.issueId as string, kind: a.kind as Activity['kind'], at: a.at as string, message: a.message }
  })
  return { version: 1, issues, activity }
}
