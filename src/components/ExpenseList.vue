<!-- <script setup lang="ts">
// defineProps<{
// 	msg: string
// }>()
</script> -->
<script setup lang="ts">
import { ref, defineProps, computed, defineEmits,nextTick ,watch} from 'vue'
import Tree from 'primevue/tree'
import { ElDatePicker, ElConfigProvider } from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import PieChart from './PieChart.vue'
import Excel from './Excel.vue'

// import type { ExpenseType } from '../types/expense'
// console.log('ExpenseType 已加載', ExpenseType)

const props = defineProps<{
	expenseList: ExpenseType[] // 指定 expenseList 的型別為 ExpenseType[]
}>()

//#region interface ___ start
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
interface ChartData {
	labels: string[]
	datasets: {
		data: number[]
		backgroundColor: string[]
	}[]
}
interface TreeDataResult {
	chart: any
	tree: any
}

//#endregion

const showPieChart = ref(false)
const locale = zhCn
//定義事件
const emit = defineEmits(['editExpense', 'removeExpense'])

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
console.log('r===', rangeStart, rangeEnd)
const start_date = ref<Date>(rangeStart)
const end_date = ref<Date>(rangeEnd)
const dateRange = ref<[Date, Date] | undefined>(
	rangeStart && rangeEnd ? [rangeStart, rangeEnd] : undefined,
)

// console.log('date', dateRange.value)
const selectedShowType = ref('show_expense')
let categories: Category_id[] = [
	{ id: 1, cate: '飲食' },
	{ id: 2, cate: '日常' },
	{ id: 3, cate: '交通' },
	{ id: 4, cate: '娛樂' },
	{ id: 5, cate: '其它' },
	{ id: 6, cate: '股票' },
	{ id: 7, cate: '其它2' },
	{ id: 8, cate: '其它3' },
	{ id: 999, cate: '未分類' },
]

const costomCate: Category_id[] = JSON.parse(localStorage.getItem('customCate') || '[]')
categories = [...categories, ...costomCate]

console.log('categories', categories)



const calculateTreeData = function (
	list: ExpenseType[],
	startDate: Date,
	endDate: Date,
	showType: string,
): TreeDataResult {
	// 存放每個分類的帳目
	const categoryMap = new Map()
	// 圓餅圖的結構
	const chartData: ChartData = { labels: [], datasets: [{ data: [], backgroundColor: [] }] }
	// console.log('lsit', list)
	const filteredList = list.filter((expense: ExpenseType) => {
		// console.log('expense', expense)

		const expenseDate = new Date(expense.date)
		const isInDateRange = startDate <= expenseDate && expenseDate <= endDate
		const isCorrectType =
			showType === 'show_expense' ? expense.type === 'expense' : expense.type === 'income'

		return isInDateRange && isCorrectType
	})

	// return
	filteredList.forEach((expense: ExpenseType) => {
		if (!categoryMap.has(expense.category)) {
			const category = categories.find((c: Category_id) => c.id === expense.category)
			// console.log('==22=', category)

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
			type: 'expense',
			date: expense.date,
			description: expense.description,
			amount: String(expense.amount),
			category: expense.category,
		})
		categoryNode.total += parseInt(expense.amount)
	})
	// 處理圓餅圖資料
	categoryMap.forEach((category: Category) => {
		// console.log('===', category)
		chartData.labels.push(category.label)
		chartData.datasets[0].data.push(category.total)
		chartData.datasets[0].backgroundColor.push(getRandomColor()) // 給每個類別隨機顏色
	})
	// console.log('chartData', chartData)
	// return Array.from(categoryMap.values())
	return {
		tree: Array.from(categoryMap.values()),
		chart: chartData,
	}
}
const pieChartData = computed(() => {
	const { chart } = calculateTreeData(
		props.expenseList || [],
		start_date.value,
		end_date.value,
		selectedShowType.value,
	)
	return chart
})

const treeData = computed(() => {
	// console.log(start_date.value)
    // console.log('treeData start_date.value,=', start_date.value,)

	return calculateTreeData(
		props.expenseList || [],
		start_date.value,
		end_date.value,
		selectedShowType.value,
	).tree
})
// console.log('treeData=', treeData)
// console.log('treeData value=', treeData.value)
watch([props.expenseList, start_date, end_date], () => {
  console.log('treeData 已更新', treeData)
  console.log('treeData value已更新', treeData.value)
})
const searchByDateRange = function (type: string) {
	if (type == 'custom') {
		if (!dateRange.value || dateRange.value.length !== 2) return
		const [newStartDate, newEndDate] = dateRange.value
		start_date.value = new Date(newStartDate.setHours(0, 0, 0, 0))
		end_date.value = new Date(newEndDate.setHours(23, 59, 59, 999))
		// console.log(start_date.value, '-----', end_date.value)
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
	console.log('sss', expense)
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
	// console.log('node', node)
	if (node.type === 'category') {
		const key = node.key
		// console.log('key,', key)
		// 切換展開/收合
		if (expandedKeys.value[key as string]) {
			delete expandedKeys.value[key as string] // 收合
		} else {
			expandedKeys.value[key as string] = true // 展開
		}

		// 讓 Vue 重新計算，確保 UI 變更
		expandedKeys.value = { ...expandedKeys.value }
		// console.log('expandedKeys', expandedKeys)

		// console.log('分類', node.label, '展開狀態：', expandedKeys.value)
	}
}

const isTreeDataReady = ref(false)

// 在計算屬性變化時，使用 nextTick 等待計算完成
nextTick(() => {
  if (treeData.value.length > 0) {
    isTreeDataReady.value = true
  }
})
</script>
<template>
	<div v-if="showPieChart" class="modal">
		<div class="modal_content">
			<PieChart v-if="pieChartData.labels.length > 0" :pieChartData="pieChartData" />
			<button @click="showPieChart = false">關閉</button>
		</div>
	</div>
	<div class="date_range_area">
		<el-config-provider :locale="locale">
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
	</div>
	<div class="card">
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
	display: flex;
	justify-content: center;
	align-items: center;
	&_content {
		background-color: var(--color-yellow);
		padding: 20px;
		border-radius: 5px;
		& > button {
			@include mainColorBtn;
			padding: 5px 10px;
			background-color: var(--color-secondary);
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
	&::-webkit-scrollbar {
		width: 5px;
		/* background: var(--color-secondary); */
		background: transparent;
		/* background: #000; */
	}

	&::-webkit-scrollbar-thumb {
		background: #22234c;
	}
	.p-tree-node-label {
		width: 100%;
	}
	.p-tree {
		background-color: var(--color-secondary) !important;
		/* background-color: var(--color-secondary); */
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
	/* color: transparent; */
}
.type_area {
	display: flex;
	justify-content: center;
	/* align-items: left; */
	margin-bottom: 10px;
	& > label {
		/* background-color: transparent; */
		/* border: none; */
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
		/* font-size: 15px; */
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
		/* color: rgb(138, 44, 44); */
		color: rgb(70, 78, 95);
		margin-right: 0px;
	}
}
</style>
