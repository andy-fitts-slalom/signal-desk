<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue'
import SignalChart from './components/SignalChart.vue'
import { VesperBrand, VesperBadge, VesperEmpty } from '@vesper/ui/vue'
import {
  articles,
  owners,
  brands,
  regions,
  SNAPSHOT,
  EMPTY_FILTERS,
  createSeedState,
  selectScope,
  assignOwner,
  changeStatus,
  parseSavedState,
  deadlineLabel,
  deadlineMinutes,
  ageLabel,
} from './domain'
import type { DemoState, Filters, Status, Issue } from './domain'
const severityTone = {
  critical: 'danger',
  high: 'warning',
  normal: 'neutral',
} as const
const statusTone = {
  new: 'info',
  acknowledged: 'warning',
  resolved: 'success',
} as const
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
const reduceMotion = ref(motionPreference.matches)
function syncMotionPreference(event: MediaQueryListEvent) {
  reduceMotion.value = event.matches
}
motionPreference.addEventListener('change', syncMotionPreference)
onBeforeUnmount(() =>
  motionPreference.removeEventListener('change', syncMotionPreference),
)
// Keep the original key so existing saved assignments, statuses and history survive the rebrand.
const STORAGE_KEY = 'signal-desk:v1'
const state = ref<DemoState>(createSeedState())
const storageError = ref('')
const validation = ref('')
const notice = ref('')
const storageBlocked = ref(false)
try {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (raw) state.value = parseSavedState(raw)
} catch {
  storageError.value =
    'Saved demo data could not be loaded. Seed data is shown. Reset to recover, or retry saving your current view.'
  storageBlocked.value = true
}
const filters = reactive<Filters>({ ...EMPTY_FILTERS })
const selectedId = ref<string | null>(null)
let detailOpener: HTMLElement | null = null
function restoreDetailFocus() {
  const target = detailOpener?.isConnected
    ? detailOpener
    : document.getElementById('queue')
  target?.focus({ preventScroll: true })
  detailOpener = null
}
const invalidLink = ref(false)
function readUrl() {
  const params = new URLSearchParams(location.search)
  const options: Record<keyof Filters, string[]> = {
    brand: brands,
    region: regions,
    severity: ['critical', 'high', 'normal'],
    status: ['new', 'acknowledged', 'resolved'],
  }
  for (const key of Object.keys(filters) as (keyof Filters)[])
    filters[key] = options[key].includes(params.get(key) || '')
      ? params.get(key)!
      : ''
  const requested = params.get('issue')
  selectedId.value = state.value.issues.some((i) => i.id === requested)
    ? requested
    : null
  invalidLink.value = Boolean(requested && !selectedId.value)
}
readUrl()
function syncUrl() {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(filters))
    if (value) params.set(key, value)
  if (selectedId.value) params.set('issue', selectedId.value)
  history.replaceState(
    null,
    '',
    `${location.pathname}${params.size ? '?' + params : ''}`,
  )
}
watch([filters, selectedId], syncUrl, { deep: true })
window.addEventListener('popstate', readUrl)
onBeforeUnmount(() => window.removeEventListener('popstate', readUrl))
const scope = computed(() => selectScope(state.value.issues, filters))
const selected = computed(() =>
  state.value.issues.find((i) => i.id === selectedId.value),
)
const dialog = computed({
  get: () => Boolean(selected.value),
  set: (open: boolean) => {
    if (!open) selectedId.value = null
  },
})
const ownerDraft = ref<string | null>(null)
const ownerMenu = ref(false)
function closeOwnerMenuOnEscape(event: KeyboardEvent) {
  if (event.key !== 'Escape' || !ownerMenu.value) return
  // A no-motion VSelect can leave the overlay stack before this same Escape
  // reaches the parent dialog. Handle only the open nested picker here.
  event.preventDefault()
  event.stopPropagation()
  ownerMenu.value = false
  nextTick(() =>
    document.getElementById('response-owner')?.focus({ preventScroll: true }),
  )
}
watch(selectedId, () => {
  ownerMenu.value = false
  ownerDraft.value = selected.value?.ownerId ?? null
  validation.value = ''
})
ownerDraft.value = selected.value?.ownerId ?? null
const undo = ref<{ id: string; status: Status } | null>(null)
const resetDialog = ref(false)
const countDefinitions = [
  {
    key: 'open' as const,
    label: 'Open issues',
    icon: '$mdi-inbox-outline',
    note: 'Distinct issues · new + acknowledged',
  },
  {
    key: 'unassigned' as const,
    label: 'Unassigned open',
    icon: '$mdi-account-outline',
    note: 'Open issues without a response owner',
  },
  {
    key: 'overdue' as const,
    label: 'Overdue open',
    icon: '$mdi-clock-alert-outline',
    note: 'Open issues · deadline before 09:00 PDT',
  },
  {
    key: 'coverage' as const,
    label: 'Coverage items',
    icon: '$mdi-text-box-multiple-outline',
    note: 'Articles in the 48-hour snapshot window',
  },
]
const scopeLabel = computed(
  () =>
    Object.values(filters).filter(Boolean).map(label).join(' / ') ||
    'All brands / All regions / All severities / All statuses',
)
const activeFilters = computed(() => Object.values(filters).some(Boolean))
const urgentUnassigned = computed(() =>
  scope.value.issues.filter(
    (i) => i.status !== 'resolved' && !i.ownerId && i.severity !== 'normal',
  ),
)
const issueArticles = computed(() =>
  articles
    .filter((a) => a.issueId === selectedId.value)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
)
const groups = computed(() =>
  [...new Set(issueArticles.value.map((a) => a.originalStoryId))].map((id) => ({
    id,
    items: issueArticles.value.filter((a) => a.originalStoryId === id),
  })),
)
const activity = computed(() =>
  state.value.activity
    .filter((a) => a.issueId === selectedId.value)
    .slice()
    .reverse(),
)
const ownerOptions = [
  { title: 'Unassigned', value: null },
  ...owners.map((o) => ({ title: `${o.name} · ${o.team}`, value: o.id })),
]
const chartLabels = computed(() =>
  scope.value.hourly.map((h) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
    }).format(new Date(h.at)),
  ),
)
const hourlySummary = computed(
  () =>
    `${scope.value.counts.coverage} articles in 48 hourly buckets in the selected scope. Peak ${Math.max(...scope.value.hourly.map((h) => h.count), 0)} articles per hour.`,
)
const brandSummary = computed(() =>
  scope.value.openByBrand
    .map((b) => `${b.brand}: ${b.count} open issues`)
    .join('; '),
)
function label(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value))
}
function ownerName(id: string | null) {
  return owners.find((o) => o.id === id)?.name || 'Unassigned'
}
function initials(id: string | null) {
  return (
    owners
      .find((o) => o.id === id)
      ?.name.split(' ')
      .map((n) => n[0])
      .join('') || '—'
  )
}
function latestInScope(issue: Issue) {
  return scope.value.articles
    .filter((a) => a.issueId === issue.id)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0]
}
function coverageCount(id: string) {
  return scope.value.articles.filter((a) => a.issueId === id).length
}
function openIssue(id: string) {
  detailOpener =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  selectedId.value = id
  invalidLink.value = false
}
function clearFilters() {
  Object.assign(filters, EMPTY_FILTERS)
}
function persist(force = false) {
  if (storageBlocked.value && !force) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
    storageError.value = ''
    storageBlocked.value = false
  } catch {
    storageError.value =
      'Changes are active in this tab but could not be saved. Allow browser storage and retry before reloading.'
  }
}
function saveOwner() {
  if (!selected.value) return
  try {
    state.value = assignOwner(state.value, selected.value.id, ownerDraft.value)
    persist()
    notice.value = `Owner updated to ${ownerName(ownerDraft.value)}. Status unchanged.`
    validation.value = ''
  } catch (e) {
    validation.value = (e as Error).message
  }
}
function setStatus(status: Status) {
  if (!selected.value) return
  try {
    undo.value = { id: selected.value.id, status: selected.value.status }
    state.value = changeStatus(state.value, selected.value.id, status)
    persist()
    notice.value = `Issue ${status === 'new' ? 'reopened' : status} in this browser.`
    validation.value = ''
  } catch (e) {
    validation.value = (e as Error).message
  }
}
function undoStatus() {
  if (!undo.value) return
  state.value = changeStatus(state.value, undo.value.id, undo.value.status)
  undo.value = null
  persist()
  notice.value = 'Previous status restored. Ownership retained.'
}
function reset() {
  state.value = createSeedState()
  storageBlocked.value = false
  persist()
  clearFilters()
  selectedId.value = null
  undo.value = null
  resetDialog.value = false
  notice.value = 'Demo reset. Original issues and coverage restored.'
}
</script>

