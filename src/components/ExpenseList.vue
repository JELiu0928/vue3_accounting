<script setup lang="ts">
import { ref, defineProps, computed, defineEmits,nextTick} from 'vue'
import Tree from 'primevue/tree'
import PieChart from './PieChart.vue'
import LineChart from './LineChart.vue'
import Excel from './Excel.vue'

const props = defineProps<{
	expenseList: ExpenseType[], 
	allCategoryArr: Category_id[] 
}>()

interface ExpenseType {
	// 根據實際資料結構設置屬性
	amount: string
	category: number
	date: string
	description: string
	id: number
	key?: number | string
	type: string
	expanded?: boolean
	label?: string
}
interface Category {
	children: Array<ExpenseType>
	id: string
	label: string
	total: number
	expanded: boolean
	type: string
}
interface Category_id {
	id: number
	cate: string
}
interface PieChartData {
	labels: string[]
	datasets: {
		data: number[]
		backgroundColor: string[]
	}[]
}
interface LineChartData {
	labels: string[]
	datasets: {
		label: string
        data: number[]
		borderColor: string
		backgroundColor: string
		fill: boolean
	}[]
}
interface TreeDataResult {
	piechart: any
	tree: any
}


const showPieChart = ref(false)
const showLineChart = ref(false)

//定義事件
const emit = defineEmits(['editExpense', 'removeExpense'])
const balance = ref<number>(0)
const totalExpense = ref<number>(0)
const totalIncome = ref<number>(0)
// 獲取當月的第一天和最後一天
const getDateRange = () => {
	const today = new Date()
	const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
	startOfMonth.setHours(0, 0, 0, 0)
	const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
	endOfMonth.setHours(23, 59, 59, 999)
	return [startOfMonth, endOfMonth]
}
const [rangeStart, rangeEnd] = getDateRange()
// console.log('r===', rangeStart, rangeEnd)
const start_date = ref<Date>(rangeStart)
const end_date = ref<Date>(rangeEnd)
const dateRange = ref<[Date, Date] | undefined>(
	rangeStart && rangeEnd ? [rangeStart, rangeEnd] : undefined,
)

// console.log('date', dateRange.value)
const selectedShowType = ref('show_expense')
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
const years:number[] = [];

for (let i = 0; i < 5; i++) {
    years.push(currentYear - i);
}
// }
const calculateLineChart = function(list: ExpenseType[], year: number){
    const linechart: LineChartData = { 
        labels: [], 
        datasets: [
            { label: '收入', data: [], borderColor: 'green', backgroundColor: 'rgba(0, 255, 0, 0.2)', fill: false },
            { label: '支出', data: [], borderColor: 'red', backgroundColor: 'rgba(255, 0, 0, 0.2)', fill: false }
        ]
    }
    const monthlyDataMap = new Map<string, { income: number, expense: number }>()

    for(let month = 1; month <= 12; month++){
        const yearMonth = `${String(year)}-${month.toString().padStart(2, '0')}`
        monthlyDataMap.set(yearMonth, { income: 0, expense: 0 })
    }

    //折線圖
    list.forEach((expense: ExpenseType)=>{
        // console.log('list_expense',expense)
        const expensYear = new Date(expense.date).getFullYear()
        // console.log(expensYear)
        if(expensYear == year){
            const yearMonth = expense.date.slice(0, 7);
            if(expense.type === 'expense'){
                // console.log('支出c')
                monthlyDataMap.get(yearMonth)!.expense += parseInt(expense.amount)
            }else{
                monthlyDataMap.get(yearMonth)!.income += parseInt(expense.amount)
            }
        }

    }) 
    const labels = Array.from(monthlyDataMap.keys()) //把key轉成陣列
    const incomeData = labels.map((month)=>monthlyDataMap.get(month)!.income)
    const expenseData = labels.map((month)=>monthlyDataMap.get(month)!.expense)
 
    return{
        labels ,
        incomeData: { label: '收入', data: incomeData, borderColor: 'green', backgroundColor: 'rgba(0, 255, 0, 0.2)', fill: false },
        expenseData:{ label: '支出', data: expenseData, borderColor: 'red', backgroundColor: 'rgba(255, 0, 0, 0.2)', fill: false }
        ,
        // datasets: [
        //     { label: '收入', data: incomeData, borderColor: 'green', backgroundColor: 'rgba(0, 255, 0, 0.2)', fill: false },
        //     { label: '支出', data: expenseData, borderColor: 'red', backgroundColor: 'rgba(255, 0, 0, 0.2)', fill: false }
        // ]
    }

}
const lineChartData = computed(() => {
	return calculateLineChart(
	    props.expenseList || [],
		selectedYear.value
	)
}) 

