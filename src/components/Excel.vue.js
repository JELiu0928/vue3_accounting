import * as XLSX from 'xlsx';
import { defineProps } from 'vue';
const props = defineProps();
// const props = defineProps<{
// 	treeData: ExpenseType[] // 指定 expenseList 的型別為 ExpenseType[]
// }>()
console.table(props.treeData);
const filterData = () => {
    const data = [];
    // 遍歷treeData，每個分類都有children
    props.treeData.forEach((category) => {
        //   latestTreeData.value.forEach(category => {
        console.log('category', category);
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                // 將每個child的資料與其所屬的category資料結合
                data.push({
                    categoryName: category.label, // 分類名稱
                    date: child.date, // 日期
                    description: child.description, // 說明
                    amount: child.amount // 金額
                });
            });
        }
    });
    return data;
};
// watch(() => props.treeData, (newData) => {
//   latestTreeData.value = newData
//   console.log('最新的 treeData:', latestTreeData.value)
// })
const exportToExcel = () => {
    const data = filterData();
    const ws = XLSX.utils.json_to_sheet(data); // 將資料轉換為工作表
    const wb = XLSX.utils.book_new(); // 創建一個新的工作簿
    XLSX.utils.book_append_sheet(wb, ws, '記帳資料'); // 將工作表附加到工作簿
    XLSX.writeFile(wb, '帳目.xlsx'); // 生成並下載檔案
}; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.button, __VLS_intrinsicElements.button)({
        ...{ onClick: (__VLS_ctx.exportToExcel) },
        ...{ class: ("excel_export") },
    });
    ['excel_export',];
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
            exportToExcel: exportToExcel,
        };
    },
    __typeProps: {},
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeProps: {},
});
; /* PartiallyEnd: #4569/main.vue */
