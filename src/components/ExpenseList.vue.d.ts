type __VLS_Props = {
    expenseList: ExpenseType[];
    allCategoryArr: Category_id[];
};
interface ExpenseType {
    amount: string;
    category: number;
    date: string;
    description: string;
    id: number;
    key?: number | string;
    type: string;
    expanded?: boolean;
    label?: string;
}
interface Category_id {
    id: number;
    cate: string;
}
declare const _default: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    editExpense: (...args: any[]) => void;
    removeExpense: (...args: any[]) => void;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onEditExpense?: ((...args: any[]) => any) | undefined;
    onRemoveExpense?: ((...args: any[]) => any) | undefined;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