const calculateTreeData = function (
	list: ExpenseType[],
	startDate: Date,
	endDate: Date,
	showType: string,
): TreeDataResult {
	// 存放每個分類的帳目
	const categoryMap = new Map()
	// 圓餅圖的結構
	const piechart: PieChartData = { labels: [], datasets: [{ data: [], backgroundColor: [] }] }
    
    const totals = list.reduce((acc,cur)=>{
        const curDate = new Date(cur.date)
		const isInDateRange = startDate <= curDate && curDate <= endDate
        if (isInDateRange) {
            if (cur.type === 'income') {
                acc.totalIncome += parseInt(cur.amount, 10);
            } else if (cur.type === 'expense') {
                acc.totalExpense += parseInt(cur.amount, 10);
            }
        }
        return acc
    },{totalIncome:0,totalExpense:0})
    totalIncome.value = totals.totalIncome
    totalExpense.value = totals.totalExpense
    balance.value = totals.totalIncome - totals.totalExpense
	const filteredList = list.filter((expense: ExpenseType) => {
		const expenseDate = new Date(expense.date)
		const isInDateRange = startDate <= expenseDate && expenseDate <= endDate
		const isCorrectType =
			showType === 'show_expense' ? expense.type === 'expense' : expense.type === 'income'
		return isInDateRange && isCorrectType
	})

    filteredList.forEach((expense: ExpenseType) => {
        if (!categoryMap.has(expense.category)) {
            const category = props.allCategoryArr.find((c: Category_id) =>  c.id === expense.category)

            // tree結構
            categoryMap.set(expense.category, {
                key: `category-${expense.category}`, // 節點的唯一識別碼
                label: category ? category.cate : '未分類', // 顯示的名稱
                type: 'category', // 節點類型
                total: 0, // 該分類的總金額
                expanded: true, // 是否展開該分類節點
                children: [], // 該分類底下的支出項目
            })
        }
        const categoryNode = categoryMap.get(expense.category)
        //子節點
        categoryNode.children.push({
            key: expense.id,
            id: expense.id,
            type: expense.type,
            date: expense.date,
            description: expense.description ,
            amount: String(expense.amount),
            category: expense.category,
        })
        categoryNode.total += parseInt(expense.amount)
    })
        
    //日期排序：舊~新
    categoryMap.forEach((category: Category) => {
		//轉時間戳之後大小排序
        category.children.sort((a:ExpenseType, b:ExpenseType) => new Date(a.date).getTime() - new Date(b.date).getTime())
	})
	// 處理圓餅圖資料
	categoryMap.forEach((category: Category) => {
		// console.log('===', category)
		piechart.labels.push(category.label)
		piechart.datasets[0].data.push(category.total)
		piechart.datasets[0].backgroundColor.push(getRandomColor())
	})

	return {
		tree: Array.from(categoryMap.values()),
		piechart: piechart,
	}
}
const pieChartData = computed(() => {
	const { piechart } = calculateTreeData(
		props.expenseList || [],
		start_date.value,
		end_date.value,
		selectedShowType.value,
	)
	return piechart
})

const treeData = computed(() => {   
	return calculateTreeData(
		props.expenseList || [],
		start_date.value,
		end_date.value,
		selectedShowType.value,
	).tree
})

