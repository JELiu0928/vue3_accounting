/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { defineProps, computed } from 'vue';
import { Pie } from 'vue-chartjs'; // 引入 Vue 封裝的 Pie 組件
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, PieController } from 'chart.js';
// 註冊所需的 Chart.js 組件
ChartJS.register(ArcElement, Tooltip, Legend, Title, PieController);
const props = defineProps({
    pieChartData: {
        type: Object, // 明確指定類型
        required: true,
    },
});
// const props = defineProps<{
// 	pieChartData: ChartData
// 	//   colors?: string[]
// }>()
// 處理圖表數據
const chartData = computed(() => {
    if (!props.pieChartData)
        return null;
    return {
        labels: props.pieChartData.labels,
        datasets: props.pieChartData.datasets.map((dataset) => ({
            ...dataset,
            // 可以在這裡添加額外的樣式設置
            borderWidth: 1,
            hoverOffset: 4,
        })),
    };
});
// 圖表配置選項
const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                padding: 10,
                font: {
                    size: 12,
                },
            },
        },
        tooltip: {
            callbacks: {
                label: function (context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${label}: ${value.toLocaleString()} 元 (${percentage}%)`;
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
}; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    if (__VLS_ctx.chartData) {
        const __VLS_0 = {}.Pie;
        /** @type { [typeof __VLS_components.Pie, ] } */ ;
        // @ts-ignore
        const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
            data: ((__VLS_ctx.chartData)),
            options: ((__VLS_ctx.options)),
        }));
        const __VLS_2 = __VLS_1({
            data: ((__VLS_ctx.chartData)),
            options: ((__VLS_ctx.options)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    }
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {};
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            Pie: Pie,
            chartData: chartData,
            options: options,
        };
    },
    props: {
        pieChartData: {
            type: Object, // 明確指定類型
            required: true,
        },
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        pieChartData: {
            type: Object, // 明確指定類型
            required: true,
        },
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
