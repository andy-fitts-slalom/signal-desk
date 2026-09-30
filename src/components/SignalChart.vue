<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from 'vue'
import * as echarts from 'echarts/core'
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
      textStyle: { fontFamily: 'system-ui' },
      grid: { left: 30, right: 12, top: 12, bottom: 26 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#222a35',
        borderColor: '#465160',
        textStyle: { color: '#fff' },
      },
      xAxis: {
        type: 'category',
        data: props.labels,
        axisLine: { lineStyle: { color: '#343e4d' } },
        axisTick: { show: false },
        axisLabel: {
          color: '#aab6c8',
          fontSize: 10,
          interval: props.kind === 'bar' ? 0 : 11,
        },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: '#aab6c8', fontSize: 10 },
        splitLine: { lineStyle: { color: '#29313e', type: 'dashed' } },
      },
      series: [
        {
          type: props.kind,
          data: props.values,
          barMaxWidth: 35,
          itemStyle: { color: '#bedbb4', borderRadius: [4, 4, 0, 0] },
          lineStyle: { width: 2, color: '#bedbb4' },
          symbol: 'none',
          areaStyle:
            props.kind === 'line'
              ? { color: '#bedbb4', opacity: 0.08 }
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
