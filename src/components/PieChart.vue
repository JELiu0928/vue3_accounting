<script setup lang="ts">
import { defineProps, computed, type PropType } from 'vue'

import { Pie } from 'vue-chartjs' // 引入 Vue 封裝的 Pie 組件
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, PieController } from 'chart.js'

// 註冊所需的 Chart.js 組件
ChartJS.register(ArcElement, Tooltip, Legend, Title, PieController)

interface PieChartData {
	labels: string[]
	datasets: Array<{ label: string; data: number[] }>
}
const props = defineProps({
	pieChartData: {
		type: Object as PropType<PieChartData>, // 明確指定類型
		required: true,
	},
})
// const props = defineProps<{
// 	pieChartData: ChartData
// 	//   colors?: string[]
// }>()
// 處理圖表數據
const chartData = computed(() => {
	if (!props.pieChartData) return null

	return {
		labels: props.pieChartData.labels,
		datasets: props.pieChartData.datasets.map((dataset) => ({
			...dataset,
			// 可以在這裡添加額外的樣式設置
			borderWidth: 1,
			hoverOffset: 4,
		})),
	}
})

// 圖表配置選項
const options = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: {
		legend: {
			position: 'top' as const,
			labels: {
				padding: 10,
				font: {
					size: 12,
				},
			},
		},
		tooltip: {
			callbacks: {
				label: function (context: any) {
					const label = context.label || ''
					const value = context.raw || 0
					const total = context.dataset.data.reduce(
						(acc: number, curr: number) => acc + curr,
						0,
					)
					const percentage = ((value / total) * 100).toFixed(1)
					return `${label}: ${value.toLocaleString()} 元 (${percentage}%)`
				},
			},
		},
		title: {
			display: true,
			text: '圓餅圖',
			font: {
				size: 16,
			},
			padding: {
				top: 8,
				bottom: 8,
			},
		},
	},
}
</script>

<template>
	<div>
		<Pie v-if="chartData" :data="chartData" :options="options" />
	</div>
</template>
<style scoped>
p {
	color: var(--color-second);
	font-weight: bold;
}
</style>