<template>
  <v-app
    ><a class="skip-link" href="#queue">Skip to issue queue</a
    ><v-main>
      <div class="topline">
        <VesperBrand />
        <VesperBadge class="demo-badge">Fictional demonstration</VesperBadge>
      </div>
      <div class="shell">
        <header class="page-header">
          <div>
            <p class="eyebrow">COMMUNICATIONS / RESPONSE OPERATIONS</p>
            <h1>Watchlight<span class="heading-dot">.</span></h1>
            <p class="subtitle">See the story. Coordinate the response.</p>
          </div>
          <div class="header-tools">
            <div class="snapshot">
              <span class="snapshot-label">FIXED DEMO SNAPSHOT</span
              ><strong>Oct 21, 2025 <span>·</span> 09:00 PDT</strong>
            </div>
            <v-btn
              variant="outlined"
              prepend-icon="$mdi-restore"
              size="small"
              @click="resetDialog = true"
              >Reset demo</v-btn
            >
          </div>
        </header>
        <v-alert
          v-if="storageError"
          type="warning"
          variant="tonal"
          class="mb-5"
          role="alert"
          >{{ storageError
          }}<template #append
            ><v-btn size="small" @click="persist(true)"
              >Retry save</v-btn
            ></template
          ></v-alert
        >
        <v-alert
          v-if="invalidLink"
          type="info"
          variant="tonal"
          class="mb-5"
          closable
          @click:close="invalidLink = false"
          >That issue link is unavailable. Select an issue from the queue
          below.</v-alert
        >
        <section class="filters" aria-label="Filter selected scope">
          <div class="filter-controls">
            <span class="filter-icon"
              ><v-icon icon="$mdi-filter-variant" size="20" /><span
                >Scope</span
              ></span
            >
            <v-select
              :transition="reduceMotion ? false : undefined"
              v-model="filters.brand"
              label="Brand"
              :items="[
                { title: 'All brands', value: '' },
                ...brands.map((b) => ({ title: b, value: b })),
              ]"
            />
            <v-select
              :transition="reduceMotion ? false : undefined"
              v-model="filters.region"
              label="Region"
              :items="[
                { title: 'All regions', value: '' },
                ...regions.map((r) => ({ title: r, value: r })),
              ]"
            />
            <v-select
              :transition="reduceMotion ? false : undefined"
              v-model="filters.severity"
              label="Severity"
              :items="[
                { title: 'All severities', value: '' },
                ...['critical', 'high', 'normal'].map((s) => ({
                  title: label(s),
                  value: s,
                })),
              ]"
            />
            <v-select
              :transition="reduceMotion ? false : undefined"
              v-model="filters.status"
              label="Status"
              :items="[
                { title: 'All statuses', value: '' },
                ...['new', 'acknowledged', 'resolved'].map((s) => ({
                  title: label(s),
                  value: s,
                })),
              ]"
            />
            <v-btn
              variant="text"
              size="small"
              :disabled="!activeFilters"
              @click="clearFilters"
              >Clear all</v-btn
            >
          </div>
          <div class="scope-caption">
            <span><span class="tiny-dot"></span> {{ scopeLabel }}</span
            ><span>Oct 19, 09:00 – Oct 21, 09:00 PDT · 48 hours</span>
          </div>
        </section>
        <section
          class="stats"
          aria-label="Selected scope summary"
          aria-live="polite"
        >
          <v-card
            v-for="card in countDefinitions"
            :key="card.key"
            :class="['stat-card', card.key]"
            variant="flat"
            ><div class="stat-top">
              <span>{{ card.label }}</span
              ><v-icon :icon="card.icon" size="19" />
            </div>
            <div class="stat-value" :data-testid="`count-${card.key}`">
              {{ scope.counts[card.key]
              }}<span
                v-if="card.key === 'unassigned' && scope.counts.unassigned"
                class="stat-tag"
                >Needs an owner</span
              >
            </div>
            <p>{{ card.note }}</p></v-card
          >
        </section>
        <div class="workspace-grid">
          <section
            id="queue"
            class="queue panel"
            tabindex="-1"
            aria-labelledby="queue-title"
          >
            <div class="section-heading">
              <div>
                <div class="section-title">
                  <h2 id="queue-title">Response queue</h2>
                  <span class="number-pill">{{ scope.issues.length }}</span>
                </div>
                <p>Open first, then severity and earliest deadline.</p>
              </div>
              <span class="live-local"
                ><span class="tiny-dot"></span> Local workspace</span
              >
            </div>
            <div v-if="urgentUnassigned.length" class="attention">
              <v-icon icon="$mdi-account-alert-outline" size="19" /><span
                ><strong
                  >{{ urgentUnassigned.length }} urgent
                  {{
                    urgentUnassigned.length === 1
                      ? 'issue needs'
                      : 'issues need'
                  }}
                  an owner.</strong
                >
                Start with the highest-priority story.</span
              ><button
                @click="openIssue(urgentUnassigned[0]!.id)"
                aria-label="Review first urgent unassigned issue"
              >
                Review <v-icon icon="$mdi-arrow-top-right" size="16" />
              </button>
            </div>
            <div v-if="scope.issues.length" class="queue-scroll">
              <table class="issue-table">
                <caption class="vs-sr-only">
                  Prioritized issues in the selected scope
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Issue / brand</th>
                    <th scope="col">Owner / status</th>
                    <th scope="col">Deadline</th>
                    <th scope="col" aria-label="Open detail"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="issue in scope.issues"
                    :key="issue.id"
                    :class="{ 'resolved-row': issue.status === 'resolved' }"
                  >
                    <td>
                      <div class="issue-meta">
                        <VesperBadge
                          :class="['severity', issue.severity]"
                          :tone="severityTone[issue.severity]"
                          >{{ label(issue.severity) }}</VesperBadge
                        ><span>{{ issue.brand }}</span
                        ><span class="issue-id">{{
                          issue.id.replace('issue-', 'WL-')
                        }}</span>
                      </div>
                      <button
                        class="issue-title"
                        :data-testid="`open-${issue.id}`"
                        @click="openIssue(issue.id)"
                      >
                        {{ issue.title }}
                      </button>
                      <div class="coverage-meta">
                        {{ coverageCount(issue.id) }} articles
                        <span>·</span> Latest
                        {{ ageLabel(latestInScope(issue)!.publishedAt) }}
                      </div>
                    </td>
                    <td>
                      <div :class="['owner-name', { unowned: !issue.ownerId }]">
                        <span class="avatar">{{ initials(issue.ownerId) }}</span
                        >{{ ownerName(issue.ownerId) }}
                      </div>
                      <VesperBadge
                        class="status"
                        :tone="statusTone[issue.status]"
                        >{{ label(issue.status) }}</VesperBadge
                      >
                    </td>
                    <td>
                      <span
                        :class="[
                          'deadline',
                          {
                            late:
                              issue.status !== 'resolved' &&
                              deadlineMinutes(issue) < 0,
                          },
                        ]"
                        ><v-icon
                          :icon="
                            issue.status === 'resolved'
                              ? '$mdi-check-circle-outline'
                              : '$mdi-clock-outline'
                          "
                          size="14"
                        />
                        {{
                          issue.status === 'resolved'
                            ? 'Completed'
                            : deadlineLabel(issue)
                        }}</span
                      ><span class="deadline-date"
                        >{{ formatTime(issue.deadline) }} PDT</span
                      >
                    </td>
                    <td>
                      <v-btn
                        icon="$mdi-chevron-right"
                        variant="text"
                        size="small"
                        :aria-label="`Inspect ${issue.title}`"
                        @click="openIssue(issue.id)"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <VesperEmpty
              v-else
              class="empty-state"
              title="No issues in this scope"
              description="Try another region or clear your filters to see the full response queue."
            >
              <v-btn variant="outlined" @click="clearFilters"
                >Clear filters</v-btn
              >
            </VesperEmpty>
            <div class="queue-footer">
              <span
                >{{ scope.issues.length }} distinct issues ·
                {{ scope.counts.coverage }} coverage items</span
              ><span>All times relative to the demo snapshot</span>
            </div>
          </section>
          <aside class="insights" aria-label="Supporting coverage insights">
            <v-card class="panel chart-panel"
              ><p class="eyebrow">COVERAGE PULSE</p>
              <h2>Hourly volume</h2>
              <p class="chart-description">
                Articles in selected scope · last 48h
              </p>
              <SignalChart
                :labels="chartLabels"
                :values="scope.hourly.map((h) => h.count)"
                kind="line"
                :summary="hourlySummary"
              />
              <p class="chart-summary">{{ hourlySummary }}</p></v-card
            >
            <v-card class="panel chart-panel"
              ><p class="eyebrow">RESPONSE LOAD</p>
              <h2>Open issues by brand</h2>
              <p class="chart-description">
                Distinct new + acknowledged issues
              </p>
              <SignalChart
                :labels="scope.openByBrand.map((b) => b.brand.split(' ')[0]!)"
                :values="scope.openByBrand.map((b) => b.count)"
                kind="bar"
                :summary="brandSummary"
              />
              <ul class="brand-key">
                <li v-for="brand in scope.openByBrand" :key="brand.brand">
                  <span>{{ brand.brand }}</span
                  ><strong>{{ brand.count }}</strong>
                </li>
              </ul></v-card
            >
            <div class="scope-note">
              <v-icon icon="$mdi-information-outline" size="17" />
              <div>
                <strong>One issue. Multiple stories.</strong>
                <p>
                  Region filters match articles first, then include each related
                  issue once. Syndicated copies count as articles, not separate
                  original stories.
                </p>
              </div>
            </div>
          </aside>
        </div>
        <footer class="page-footer">
          <span
            ><span class="tiny-dot"></span> Fictional data. Real workflow.</span
          ><span
            >Saved only in this browser · No shared state or notifications</span
          >
        </footer>
      </div>
      <v-dialog
        :transition="reduceMotion ? false : undefined"
        v-model="dialog"
        class="detail-dialog"
        @after-leave="restoreDetailFocus"
        scrollable
        aria-labelledby="detail-title"
      >
        <v-card v-if="selected" class="detail-card"
          ><div class="detail-top">
            <span class="eyebrow"
              >ISSUE DETAIL / {{ selected.id.replace('issue-', 'WL-') }}</span
            ><v-btn
              icon="$mdi-close"
              aria-label="Close issue detail"
              variant="text"
              size="small"
              @click="dialog = false"
            />
          </div>
          <v-card-text class="detail-body"
            ><div class="issue-meta">
              <VesperBadge
                :class="['severity', selected.severity]"
                :tone="severityTone[selected.severity]"
                >{{ label(selected.severity) }}</VesperBadge
              ><span>{{ selected.brand }}</span
              ><VesperBadge
                class="status"
                :tone="statusTone[selected.status]"
                >{{ label(selected.status) }}</VesperBadge
              >
            </div>
            <h2 id="detail-title">{{ selected.title }}</h2>
            <p class="topic">
              {{ selected.topic }} <span>·</span>
              {{
                selected.status === 'resolved'
                  ? 'Completed'
                  : deadlineLabel(selected)
              }}
              <span>·</span> {{ formatDate(selected.deadline) }}
            </p>
            <section
              :class="[
                'severity-explainer',
                `vs-tone-${severityTone[selected.severity]}`,
              ]"
            >
              <h3>Why this matters</h3>
              <p>{{ selected.severityReason }}</p>
              <span>Editorial severity label · not an AI score</span>
            </section>
            <section class="detail-section">
              <h3>Coordinate the response</h3>
              <p class="muted">
                Assigning an owner does not change the issue’s status.
              </p>
              <div class="owner-form" @keydown.capture="closeOwnerMenuOnEscape">
                <v-select
                  :transition="reduceMotion ? false : undefined"
                  id="response-owner"
                  v-model="ownerDraft"
                  v-model:menu="ownerMenu"
                  :menu-props="{
                    contentProps: { onKeydownCapture: closeOwnerMenuOnEscape },
                  }"
                  label="Response owner"
                  :items="ownerOptions"
                /><v-btn
                  color="primary"
                  :disabled="ownerDraft === selected.ownerId"
                  @click="saveOwner"
                  >Save owner</v-btn
                >
              </div>
              <v-alert
                v-if="validation"
                type="error"
                variant="tonal"
                role="alert"
                >{{ validation }}</v-alert
              >
              <div class="response-buttons">
                <v-btn
                  v-if="selected.status === 'new'"
                  variant="outlined"
                  prepend-icon="$mdi-check"
                  @click="setStatus('acknowledged')"
                  >Acknowledge</v-btn
                ><v-btn
                  v-if="selected.status !== 'resolved'"
                  variant="tonal"
                  color="success"
                  prepend-icon="$mdi-check-all"
                  @click="setStatus('resolved')"
                  >Resolve issue</v-btn
                ><v-btn
                  v-else
                  variant="outlined"
                  prepend-icon="$mdi-undo"
                  @click="setStatus('new')"
                  >Reopen issue</v-btn
                ><v-btn
                  v-if="undo?.id === selected.id"
                  variant="text"
                  size="small"
                  @click="undoStatus"
                  >Undo status change</v-btn
                >
              </div>
              <p class="action-help">
                Acknowledged = reviewed. Resolved = work complete. Demo actions
                are local; no alerts are sent.
              </p>
            </section>
            <section class="detail-section">
              <div class="section-title">
                <h3>Supporting coverage</h3>
                <span class="number-pill">{{ issueArticles.length }}</span>
              </div>
              <p class="muted">
                {{ groups.length }} original stories ·
                {{ issueArticles.length }} articles including syndicated copies
              </p>
              <p v-if="filters.region" class="context-note">
                Showing all evidence for this issue. Articles outside
                {{ filters.region }} are marked and excluded from the filtered
                dashboard counts.
              </p>
              <div v-for="group in groups" :key="group.id" class="story-group">
                <p class="story-group-label">
                  {{ group.id }}
                  <span
                    >{{ group.items.length }}
                    {{
                      group.items.length === 1 ? 'article' : 'articles'
                    }}</span
                  >
                </p>
                <article
                  v-for="article in group.items"
                  :key="article.id"
                  class="coverage-item"
                >
                  <div class="article-meta">
                    <strong>{{ article.outlet }}</strong
                    ><span>{{ article.channel }}</span
                    ><span v-if="article.isSyndicated" class="syndicated"
                      >Syndicated copy</span
                    >
                  </div>
                  <h4>{{ article.headline }}</h4>
                  <p>{{ article.excerpt }}</p>
                  <div class="article-time">
                    {{ formatDate(article.publishedAt) }} · {{ article.region
                    }}<span
                      v-if="filters.region && article.region !== filters.region"
                    >
                      · Outside selected region</span
                    >
                  </div>
                </article>
              </div>
            </section>
            <section class="detail-section">
              <h3>Activity history</h3>
              <p class="muted">
                Local demo actions · sequence shown newest first at the fixed
                clock
              </p>
              <ol v-if="activity.length" class="activity-list">
                <li v-for="item in activity" :key="item.id">
                  <v-icon
                    :icon="
                      item.kind === 'assignment'
                        ? '$mdi-account-outline'
                        : '$mdi-check-circle-outline'
                    "
                    size="16"
                  />
                  <div>
                    {{ item.message }}<small>{{ formatDate(item.at) }}</small>
                  </div>
                </li>
              </ol>
              <p v-else class="activity-empty">
                No local changes yet. Assignments and status updates will appear
                here.
              </p>
            </section>
          </v-card-text>
          <div class="detail-bottom">
            <v-icon icon="$mdi-laptop" size="16" />
            {{
              storageError
                ? 'Changes may not survive a reload'
                : 'Browser-local demonstration'
            }}<v-btn variant="text" size="small" @click="dialog = false"
              >Back to queue</v-btn
            >
          </div></v-card
        >
      </v-dialog>
      <v-dialog
        :transition="reduceMotion ? false : undefined"
        v-model="resetDialog"
        max-width="420"
        aria-labelledby="reset-title"
        ><v-card class="reset-card"
          ><h2 id="reset-title">Reset this demonstration?</h2>
          <p>
            This restores all 18 original issues and removes the assignments and
            activity saved in this browser. Filters will be cleared.
          </p>
          <div>
            <v-btn variant="text" @click="resetDialog = false"
              >Keep changes</v-btn
            ><v-btn color="primary" @click="reset">Reset demo data</v-btn>
          </div></v-card
        ></v-dialog
      >
      <v-snackbar
        :model-value="Boolean(notice)"
        :timeout="4500"
        @update:model-value="notice = ''"
        >{{ notice
        }}<template #actions
          ><v-btn variant="text" @click="notice = ''">Dismiss</v-btn></template
        ></v-snackbar
      >
    </v-main></v-app
  >
</template>
