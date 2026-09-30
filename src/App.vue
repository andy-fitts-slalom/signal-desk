<script setup lang="ts">
import SignalChart from './components/SignalChart.vue'
</script>
<template><v-app><v-main><div class="shell"><p class="eyebrow">MERIDIAN SIGNAL GROUP / COMMUNICATIONS</p><h1>Signal Desk<span class="heading-dot">.</span></h1><p>Media response workspace · Fictional demonstration</p><v-card class="panel">The response queue is being prepared.</v-card><SignalChart :labels="['Aster Stream', 'Folio Digital', 'Gather Live']" :values="[0,0,0]" kind="bar" summary="Application structure preview" /></div></v-main></v-app></template>
