import { ref, defineProps, computed, defineEmits, nextTick, watch } from 'vue';
import Tree from 'primevue/tree';
import { ElDatePicker, ElConfigProvider } from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import PieChart from './PieChart.vue';
import Excel from './Excel.vue';
const props = defineProps();
// console.log('List____props',props)
// console.log('List____props.allCategoryArr',props.allCategoryArr)
// //#region interface ___ start
// nextTick(()=>{
//     console.log('nextTick____props.allCategoryArr',props.allCategoryArr)
//     console.log('nextTick____props.allCategoryArr.value',props.allCategoryArr.value)
// })
watch(props.allCategoryArr, (newVal) => {
    console.log("allCategoryArr 變動了:", newVal);
}, { deep: true });
//#endregion
const showPieChart = ref(false);
const locale = zhCn;
//定義事件
const emit = defineEmits(['editExpense', 'removeExpense']);
// 獲取當月的第一天和最後一天
const getDateRange = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    return [startOfMonth, endOfMonth];
};
const [rangeStart, rangeEnd] = getDateRange();
// console.log('r===', rangeStart, rangeEnd)
const start_date = ref(rangeStart);
const end_date = ref(rangeEnd);
const dateRange = ref(rangeStart && rangeEnd ? [rangeStart, rangeEnd] : undefined);
// console.log('date', dateRange.value)
const selectedShowType = ref('show_expense');
let categories = [
    { id: 1, cate: '飲食' },
    { id: 2, cate: '日常' },
    { id: 3, cate: '交通' },
    { id: 4, cate: '娛樂' },
    { id: 5, cate: '其它' },
    // { id: 6, cate: '股票' },
    // { id: 7, cate: '其它2' },
    // { id: 8, cate: '其它3' },
    { id: 999, cate: '未分類' },
];
const costomCate = JSON.parse(localStorage.getItem('customCate') || '[]');
categories = [...categories, ...costomCate];
// 
console.log('categories', categories);
const calculateTreeData = function (list, startDate, endDate, showType) {
    // 存放每個分類的帳目
    const categoryMap = new Map();
    // 圓餅圖的結構
    const chartData = { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    // console.log('lsit', list)
    const filteredList = list.filter((expense) => {
        // console.log('expense', expense)
        const expenseDate = new Date(expense.date);
        const isInDateRange = startDate <= expenseDate && expenseDate <= endDate;
        const isCorrectType = showType === 'show_expense' ? expense.type === 'expense' : expense.type === 'income';
        return isInDateRange && isCorrectType;
    });
    // nextTick(()=>{
    filteredList.forEach((expense) => {
        console.log('props.allCategoryArr.value=========', props.allCategoryArr);
        if (!categoryMap.has(expense.category)) {
            const category = props.allCategoryArr.find((c) => c.id === expense.category);
            // const category = categories.find((c: Category_id) => c.id === expense.category)
            // console.log('==22=', category)
            // tree結構
            categoryMap.set(expense.category, {
                key: `category-${expense.category}`, // 節點的唯一識別碼
                label: category ? category.cate : '未分類', // 顯示的名稱
                type: 'category', // 節點類型
                total: 0, // 該分類的總金額
                expanded: true, // 是否展開該分類節點
                children: [], // 該分類底下的支出項目
            });
        }
        const categoryNode = categoryMap.get(expense.category);
        //子節點
        categoryNode.children.push({
            key: expense.id,
            id: expense.id,
            type: expense.type,
            date: expense.date,
            description: expense.description,
            amount: String(expense.amount),
            category: expense.category,
        });
        categoryNode.total += parseInt(expense.amount);
    });
    // })
    console.log('categoryMap', categoryMap);
    //日期排序：舊~新
    categoryMap.forEach((category) => {
        //轉時間戳之後大小排序
        category.children.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    // 處理圓餅圖資料
    categoryMap.forEach((category) => {
        // console.log('===', category)
        chartData.labels.push(category.label);
        chartData.datasets[0].data.push(category.total);
        chartData.datasets[0].backgroundColor.push(getRandomColor());
    });
    return {
        tree: Array.from(categoryMap.values()),
        chart: chartData,
    };
};
const pieChartData = computed(() => {
    const { chart } = calculateTreeData(props.expenseList || [], start_date.value, end_date.value, selectedShowType.value);
    return chart;
});
const treeData = computed(() => {
    return calculateTreeData(props.expenseList || [], start_date.value, end_date.value, selectedShowType.value).tree;
});
// console.log('treeData=', treeData)
// console.log('treeData value=', treeData.value)
watch([props.expenseList, start_date, end_date], () => {
    console.log('treeData 已更新', treeData);
    console.log('treeData value已更新', treeData.value);
});
const searchByDateRange = function (type) {
    if (type == 'custom') {
        if (!dateRange.value || dateRange.value.length !== 2)
            return;
        const [newStartDate, newEndDate] = dateRange.value;
        start_date.value = new Date(newStartDate.setHours(0, 0, 0, 0));
        end_date.value = new Date(newEndDate.setHours(23, 59, 59, 999));
        // console.log(start_date.value, '-----', end_date.value)
    }
    else if (type == 'today') {
        const today = new Date();
        start_date.value = new Date(today.setHours(0, 0, 0, 0));
        end_date.value = new Date(today.setHours(23, 59, 59, 999));
        dateRange.value = [start_date.value, end_date.value];
        console.log('==', start_date.value, end_date.value);
    }
    else if (type == 'month') {
        const [rangeStart, rangeEnd] = getDateRange();
        start_date.value = new Date(rangeStart);
        end_date.value = new Date(rangeEnd);
        dateRange.value = [start_date.value, end_date.value];
    }
};
const edit = function (expense) {
    console.log('sss', expense);
    emit('editExpense', expense);
};
const remove = function (expense) {
    emit('removeExpense', expense);
};
const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
// 讓整行分類可展開收合
// const expandedKeys = ref({}) // 存放展開狀態
const expandedKeys = ref({}); // 初始化為空對象
const toggleCategory = (node) => {
    // console.log('node', node)
    if (node.type === 'category') {
        const key = node.key;
        // console.log('key,', key)
        // 切換展開/收合
        if (expandedKeys.value[key]) {
            delete expandedKeys.value[key]; // 收合
        }
        else {
            expandedKeys.value[key] = true; // 展開
        }
        // 讓 Vue 重新計算，確保 UI 變更
        expandedKeys.value = { ...expandedKeys.value };
        // console.log('expandedKeys', expandedKeys)
        // console.log('分類', node.label, '展開狀態：', expandedKeys.value)
    }
};
const isTreeDataReady = ref(false);
// 在計算屬性變化時，使用 nextTick 等待計算完成
nextTick(() => {
    if (treeData.value.length > 0) {
        isTreeDataReady.value = true;
    }
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    if (__VLS_ctx.showPieChart) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal_content") },
        });
        if (__VLS_ctx.pieChartData.labels.length > 0) {
            // @ts-ignore
            /** @type { [typeof PieChart, ] } */ ;
            // @ts-ignore
            const __VLS_0 = __VLS_asFunctionalComponent(PieChart, new PieChart({
                pieChartData: ((__VLS_ctx.pieChartData)),
            }));
            const __VLS_1 = __VLS_0({
                pieChartData: ((__VLS_ctx.pieChartData)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_0));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.showPieChart)))
                        return;
                    __VLS_ctx.showPieChart = false;
                } },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("date_range_area") },
    });
    const __VLS_5 = {}.ElConfigProvider;
    /** @type { [typeof __VLS_components.ElConfigProvider, typeof __VLS_components.elConfigProvider, typeof __VLS_components.ElConfigProvider, typeof __VLS_components.elConfigProvider, ] } */ ;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent(__VLS_5, new __VLS_5({
        locale: ((__VLS_ctx.locale)),
    }));
    const __VLS_7 = __VLS_6({
        locale: ((__VLS_ctx.locale)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const __VLS_11 = {}.ElDatePicker;
    /** @type { [typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ] } */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(__VLS_11, new __VLS_11({
        modelValue: ((__VLS_ctx.dateRange)),
        type: (('daterange')),
        rangeSeparator: ("至"),
        startPlaceholder: ("開始日期"),
        endPlaceholder: ("結束日期"),
        defaultValue: (([new Date(), new Date()])),
    }));
    const __VLS_13 = __VLS_12({
        modelValue: ((__VLS_ctx.dateRange)),
        type: (('daterange')),
        rangeSeparator: ("至"),
        startPlaceholder: ("開始日期"),
        endPlaceholder: ("結束日期"),
        defaultValue: (([new Date(), new Date()])),
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    __VLS_10.slots.default;
    var __VLS_10;
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.searchByDateRange('custom');
            } },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.searchByDateRange('today');
            } },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.searchByDateRange('month');
            } },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("type_area") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("radio"),
        name: ("show_type"),
        id: ("show_expense"),
        value: ("show_expense"),
        checked: (true),
    });
    (__VLS_ctx.selectedShowType);
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: ("show_expense"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("radio"),
        name: ("show_type"),
        id: ("show_income"),
        value: ("show_income"),
    });
    (__VLS_ctx.selectedShowType);
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: ("show_income"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("search_area") },
    });
    if (__VLS_ctx.isTreeDataReady) {
        // @ts-ignore
        /** @type { [typeof Excel, ] } */ ;
        // @ts-ignore
        const __VLS_17 = __VLS_asFunctionalComponent(Excel, new Excel({
            treeData: ((__VLS_ctx.treeData)),
        }));
        const __VLS_18 = __VLS_17({
            treeData: ((__VLS_ctx.treeData)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showPieChart = !__VLS_ctx.showPieChart;
            } },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card") },
    });
    const __VLS_22 = {}.Tree;
    /** @type { [typeof __VLS_components.Tree, typeof __VLS_components.Tree, ] } */ ;
    // @ts-ignore
    const __VLS_23 = __VLS_asFunctionalComponent(__VLS_22, new __VLS_22({
        ...{ 'onNodeClick': {} },
        value: ((__VLS_ctx.treeData)),
        ...{ class: ("expense_tree") },
        expandedKeys: ((__VLS_ctx.expandedKeys)),
    }));
    const __VLS_24 = __VLS_23({
        ...{ 'onNodeClick': {} },
        value: ((__VLS_ctx.treeData)),
        ...{ class: ("expense_tree") },
        expandedKeys: ((__VLS_ctx.expandedKeys)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_23));
    let __VLS_28;
    const __VLS_29 = {
        onNodeClick: (__VLS_ctx.toggleCategory)
    };
    let __VLS_25;
    let __VLS_26;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_27.slots;
        const [{ node }] = __VLS_getSlotParams(__VLS_thisSlot);
        if (node.type === 'category') {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ onClick: (...[$event]) => {
                        if (!((node.type === 'category')))
                            return;
                        __VLS_ctx.toggleCategory(node);
                    } },
                ...{ class: ("expense_cate") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (node.label);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: ("expense_total") },
            });
            (node.total);
        }
        else {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("expense_item") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (node.date);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (node.description);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
            (node.amount);
            __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(!((node.type === 'category'))))
                            return;
                        __VLS_ctx.edit(node);
                    } },
                ...{ class: ("btn_edit btn") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
                ...{ class: ("fa-solid fa-pen") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
                ...{ onClick: (...[$event]) => {
                        if (!(!((node.type === 'category'))))
                            return;
                        __VLS_ctx.remove(node);
                    } },
                ...{ class: ("btn_remove btn") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.i, __VLS_intrinsicElements.i)({
                ...{ class: ("fa-solid fa-trash-can") },
            });
        }
    }
    var __VLS_27;
    ['modal', 'modal_content', 'date_range_area', 'type_area', 'search_area', 'card', 'expense_tree', 'expense_cate', 'expense_total', 'expense_item', 'btn_edit', 'btn', 'fa-solid', 'fa-pen', 'btn_remove', 'btn', 'fa-solid', 'fa-trash-can',];
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
            Tree: Tree,
            ElDatePicker: ElDatePicker,
            ElConfigProvider: ElConfigProvider,
            PieChart: PieChart,
            Excel: Excel,
            showPieChart: showPieChart,
            locale: locale,
            dateRange: dateRange,
            selectedShowType: selectedShowType,
            pieChartData: pieChartData,
            treeData: treeData,
            searchByDateRange: searchByDateRange,
            edit: edit,
            remove: remove,
            expandedKeys: expandedKeys,
            toggleCategory: toggleCategory,
            isTreeDataReady: isTreeDataReady,
        };
    },
    emits: {},
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    emits: {},
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
