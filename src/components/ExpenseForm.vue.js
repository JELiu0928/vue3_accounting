/// <reference types="../../node_modules/.vue-global-types/vue_3.5_false.d.ts" />
import { ref, onMounted } from 'vue';
import ExpenseList from './ExpenseList.vue';
import { ElDatePicker, ElConfigProvider } from 'element-plus';
import 'element-plus/dist/index.css';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
// 定義 input 欄位的值
const countValue = ref('');
const descValue = ref('');
// 定義按鈕的數字或符號
const buttons = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+'];
const categories = [
    { id: 1, cate: '飲食' },
    { id: 2, cate: '日常' },
    { id: 3, cate: '交通' },
    { id: 4, cate: '娛樂' },
    { id: 5, cate: '其它' },
    { id: 6, cate: '股票' },
    { id: 7, cate: '其它2' },
    { id: 8, cate: '其它3' },
    { id: 999, cate: '未分類' },
];
const date = ref(new Date());
const locale = zhCn;
const selectedCate = ref(null);
const selectedType = ref('expense');
const myExpenseList = ref([]);
const isEditMode = ref(false); // 是否為編輯模式
const currentEditItem = ref(null); // 當前編輯的項目
const loadStorageExpense = () => {
    const storageExpense = localStorage.getItem('storageExpense');
    if (storageExpense) {
        myExpenseList.value = JSON.parse(storageExpense);
    }
};
onMounted(loadStorageExpense);
// 定義方法處理數字或符號的點擊事件
const appendToInput = (value) => {
    const operators = ['+', '-', '×', '÷'];
    console.log('countValue.value', countValue.value);
    const lastChar = countValue.value.slice(-1);
    if (operators.includes(value)) {
        if (operators.includes(lastChar)) {
            // 如果是相同運算符，則不做處理
            if (lastChar !== value) {
                countValue.value = countValue.value.slice(0, -1) + value;
            }
            return;
        }
        countValue.value += value;
    }
    else {
        countValue.value += value;
    }
};
const calculate = () => {
    const operators = ['+', '-', '×', '÷'];
    const lastChar = countValue.value.slice(-1);
    if (operators.includes(lastChar)) {
        countValue.value = countValue.value.slice(0, -1); // 去掉最後一個符號
    }
    try {
        // 使用 eval 計算數學表達式
        // countValue.value = String(eval(countValue.value.replace(/÷/g, '/').replace(/×/g, '*')))
        countValue.value = String(new Function('return ' + countValue.value.replace(/÷/g, '/').replace(/×/g, '*'))());
    }
    catch (error) {
        // 若有錯誤則顯示錯誤
        countValue.value = 'Error';
        console.log(error);
    }
};
const clearInput = () => {
    countValue.value = '';
};
const saveOrUpdate = () => {
    const formattedDate = date.value
        .toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
        .replace(/\//g, '-');
    if (!selectedCate.value) {
        alert('請選擇分類');
        return;
    }
    if (countValue.value) {
        const selectedCategory = categories.find((c) => c.id === selectedCate.value);
        // console.log('===', selectedType.value)
        const defaultDescription = selectedCategory ? selectedCategory.cate : '';
        countValue.value = String(eval(countValue.value.replace(/÷/g, '/').replace(/×/g, '*')));
        const expense = {
            id: isEditMode.value ? (currentEditItem.value?.id ?? Date.now()) : Date.now(), // 如果是編輯模式，保持 id 不變,
            date: formattedDate,
            amount: countValue.value,
            category: selectedCate.value,
            description: descValue.value || defaultDescription,
            type: selectedType.value,
        };
        // 編輯模式下更新資料
        if (isEditMode.value) {
            console.log('編輯', myExpenseList.value);
            const index = myExpenseList.value.findIndex((item) => {
                console.log('item', item);
                return item.id === (currentEditItem.value ? currentEditItem.value.id : null);
            });
            console.log('index', index);
            if (index !== -1) {
                myExpenseList.value[index] = expense;
            }
        }
        else {
            console.log('新增');
            // 新增項目
            myExpenseList.value.push(expense);
        }
        // myExpenseList.value.push(expense)
        localStorage.setItem('storageExpense', JSON.stringify(myExpenseList.value));
        alert(isEditMode.value ? '更新成功' : '儲存成功');
        countValue.value = '';
        descValue.value = '';
        selectedCate.value = null;
        isEditMode.value = false;
    }
    else {
        alert('請輸入金額');
        return;
    }
    console.log(myExpenseList);
    console.log(localStorage.getItem('storageExpense'));
};
const editExpense = (expense) => {
    console.log('exxxxxedit', expense);
    isEditMode.value = true;
    currentEditItem.value = expense;
    date.value = new Date(expense.date);
    selectedCate.value = expense.category;
    descValue.value = expense.description;
    countValue.value = expense.amount;
    selectedType.value = expense.type;
};
const removeExpense = (expense) => {
    // localStorage.getItem('storageExpense')
    console.log('removeExpense', expense);
    const confirmRemove = confirm('確定刪除嗎?');
    if (confirmRemove) {
        myExpenseList.value = myExpenseList.value.filter((item) => item.id !== expense.id);
        localStorage.setItem('storageExpense', JSON.stringify(myExpenseList.value));
        console.log('remove', expense);
    }
};
console.log('myExpenseList', myExpenseList); /* PartiallyEnd: #3632/scriptSetup.vue */
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
        ...{ class: ("left_area") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("type_area") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("radio"),
        name: ("type"),
        id: ("expense"),
        value: ("expense"),
        checked: (true),
    });
    (__VLS_ctx.selectedType);
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: ("expense"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        type: ("radio"),
        name: ("type"),
        id: ("income"),
        value: ("income"),
    });
    (__VLS_ctx.selectedType);
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: ("income"),
    });
    const __VLS_0 = {}.ElConfigProvider;
    /** @type { [typeof __VLS_components.ElConfigProvider, typeof __VLS_components.elConfigProvider, typeof __VLS_components.ElConfigProvider, typeof __VLS_components.elConfigProvider, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        locale: ((__VLS_ctx.locale)),
    }));
    const __VLS_2 = __VLS_1({
        locale: ((__VLS_ctx.locale)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = {}.ElDatePicker;
    /** @type { [typeof __VLS_components.ElDatePicker, typeof __VLS_components.elDatePicker, ] } */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
        modelValue: ((__VLS_ctx.date)),
        type: ("date"),
        defaultValue: ((new Date())),
        popperClass: ("custom-date-picker"),
    }));
    const __VLS_8 = __VLS_7({
        modelValue: ((__VLS_ctx.date)),
        type: ("date"),
        defaultValue: ((new Date())),
        popperClass: ("custom-date-picker"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    __VLS_5.slots.default;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("category") },
    });
    for (const [cate] of __VLS_getVForSourceType((__VLS_ctx.categories))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("category_item") },
            key: ((cate.id)),
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
            name: ("category"),
            id: ((`cate${cate.id}`)),
            type: ("radio"),
            value: ((cate.id)),
        });
        (__VLS_ctx.selectedCate);
        __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
            for: ((`cate${cate.id}`)),
        });
        (cate.cate);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("desc_area") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.label, __VLS_intrinsicElements.label)({
        for: ("desc"),
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        id: ("desc"),
        type: ("text"),
        value: ((__VLS_ctx.descValue)),
        ...{ class: ("desc_input") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("amount_area") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.input)({
        value: ((__VLS_ctx.countValue)),
        type: ("text"),
        readonly: (true),
        ...{ class: ("count_input") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ onClick: (__VLS_ctx.clearInput) },
        ...{ class: ("AC") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("num_area") },
    });
    for (const [btn] of __VLS_getVForSourceType((__VLS_ctx.buttons))) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ onClick: (...[$event]) => {
                    btn === '=' ? __VLS_ctx.calculate() : __VLS_ctx.appendToInput(btn);
                } },
            key: ((btn)),
            ...{ class: ("num") },
        });
        (btn);
    }
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.saveOrUpdate) },
        ...{ class: ("save_btn") },
    });
    (__VLS_ctx.isEditMode ? '更新' : '儲存');
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("right_area") },
    });
    // @ts-ignore
    /** @type { [typeof ExpenseList, ] } */ ;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent(ExpenseList, new ExpenseList({
        ...{ 'onEditExpense': {} },
        ...{ 'onRemoveExpense': {} },
        expenseList: ((__VLS_ctx.myExpenseList)),
    }));
    const __VLS_13 = __VLS_12({
        ...{ 'onEditExpense': {} },
        ...{ 'onRemoveExpense': {} },
        expenseList: ((__VLS_ctx.myExpenseList)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    let __VLS_17;
    const __VLS_18 = {
        onEditExpense: (__VLS_ctx.editExpense)
    };
    const __VLS_19 = {
        onRemoveExpense: (__VLS_ctx.removeExpense)
    };
    let __VLS_14;
    let __VLS_15;
    var __VLS_16;
    ['container', 'left_area', 'type_area', 'category', 'category_item', 'desc_area', 'desc_input', 'amount_area', 'count_input', 'AC', 'num_area', 'num', 'save_btn', 'right_area',];
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
            ExpenseList: ExpenseList,
            ElDatePicker: ElDatePicker,
            ElConfigProvider: ElConfigProvider,
            countValue: countValue,
            descValue: descValue,
            buttons: buttons,
            categories: categories,
            date: date,
            locale: locale,
            selectedCate: selectedCate,
            selectedType: selectedType,
            myExpenseList: myExpenseList,
            isEditMode: isEditMode,
            appendToInput: appendToInput,
            calculate: calculate,
            clearInput: clearInput,
            saveOrUpdate: saveOrUpdate,
            editExpense: editExpense,
            removeExpense: removeExpense,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
