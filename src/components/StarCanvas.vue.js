import { ref, onMounted } from 'vue';
const canvasRef = ref(null);
// 設置畫布寬度/長度為瀏覽器寬度/長度的 3 倍
const canvasWidth = window.innerWidth * 3;
const canvasHeight = window.innerHeight * 3;
const initCanvas = () => {
    const canvas = canvasRef.value;
    if (!canvas)
        return;
    // 畫布繪圖上下文
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    // 設置背景
    ctx.fillStyle = '#090a29';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    // 繪製星星：遍歷畫布的大部分區域
    for (let i = 1; i < 1000; i++) {
        for (let j = 1; j < 1000; j++) {
            // 使用隨機偏移來打破網格感
            const randomOffsetX = i * Math.random() * canvasWidth * 0.05;
            const randomOffsetY = j * Math.random() * canvasHeight * 0.05;
            // 星星大小隨機
            const radius = Math.random();
            // 創建放射性漸變
            const gradient = ctx.createRadialGradient(randomOffsetX, randomOffsetY, 0, randomOffsetX, randomOffsetY, radius * 5);
            // 漸變顏色 0是中心 往1(邊緣)漸變
            gradient.addColorStop(0, '#fffbea');
            gradient.addColorStop(1, '#050515');
            // 繪製星星
            ctx.beginPath();
            ctx.arc(randomOffsetX, randomOffsetY, radius, 0, 2 * Math.PI);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }
};
onMounted(() => {
    initCanvas();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("container") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("starry-sky") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({
        ref: ("canvasRef"),
        width: ((__VLS_ctx.canvasWidth)),
        height: ((__VLS_ctx.canvasHeight)),
        ...{ class: ("star-canvas") },
    });
    // @ts-ignore navigation for `const canvasRef = ref()`
    /** @type { typeof __VLS_ctx.canvasRef } */ ;
    ['container', 'starry-sky', 'star-canvas',];
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'canvasRef': __VLS_nativeElements['canvas'],
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
            canvasRef: canvasRef,
            canvasWidth: canvasWidth,
            canvasHeight: canvasHeight,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeRefs: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