// 日期UI
const searchByDateRange = function (type: string) {
	if (type == 'custom') {
		if (!dateRange.value || dateRange.value.length !== 2) return
		const [newStartDate, newEndDate] = dateRange.value
		start_date.value = new Date(newStartDate.setHours(0, 0, 0, 0))
		end_date.value = new Date(newEndDate.setHours(23, 59, 59, 999))
	} else if (type == 'today') {
		const today = new Date()
		start_date.value = new Date(today.setHours(0, 0, 0, 0))
		end_date.value = new Date(today.setHours(23, 59, 59, 999))
		dateRange.value = [start_date.value, end_date.value]
		console.log('==', start_date.value, end_date.value)
	} else if (type == 'month') {
		const [rangeStart, rangeEnd] = getDateRange()
		start_date.value = new Date(rangeStart)
		end_date.value = new Date(rangeEnd)
		dateRange.value = [start_date.value, end_date.value]
	}
}

const edit = function (expense: ExpenseType) {
	emit('editExpense', expense)
}
const remove = function (expense: ExpenseType) {
	emit('removeExpense', expense)
}
const getRandomColor = () => {
	const letters = '0123456789ABCDEF'
	let color = '#'
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	}
	return color
}

// 讓整行分類可展開收合
// const expandedKeys = ref({}) // 存放展開狀態
const expandedKeys = ref<Record<string, boolean>>({}) // 初始化為空對象
const toggleCategory = (node: ExpenseType) => {
	if (node.type === 'category') {
		const key = node.key
		// 切換展開/收合
		if (expandedKeys.value[key as string]) {
			delete expandedKeys.value[key as string] // 收合
		} else {
			expandedKeys.value[key as string] = true // 展開
		}
        // 重新賦值，觸發視圖更新
		expandedKeys.value = { ...expandedKeys.value }
	}
}

const isTreeDataReady = ref(false)

// 在計算屬性變化時，使用 nextTick 等待計算完成
nextTick(() => {
  if (treeData.value.length > 0) {
    isTreeDataReady.value = true
  }
  
})
const showCalcArea = computed(() => {
    return balance.value !== 0 || totalIncome.value !== 0
})

</script>
<template>
	<div v-if="showPieChart" class="modal">
		<div class="modal_content">
			<PieChart v-if="pieChartData.labels.length > 0" :pieChartData="pieChartData" />
			<button @click="showPieChart = false">關閉</button>
		</div>
	</div>
	<div v-if="showLineChart" class="modal">
		<div class="modal_content">
                <span>請選擇年份：</span>
                <select v-model="selectedYear">
                    <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
                <LineChart v-if="lineChartData.labels.length > 0" :lineChartData="lineChartData " />
			<button @click="showLineChart = false">關閉</button>
		</div>
	</div>
	<div class="date_range_area">
		<el-config-provider >
			<el-date-picker
				v-model="dateRange"
				:type="'daterange'"
				range-separator="至"
				start-placeholder="開始日期"
				end-placeholder="結束日期"
				:default-value="[new Date(), new Date()]"
			/>
		</el-config-provider>
		<button @click="searchByDateRange('custom')">搜尋</button>
		<button @click="searchByDateRange('today')">今日</button>
		<button @click="searchByDateRange('month')">本月</button>
	</div>
	<div class="type_area">
		<input
			type="radio"
			name="show_type"
			id="show_expense"
			value="show_expense"
			checked
			v-model="selectedShowType"
		/>
		<label for="show_expense">支出</label>
		<input
			type="radio"
			name="show_type"
			id="show_income"
			value="show_income"
			v-model="selectedShowType"
		/>
		<label for="show_income">收入</label>
	</div>
	<div class="search_area">
		<Excel v-if="isTreeDataReady" :treeData="treeData" />
		<button @click="showPieChart = !showPieChart">查看圓餅圖</button>
		<button @click="showLineChart = !showLineChart">收支趨勢圖</button>
	</div>
	<div class="card" data-amount="0">
		<Tree
			:value="treeData"
			class="expense_tree"
			@node-click="toggleCategory"
			:expandedKeys="expandedKeys"
		>
			<template #default="{ node }">
				<!-- 如果是分類節點 -->
				<template v-if="node.type === 'category'">
					<div class="expense_cate" @click="toggleCategory(node as ExpenseType)">
						<span>{{ node.label }}</span>
						<span class="expense_total">${{ node.total }}</span>
					</div>
				</template>
				<!-- 如果是支出項目節點 -->
				<template v-else>
					<div class="expense_item">
						<span>{{ node.date }}</span>
						<span>{{ node.description }}</span>
						<span
							>${{ node.amount }}
							<button @click="edit(node as ExpenseType)" class="btn_edit btn">
								<i class="fa-solid fa-pen"></i>
							</button>
							<button @click="remove(node as ExpenseType)" class="btn_remove btn">
								<i class="fa-solid fa-trash-can"></i>
							</button>
						</span>
					</div>
				</template>
			</template>
		</Tree>
        <div class="calc_area" v-show="showCalcArea">
            <div class="calc_totalExpense">總支出：<span>{{totalExpense}}</span>元</div>
            <div class="calc_totalIncome">總收入：<span>{{totalIncome}}</span>元</div>
            <div class="calc_balance">收支結餘：<span>{{balance}}</span>元</div>
        </div>
	</div>
