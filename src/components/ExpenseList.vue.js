import { ref, defineProps, computed, defineEmits, nextTick } from 'vue';
import Tree from 'primevue/tree';
import PieChart from './PieChart.vue';
import LineChart from './LineChart.vue';
import Excel from './Excel.vue';
const props = defineProps();
const showPieChart = ref(false);
const showLineChart = ref(false);
//定義事件
const emit = defineEmits(['editExpense', 'removeExpense']);
const balance = ref(0);
const totalExpense = ref(0);
const totalIncome = ref(0);
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
// let categories: Category_id[] = [
// 	{ id: 1, cate: '飲食' },
// 	{ id: 2, cate: '日常' },
// 	{ id: 3, cate: '交通' },
// 	{ id: 4, cate: '娛樂' },
// 	{ id: 5, cate: '其它' },
// 	// { id: 6, cate: '股票' },
// 	// { id: 7, cate: '其它2' },
// 	// { id: 8, cate: '其它3' },
// 	{ id: 999, cate: '未分類' },
// ]
// const costomCate: Category_id[] = JSON.parse(localStorage.getItem('customCate') || '[]')
// categories = [...categories, ...costomCate]
// 
const selectedYear = ref(new Date().getFullYear());
// const getLastFiveYear = ()=>{
const currentYear = new Date().getFullYear();
const years = [];
for (let i = 0; i < 5; i++) {
    years.push(currentYear - i);
}
// }
const calculateLineChart = function (list, year) {
    const linechart = {
        labels: [],
        datasets: [
            { label: '收入', data: [], borderColor: 'green', backgroundColor: 'rgba(0, 255, 0, 0.2)', fill: false },
            { label: '支出', data: [], borderColor: 'red', backgroundColor: 'rgba(255, 0, 0, 0.2)', fill: false }
        ]
    };
    const monthlyDataMap = new Map();
    for (let month = 1; month <= 12; month++) {
        const yearMonth = `${String(year)}-${month.toString().padStart(2, '0')}`;
        monthlyDataMap.set(yearMonth, { income: 0, expense: 0 });
    }
    //折線圖
    list.forEach((expense) => {
        // console.log('list_expense',expense)
        const expensYear = new Date(expense.date).getFullYear();
        // console.log(expensYear)
        if (expensYear == year) {
            const yearMonth = expense.date.slice(0, 7);
            if (expense.type === 'expense') {
                // console.log('支出c')
                monthlyDataMap.get(yearMonth).expense += parseInt(expense.amount);
            }
            else {
                monthlyDataMap.get(yearMonth).income += parseInt(expense.amount);
            }
        }
    });
    const labels = Array.from(monthlyDataMap.keys()); //把key轉成陣列
    const incomeData = labels.map((month) => monthlyDataMap.get(month).income);
    const expenseData = labels.map((month) => monthlyDataMap.get(month).expense);
    return {
        labels,
        incomeData: { label: '收入', data: incomeData, borderColor: 'green', backgroundColor: 'rgba(0, 255, 0, 0.2)', fill: false },
        expenseData: { label: '支出', data: expenseData, borderColor: 'red', backgroundColor: 'rgba(255, 0, 0, 0.2)', fill: false },
        // datasets: [
        //     { label: '收入', data: incomeData, borderColor: 'green', backgroundColor: 'rgba(0, 255, 0, 0.2)', fill: false },
        //     { label: '支出', data: expenseData, borderColor: 'red', backgroundColor: 'rgba(255, 0, 0, 0.2)', fill: false }
        // ]
    };
};
const lineChartData = computed(() => {
    return calculateLineChart(props.expenseList || [], selectedYear.value);
});
const calculateTreeData = function (list, startDate, endDate, showType) {
    // 存放每個分類的帳目
    const categoryMap = new Map();
    // 圓餅圖的結構
    const piechart = { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    const totals = list.reduce((acc, cur) => {
        const curDate = new Date(cur.date);
        const isInDateRange = startDate <= curDate && curDate <= endDate;
        if (isInDateRange) {
            if (cur.type === 'income') {
                acc.totalIncome += parseInt(cur.amount, 10);
            }
            else if (cur.type === 'expense') {
                acc.totalExpense += parseInt(cur.amount, 10);
            }
        }
        return acc;
    }, { totalIncome: 0, totalExpense: 0 });
    totalIncome.value = totals.totalIncome;
    totalExpense.value = totals.totalExpense;
    balance.value = totals.totalIncome - totals.totalExpense;
    const filteredList = list.filter((expense) => {
        const expenseDate = new Date(expense.date);
        const isInDateRange = startDate <= expenseDate && expenseDate <= endDate;
        const isCorrectType = showType === 'show_expense' ? expense.type === 'expense' : expense.type === 'income';
        return isInDateRange && isCorrectType;
    });
    filteredList.forEach((expense) => {
        if (!categoryMap.has(expense.category)) {
            const category = props.allCategoryArr.find((c) => c.id === expense.category);
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
    //日期排序：舊~新
    categoryMap.forEach((category) => {
        //轉時間戳之後大小排序
        category.children.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    // 處理圓餅圖資料
    categoryMap.forEach((category) => {
        // console.log('===', category)
        piechart.labels.push(category.label);
        piechart.datasets[0].data.push(category.total);
        piechart.datasets[0].backgroundColor.push(getRandomColor());
    });
    return {
        tree: Array.from(categoryMap.values()),
        piechart: piechart,
    };
};
const pieChartData = computed(() => {
    const { piechart } = calculateTreeData(props.expenseList || [], start_date.value, end_date.value, selectedShowType.value);
    return piechart;
});
const treeData = computed(() => {
    return calculateTreeData(props.expenseList || [], start_date.value, end_date.value, selectedShowType.value).tree;
});
// 日期UI
const searchByDateRange = function (type) {
    if (type == 'custom') {
        if (!dateRange.value || dateRange.value.length !== 2)
            return;
        const [newStartDate, newEndDate] = dateRange.value;
        start_date.value = new Date(newStartDate.setHours(0, 0, 0, 0));
        end_date.value = new Date(newEndDate.setHours(23, 59, 59, 999));
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
    if (node.type === 'category') {
        const key = node.key;
        // 切換展開/收合
        if (expandedKeys.value[key]) {
            delete expandedKeys.value[key]; // 收合
        }
        else {
            expandedKeys.value[key] = true; // 展開
        }
        // 重新賦值，觸發視圖更新
        expandedKeys.value = { ...expandedKeys.value };
    }
};
const isTreeDataReady = ref(false);
// 在計算屬性變化時，使用 nextTick 等待計算完成
nextTick(() => {
    if (treeData.value.length > 0) {
        isTreeDataReady.value = true;
    }
});
const showCalcArea = computed(() => {
    return balance.value !== 0 || totalIncome.value !== 0;
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
    if (__VLS_ctx.showLineChart) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("modal_content") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
        __VLS_elementAsFunction(__VLS_intrinsicElements.select, __VLS_intrinsicElements.select)({
            value: ((__VLS_ctx.selectedYear)),
        });
        for (const [year] of __VLS_getVForSourceType((__VLS_ctx.years))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.option, __VLS_intrinsicElements.option)({
                key: ((year)),
                value: ((year)),
            });
            (year);
        }
        if (__VLS_ctx.lineChartData.labels.length > 0) {
            // @ts-ignore
            /** @type { [typeof LineChart, ] } */ ;
            // @ts-ignore
            const __VLS_5 = __VLS_asFunctionalComponent(LineChart, new LineChart({
                lineChartData: ((__VLS_ctx.lineChartData)),
            }));
            const __VLS_6 = __VLS_5({
                lineChartData: ((__VLS_ctx.lineChartData)),
            }, ...__VLS_functionalComponentArgsRest(__VLS_5));
        }
        __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
            ...{ onClick: (...[$event]) => {
                    if (!((__VLS_ctx.showLineChart)))
                        return;
                    __VLS_ctx.showLineChart = false;
                } },
        });
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("date_range_area") },
    });
    const __VLS_10 = {}.ElConfigProvider;
    /** @type { [typeof __VLS_components.ElConfigProvider, typeof __VLS_components.elConfigProvider, typeof __VLS_components.ElConfigProvider, typeof __VLS_components.elConfigProvider, ] } */ ;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent(__VLS_10, new __VLS_10({}));
    const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
    const __VLS_16 = {}.ElDatePicker;
    /** @type { [typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ] } */ ;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent(__VLS_16, new __VLS_16({
        modelValue: ((__VLS_ctx.dateRange)),
        type: (('daterange')),
        rangeSeparator: ("至"),
        startPlaceholder: ("開始日期"),
        endPlaceholder: ("結束日期"),
        defaultValue: (([new Date(), new Date()])),
    }));
    const __VLS_18 = __VLS_17({
        modelValue: ((__VLS_ctx.dateRange)),
        type: (('daterange')),
        rangeSeparator: ("至"),
        startPlaceholder: ("開始日期"),
        endPlaceholder: ("結束日期"),
        defaultValue: (([new Date(), new Date()])),
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    __VLS_15.slots.default;
    var __VLS_15;
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
        const __VLS_22 = __VLS_asFunctionalComponent(Excel, new Excel({
            treeData: ((__VLS_ctx.treeData)),
        }));
        const __VLS_23 = __VLS_22({
            treeData: ((__VLS_ctx.treeData)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showPieChart = !__VLS_ctx.showPieChart;
            } },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (...[$event]) => {
                __VLS_ctx.showLineChart = !__VLS_ctx.showLineChart;
            } },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("card") },
        'data-amount': ("0"),
    });
    const __VLS_27 = {}.Tree;
    /** @type { [typeof __VLS_components.Tree, typeof __VLS_components.Tree, ] } */ ;
    // @ts-ignore
    const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({
        ...{ 'onNodeClick': {} },
        value: ((__VLS_ctx.treeData)),
        ...{ class: ("expense_tree") },
        expandedKeys: ((__VLS_ctx.expandedKeys)),
    }));
    const __VLS_29 = __VLS_28({
        ...{ 'onNodeClick': {} },
        value: ((__VLS_ctx.treeData)),
        ...{ class: ("expense_tree") },
        expandedKeys: ((__VLS_ctx.expandedKeys)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_28));
    let __VLS_33;
    const __VLS_34 = {
        onNodeClick: (__VLS_ctx.toggleCategory)
    };
    let __VLS_30;
    let __VLS_31;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { default: __VLS_thisSlot } = __VLS_32.slots;
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
    var __VLS_32;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("calc_area") },
    });
    __VLS_asFunctionalDirective(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.showCalcArea) }, null, null);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("calc_totalExpense") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.totalExpense);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("calc_totalIncome") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.totalIncome);
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("calc_balance") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.balance);
    ['modal', 'modal_content', 'modal', 'modal_content', 'date_range_area', 'type_area', 'search_area', 'card', 'expense_tree', 'expense_cate', 'expense_total', 'expense_item', 'btn_edit', 'btn', 'fa-solid', 'fa-pen', 'btn_remove', 'btn', 'fa-solid', 'fa-trash-can', 'calc_area', 'calc_totalExpense', 'calc_totalIncome', 'calc_balance',];
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
            PieChart: PieChart,
            LineChart: LineChart,
            Excel: Excel,
            showPieChart: showPieChart,
            showLineChart: showLineChart,
            balance: balance,
            totalExpense: totalExpense,
            totalIncome: totalIncome,
            dateRange: dateRange,
            selectedShowType: selectedShowType,
            selectedYear: selectedYear,
            years: years,
            lineChartData: lineChartData,
            pieChartData: pieChartData,
            treeData: treeData,
            searchByDateRange: searchByDateRange,
            edit: edit,
            remove: remove,
            expandedKeys: expandedKeys,
            toggleCategory: toggleCategory,
            isTreeDataReady: isTreeDataReady,
            showCalcArea: showCalcArea,
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
