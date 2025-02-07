import { ref, onMounted, watch } from 'vue';
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
let chartInstance = null;
const props = defineProps();
console.log(props);
// Vue3 + Vite 環境下使用 Chart.js，需要手動註冊模組
Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
const chartCanvas = ref(null);
const renderChart = () => {
    //利用ref取得canvas，以操作js
    const canvas = chartCanvas.value;
    // 設定較高解析度，防止模糊
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = 800 * pixelRatio; // 內部解析度變寬
        canvas.height = 600 * pixelRatio;
        ctx && ctx.scale(pixelRatio, pixelRatio);
        // nextTick(() => {
        if (chartInstance) {
            chartInstance.destroy();
        }
        const { labels, incomeData, expenseData } = props.lineChartData;
        // console.log('labesls ',labels,'incomeData',incomeData,'expenseData',expenseData)
        chartInstance = new Chart(canvas, {
            type: 'line',
            data: {
                labels,
                datasets: [incomeData, expenseData]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            autoSkip: false, // 禁止自動隱藏標籤
                            maxRotation: 0, // 防止標籤旋轉，讓它們直列顯示
                            minRotation: 0
                        }
                    }
                }
            }
        });
    }
};
// watch(() => props.expenseList, renderChart, { deep: true });
watch(() => props.lineChartData, renderChart, { deep: true });
onMounted(() => {
    renderChart();
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
        ref: ("chartCanvas"),
    });
    // @ts-ignore navigation for `const chartCanvas = ref()`
    /** @type { typeof __VLS_ctx.chartCanvas } */ ;
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'chartCanvas': __VLS_nativeElements['canvas'],
    };
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
            chartCanvas: chartCanvas,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
    __typeRefs: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
