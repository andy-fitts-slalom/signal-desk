<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import * as echarts from 'echarts/core'
import { meridianChartStyle } from '@meridian/ui/charts'
import { tokens } from '@meridian/ui'
const chartStyle = meridianChartStyle('dark')
const seriesColor = tokens.themes.dark.action
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
echarts.use([
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  CanvasRenderer,
])
const props = defineProps<{
  labels: string[]
  values: number[]
  kind: 'line' | 'bar'
  summary: string
}>()
const root = ref<HTMLDivElement>()
let chart: echarts.ECharts | undefined
let observer: ResizeObserver | undefined
function draw() {
  chart?.setOption(
    {
      animation: false,
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: chartStyle.fontFamily,
        color: chartStyle.text,
        fontSize: 12,
      },
      grid: {
        left: 36,
        right: 12,
        top: 12,
        bottom: props.kind === 'line' ? 48 : 32,
      },
      tooltip: { ...chartStyle.tooltip, trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: props.labels,
        axisLine: { lineStyle: { color: chartStyle.grid } },
        axisTick: { show: false },
        axisLabel: {
          color: chartStyle.axis,
          fontSize: 12,
          interval: props.kind === 'bar' ? 0 : 11,
          hideOverlap: true,
          formatter: (value: string) =>
            props.kind === 'line' ? value.replace(', ', '\n') : value,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: chartStyle.axis, fontSize: 12 },
        splitLine: { lineStyle: { color: chartStyle.grid, type: 'dashed' } },
      },
      series: [
        {
          type: props.kind,
          data: props.values,
          barMaxWidth: 35,
          itemStyle: { color: seriesColor, borderRadius: [4, 4, 0, 0] },
          lineStyle: { width: 2, color: seriesColor },
          symbol: 'none',
          areaStyle:
            props.kind === 'line'
              ? { color: seriesColor, opacity: 0.08 }
              : undefined,
        },
      ],
    },
    true,
  )
}
onMounted(() => {
  chart = echarts.init(root.value)
  observer = new ResizeObserver(() => chart?.resize())
  observer.observe(root.value!)
  draw()
  // Canvas must redraw after the locally hosted face becomes available.
  document.fonts.ready.then(() => {
    if (chart && !chart.isDisposed()) draw()
  })
})
watch(() => [props.values, props.labels], draw, { deep: true })
onBeforeUnmount(() => {
  observer?.disconnect()
  chart?.dispose()
})
</script>
<template>
  <div ref="root" class="chart" role="img" :aria-label="summary"></div>
</template>