</template>

<style lang="scss">
.modal {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 99;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
    @include flexCenter;
	&_content {
		background-color: var(--color-yellow);
		padding: 20px;
		border-radius: 5px;
        color: var(--color-secondary);
		& > button {
			@include mainColorBtn;
			padding: 5px 10px;
            margin-top: 10px;
			background-color: var(--color-secondary);
            display: block;
            justify-self: center;
		}
	}
}
.search_area {
	display: flex;
	align-items: center;
	justify-content: right;
	margin: 5px 0;
	gap: 10px;
	& > button {
		width: 90px;
		/* border-radius: 5px; */
		@include yellowBtn;
		padding: 8px 10px;
		background-color: var(--color-yellow);
		border: none;
		color: var(--color-secondary);
		&:hover {
			background-color: var(--color-yellow-second);
		}
	}
}
.card {
	@include mainColorBtn;
	background-color: transparent;
	overflow-y: scroll;
	height: 75vh;
    position: relative;
	&::-webkit-scrollbar {
		width: 5px;
		background: transparent;
	}
    .calc{
        &_area{
            display: flex;
            justify-content: right;
            gap: 20px;
            position: sticky;
            bottom: 0;
            background-color: var(--color-yellow);
            width: 100%;
            padding: 10px 15px;
            color: var(--color-secondary);
        }
    }
	&::-webkit-scrollbar-thumb {
		background: #22234c;
	}
	.p-tree-node-label {
		width: 100%;
	}
	.p-tree {
		background-color: var(--color-secondary) !important;
	}
  
     
}
.date_range_area {
	display: flex;
	gap: 5px;
	margin-bottom: 5px;
	& > button {
		width: 50px;
		border-radius: 5px;
		background-color: var(--color-yellow);
		border: none;
		color: var(--color-secondary);
		cursor: pointer;
		&:hover {
			background-color: var(--color-yellow-second);
		}
	}
}

.expense {
	&_cate,
	&_item {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	&_total {
		font-family: 'Roboto', serif;
		font-weight: 300;
	}
	&_item {
		& > span {
			font-family: 'Roboto', serif;
			display: block;
			font-weight: 100;
		}
	}
}
.p-tree-node-content > button.p-tree-node-toggle-button:hover {
	background: none;
}

.type_area {
	display: flex;
	justify-content: center;
	margin-bottom: 10px;
	& > label {
		padding: 4px;
		margin: 0 10px;
		border-bottom: 3px solid transparent;
		cursor: pointer;
	}
	& > input {
		display: none;
	}
	& > input:checked + label {
		border-bottom: 3px solid var(--color-yellow);
	}
}

.el-input__wrapper {
	background-color: var(--color-secondary);
	box-shadow: 0 0 0 1px #22234c inset !important;
	.el-range-separator {
		color: var(--color-yellow);
		font-family: 'Roboto', serif;
		font-weight: 100;
	}
}
.el-date-editor .el-range-input {
	color: var(--color-yellow);
	cursor: pointer;
	font-family: 'Roboto', serif;
	font-weight: 100;
	font-size: 15px;
	letter-spacing: 1px;
}

.el-input__inner {
	width: 90%;
}
.btn {
	background-color: transparent;
	border: none;
	padding: 5px;
	cursor: pointer;
	margin-right: 5px;

	&_edit {
		color: var(--color-yellow);
	}
	&_remove {
		color: rgb(70, 78, 95);
		margin-right: 0px;
	}
}
</style>
