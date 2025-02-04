import { type PropType } from 'vue';
interface PieChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
    }>;
}
declare const _default: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    pieChartData: {
        type: PropType<PieChartData>;
        required: true;
    };
}>, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    pieChartData: {
        type: PropType<PieChartData>;
        required: true;
    };
}>> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, HTMLDivElement>;
export default _default;
