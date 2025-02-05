export interface ExpenseType {
    id: number;
    key?: number | string;
    amount: string;
    category: number;
    date: string;
    description: string;
    type: string;
    expanded?: boolean;
    label?: string;
}
