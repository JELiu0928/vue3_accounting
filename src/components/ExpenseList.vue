<!-- <script setup lang="ts">
// defineProps<{
// 	msg: string
// }>()
</script> -->
<script setup lang="ts">
import { ref, defineProps, computed, defineEmits } from 'vue'
import Tree from 'primevue/tree'
import { ElDatePicker, ElConfigProvider } from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import PieChart from './PieChart.vue'

const showPieChart = ref(false)

const locale = zhCn

const props = defineProps({
	expenseList: Array,
})

//定義事件
const emit = defineEmits(['editExpense', 'removeExpense'])

// 獲取當月的第一天和最後一天
const getDateRange = () => {
	const today = new Date()
	const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
	const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
	return [startOfMonth, endOfMonth]
}
const [rangeStart, rangeEnd] = getDateRange()
console.log(rangeStart)
const start_date = ref(rangeStart)
const end_date = ref(rangeEnd)
const dateRange = ref([rangeStart, rangeEnd])
console.log('date', dateRange.value)
const selectedShowType = ref('show_expense')
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
]

const pieChartData = computed(() => {
	const { chart } = calculateTreeData(
		props.expenseList,
		start_date.value,
		end_date.value,
		selectedShowType.value,
	)
	return chart
})
const treeData = computed(() => {
	console.log(11111)
	return calculateTreeData(
		props.expenseList,
		start_date.value,
		end_date.value,
		selectedShowType.value,
	).tree
})

const calculateTreeData = function (list, startDate, endDate, showType) {
	// 存放每個分類的帳目
	const categoryMap = new Map()
	// 圓餅圖的結構
	const chartData = { labels: [], datasets: [{ data: [], backgroundColor: [] }] }

	const filteredList = list.filter((expense) => {
		const expenseDate = new Date(expense.date)
		const isInDateRange = startDate <= expenseDate && expenseDate <= endDate
		const isCorrectType =
			showType === 'show_expense' ? expense.type === 'expense' : expense.type === 'income'

		return isInDateRange && isCorrectType
	})

	// return
	filteredList.forEach((expense) => {
		if (!categoryMap.has(expense.category)) {
			const category = categories.find((c) => c.id === expense.category)
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
	categoryMap.forEach((category) => {
		// console.log('===', category)
		chartData.labels.push(category.label)
		chartData.datasets[0].data.push(category.total)
		chartData.datasets[0].backgroundColor.push(getRandomColor()) // 給每個類別隨機顏色
	})
	// return Array.from(categoryMap.values())
	return {
		tree: Array.from(categoryMap.values()),
		chart: chartData,
	}
}
const searchByDateRange = function (type) {
	if (type == 'custom') {
		if (!dateRange.value || !dateRange.value.length === 2) return
		const [newStartDate, newEndDate] = dateRange.value
		start_date.value = new Date(newStartDate)
		end_date.value = new Date(newEndDate)
	} else if (type == 'today') {
		const today = new Date()
		start_date.value = today.setHours(0, 0, 0, 0)
		end_date.value = today.setHours(23, 59, 59, 999)
		dateRange.value = [start_date.value, end_date.value]
		console.log('==', start_date.value, end_date.value)
	} else if (type == 'month') {
		const [rangeStart, rangeEnd] = getDateRange()
		start_date.value = new Date(rangeStart)
		end_date.value = new Date(rangeEnd)
		dateRange.value = [start_date.value, end_date.value]
	}
}

const edit = function (expense) {
	emit('editExpense', expense)
}
const remove = function (expense) {
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
const expandedKeys = ref({}) // 存放展開狀態
const toggleCategory = (node) => {
	if (node.type === 'category') {
		const key = node.key
		// 切換展開/收合
		if (expandedKeys.value[key]) {
			delete expandedKeys.value[key] // 收合
		} else {
			expandedKeys.value[key] = true // 展開
		}

		// 讓 Vue 重新計算，確保 UI 變更
		expandedKeys.value = { ...expandedKeys.value }

		console.log('分類', node.label, '展開狀態：', expandedKeys.value)
	}
}
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
				type="daterange"
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
					<div class="expense_cate" @click="toggleCategory(node)">
						<span>{{ node.label }}</span>
						<span class="expense_total">${{ node.total }}</span>
					</div>
				</template>
				<!-- 如果是支出項目節點 -->
				<template v-else>
					<div class="expense_item">
						<span>{{ node.date }}</span>
						<span>{{ node.description }}</span>
						<span class=""
							>${{ node.amount }}
							<!-- <div class="btn_wrapper"> -->
							<button @click="edit(node)" class="btn_edit btn">
								<i class="fa-solid fa-pen"></i>
							</button>
							<button @click="remove(node)" class="btn_remove btn">
								<i class="fa-solid fa-trash-can"></i>
							</button>
							<!-- </div> -->
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
			@include border5;
			padding: 5px 10px;
			background-color: var(--color-second);
		}
	}
}
.search_area {
	display: flex;
	align-items: center;
	justify-content: right;
	margin: 5px 0;
	& > button {
		width: 90px;
		/* border-radius: 5px; */
		@include border5;
		padding: 8px 10px;
		background-color: var(--color-yellow);
		border: none;
		color: var(--color-second);
		&:hover {
			background-color: var(--color-yellow-second);
		}
	}
}
.card {
	@include border5;
	overflow-y: scroll;
	height: 75vh;
	&::-webkit-scrollbar {
		width: 5px;
		/* background: var(--color-second); */
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
		background-color: var(--color-second) !important;
		/* background-color: var(--color-second); */
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
		color: var(--color-second);
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
	background-color: var(--color-second);
	box-shadow: 0 0 0 1px #22234c inset !important;
	.el-range-separator {
		color: var(--color-yellow);
		font-family: 'Roboto', serif;
		font-weight: 100;
		font-size: 15px;
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
