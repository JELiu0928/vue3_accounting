<script setup lang="ts">
import { ref, onMounted, type Ref, watch } from 'vue'
import ExpenseList from './ExpenseList.vue'
import { ElDatePicker, ElConfigProvider } from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// 定義 input 欄位的值
const countValue = ref<string>('')
const descValue = ref<string>('')
interface ExpenseType {
	// 根據實際資料結構設置屬性
	id: number
	key?: number | string
	amount: string
	category: number
	date: string
	description: string
	type: string
	expanded?: boolean
	label?: string
}
interface Category_id {
	id: number
	cate: string
}
// 定義按鈕的數字或符號
const buttons = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+']
const categories = [
	{ id: 1, cate: '飲食' },
	{ id: 2, cate: '日常' },
	{ id: 3, cate: '交通' },
	{ id: 4, cate: '娛樂' },
	{ id: 5, cate: '其它' },
	{ id: 999, cate: '未分類' },
]
const customCate = ref<string>('')
const customCategoriesArr = ref<{ id: number; cate: string }[]>([])

const date = ref(new Date())
const locale = zhCn
const selectedCate = ref<number | null>(null)
const selectedAddCate = ref<number | null>(null)
const selectedType = ref<string>('expense')
const myExpenseList = ref<ExpenseType[]>([])
const isEditMode = ref<boolean>(false) // 是否為編輯模式
const currentEditItem = ref<{ id: number } | null>(null) // 當前編輯的項目
const loadStorageExpense = () => {
	const storageExpense = localStorage.getItem('storageExpense')
	if (storageExpense) {
		myExpenseList.value = JSON.parse(storageExpense)
	}
	const storageCustomCate = localStorage.getItem('customCate')
	if (storageCustomCate) {
		customCategoriesArr.value = JSON.parse(storageCustomCate)
	}
}
onMounted(loadStorageExpense)

// 定義方法處理數字或符號的點擊事件
const appendToInput = (value: string) => {
	const operators = ['+', '-', '×', '÷']
	console.log('countValue.value', countValue.value)
	const lastChar = countValue.value.slice(-1)

	if (operators.includes(value)) {
		if (operators.includes(lastChar)) {
			// 如果是相同運算符，則不做處理
			if (lastChar !== value) {
				countValue.value = countValue.value.slice(0, -1) + value
			}
			return
		}
		countValue.value += value
	} else {
		countValue.value += value
	}
}
const calculate = () => {
	const operators = ['+', '-', '×', '÷']
	const lastChar = countValue.value.slice(-1)

	if (countValue.value.trim() == '') {
		countValue.value = ''
		return
	}
	if (operators.includes(lastChar)) {
		countValue.value = countValue.value.slice(0, -1) // 去掉最後一個符號
	}
	try {
		// eval (高風險XXX)
		// countValue.value = String(eval(countValue.value.replace(/÷/g, '/').replace(/×/g, '*')))
		countValue.value = String(
			new Function('return ' + countValue.value.replace(/÷/g, '/').replace(/×/g, '*'))(),
		)
	} catch (error) {
		// 若有錯誤則顯示錯誤
		countValue.value = 'Error'
		console.log(error)
	}
}
const clearInput = () => {
	countValue.value = ''
}

const saveOrUpdate = () => {
	const formattedDate = date.value
		.toLocaleDateString('zh-TW', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
		})
		.replace(/\//g, '-')

	if (!selectedCate.value) {
		alert('請選擇分類')
		return
	}

	if (countValue.value) {
		const selectedCategory = categories.find((c: Category_id) => c.id === selectedCate.value)
		// console.log('===', selectedType.value)
		const defaultDescription = selectedCategory ? selectedCategory.cate : ''
		countValue.value = String(eval(countValue.value.replace(/÷/g, '/').replace(/×/g, '*')))
		const expense = {
			id: isEditMode.value ? (currentEditItem.value?.id ?? Date.now()) : Date.now(), // 如果是編輯模式，保持 id 不變,
			date: formattedDate,
			amount: countValue.value,
			category: selectedCate.value,
			description: descValue.value || defaultDescription,
			type: selectedType.value,
		}

		// 編輯模式下更新資料
		if (isEditMode.value) {
			// console.log('編輯', myExpenseList.value)
			const index = myExpenseList.value.findIndex((item) => {
				console.log('item', item)
				return item.id === (currentEditItem.value ? currentEditItem.value.id : null)
			})
			console.log('index', index)
			if (index !== -1) {
				myExpenseList.value[index] = expense
			}
		} else {
			// console.log('新增')

			// 新增項目
			myExpenseList.value.push(expense)
		}

		localStorage.setItem('storageExpense', JSON.stringify(myExpenseList.value))
		alert(isEditMode.value ? '更新成功' : '儲存成功')
		countValue.value = ''
		descValue.value = ''
		selectedCate.value = null
		isEditMode.value = false
	} else {
		alert('請輸入金額')
		return
	}

	// console.log(myExpenseList)
	// console.log(localStorage.getItem('storageExpense'))
}

const showAddCategoryModal = ref(false)
const addCategory = (cate: string) => {
	console.log('add', selectedAddCate.value)

	const isSameCate = [...categories, ...customCategoriesArr.value].some(
		(item) => item.cate === cate,
	)

	if (isSameCate) {
		alert('分類名稱已存在，請輸入不同的名稱')
		return
	}
	if (!cate.trim()) return
	customCate.value = ''
	console.log('selectedAddCate.value', selectedAddCate.value)
	if (selectedAddCate.value || selectedAddCate.value !== null) {
		const index = customCategoriesArr.value.findIndex(
			(item) => item.id === selectedAddCate.value,
		)

		if (index !== -1) {
			customCategoriesArr.value[index].cate = cate
		}
	} else {
		customCategoriesArr.value.push({ id: Date.now(), cate: cate })
	}
}
const delCategory = (cateID: number) => {
	console.log('刪除', cateID)
	console.log('刪除storageExpense', myExpenseList.value)
	const confirmCateRemove = confirm('確定刪除此類別嗎?')
	if (confirmCateRemove) {
		// console.log('front', customCategoriesArr.value)
		customCategoriesArr.value = customCategoriesArr.value.filter((item) => item.id !== cateID)
		// console.log('back', customCategoriesArr.value)
		localStorage.setItem('customCate', JSON.stringify(customCategoriesArr.value))
		console.log('if刪除', cateID)
		const delItemIndex = myExpenseList.value.findIndex((item) => item.category === cateID)
		console.log(delItemIndex)

		if (delItemIndex !== -1) {
			myExpenseList.value[delItemIndex].category = 999
			localStorage.setItem('storageExpense', JSON.stringify(myExpenseList.value))
		}
		customCate.value = ''
	}
	console.log('刪除2', myExpenseList.value)
}
const getCategory = (cate: { id: number; cate: string }) => {
	// console.log('get', cate)
	console.log('get customCate.value', customCate.value)
	customCate.value = cate.cate
}
watch(
	customCategoriesArr,
	(newVal) => {
		localStorage.setItem('customCate', JSON.stringify(newVal))
		// console.log('vvvv', customCategoriesArr.value)
	},
	{ deep: true },
)

// const isCostomCate = ref<boolean>(false)

const editExpense = (expense: ExpenseType) => {
	// console.log('exxxxxedit', expense)
	isEditMode.value = true
	currentEditItem.value = expense
	date.value = new Date(expense.date)
	selectedCate.value = expense.category
	descValue.value = expense.description
	countValue.value = expense.amount
	selectedType.value = expense.type
}
const removeExpense = (expense: ExpenseType) => {
	const confirmRemove = confirm('確定刪除嗎?')
	if (confirmRemove) {
		myExpenseList.value = myExpenseList.value.filter((item) => item.id !== expense.id)
		localStorage.setItem('storageExpense', JSON.stringify(myExpenseList.value))
		// console.log('remove', expense)
	}
}
</script>

<template>
	<div class="container">
		<div class="left_area">
			<div class="type_area">
				<input
					type="radio"
					name="type"
					id="expense"
					value="expense"
					checked
					v-model="selectedType"
				/>
				<label for="expense">支出</label>
				<input type="radio" name="type" id="income" value="income" v-model="selectedType" />
				<label for="income">收入</label>
			</div>
			<el-config-provider :locale="locale">
				<el-date-picker
					v-model="date"
					type="date"
					:default-value="new Date()"
					popper-class="custom-date-picker"
				/>
			</el-config-provider>
			<div class="category">
				<div class="category_item" v-for="cate in categories" :key="cate.id">
					<input
						v-model="selectedCate"
						name="category"
						:id="`cate${cate.id}`"
						type="radio"
						:value="cate.id"
					/>
					<label :for="`cate${cate.id}`">{{ cate.cate }}</label>
				</div>
				<div class="category_item" v-for="cate in customCategoriesArr" :key="cate.id">
					<input
						v-model="selectedCate"
						name="category"
						:id="`cate${cate.id}`"
						type="radio"
						:value="cate.id"
					/>
					<label :for="`cate${cate.id}`">{{ cate.cate }}</label>
				</div>
			</div>
			<div>
				<button
					class="management_btn"
					@click="showAddCategoryModal = !showAddCategoryModal"
				>
					分類管理
				</button>
				<div class="add_category_modal" v-if="showAddCategoryModal">
					<div class="add_category_content">
						<h3>分類管理</h3>
						<p>直接輸入並儲存可新增、點選該類別可編輯或刪除</p>
						<div class="add_category_items">
							<div
								class="category_item"
								v-for="cate in customCategoriesArr"
								:key="cate.id"
							>
								<input
									v-model="selectedAddCate"
									name="add_category"
									:id="`addcate${cate.id}`"
									type="radio"
									:value="cate.id"
									@change="getCategory(cate)"
								/>
								<label :for="`addcate${cate.id}`">{{ cate.cate }}</label>
							</div>
						</div>
						<input
							type="text"
							v-model="customCate"
							placeholder="請輸入自定義類別名稱"
						/>
						<div>
							<button @click="addCategory(customCate)">儲存</button>
							<button
								@click="selectedAddCate !== null && delCategory(selectedAddCate)"
							>
								刪除
							</button>
							<button
								class="close_btn"
								@click="showAddCategoryModal = !showAddCategoryModal"
							>
								關閉
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class="desc_area">
				<label for="desc">說明：</label>
				<input id="desc" type="text" v-model="descValue" class="desc_input" />
			</div>
			<div class="amount_area">
				<input v-model="countValue" type="text" readonly class="count_input" />
				<button class="AC" @click="clearInput">AC</button>
			</div>
			<div class="num_area">
				<div
					v-for="btn in buttons"
					:key="btn"
					class="num"
					@click="btn === '=' ? calculate() : appendToInput(btn)"
				>
					{{ btn }}
				</div>
			</div>

			<button @click="saveOrUpdate" class="save_btn">
				{{ isEditMode ? '更新' : '儲存' }}
			</button>
		</div>
		<div class="right_area">
			<ExpenseList
				:expenseList="myExpenseList"
				@editExpense="editExpense"
				@removeExpense="removeExpense"
			/>
		</div>
	</div>
</template>
<style lang="scss">
:root {
	--btn-big: 70px;
	--btn-small: 40px;
}
* {
	font-family: 'Roboto', serif;
	font-weight: 100;
	box-sizing: border-box;
}
.container {
	display: flex;
	gap: 40px;
	.left_area {
		flex: 0.5;
		max-width: 500px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-y: scroll;
		height: 90vh;
		padding-right: 5px;
		& > * {
			width: 100%;
		}
		&::-webkit-scrollbar {
			/* margin-left: 20px; */
			width: 5px;
			/* background: var(--color-secondary); */
			background: transparent;
			/* background: #000; */
		}

		&::-webkit-scrollbar-thumb {
			background: var(--color-secondary);
		}
		.el-input__wrapper,
		.el-input__inner {
			background-color: var(--color-secondary);
			color: var(--color-yellow);
			cursor: pointer;
			font-weight: 100;
			/* font-size: 15px; */
			letter-spacing: 1px;
		}
		.el-input__wrapper {
			box-shadow: 0 0 0 1px #22234c inset;
		}
		.el-input__inner {
			width: 90%;
		}
		.save_btn {
			margin-top: 15px;
			height: 40px;
			background-color: var(--color-secondary);
			width: 289px;
			padding: 10px;
			color: var(--color-yellow);
			@include mainColorBtn;
			&:hover {
				background-color: #22234c;
			}
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
	}
	.right_area {
		flex: 1;
	}
}
.management_btn {
	@include yellowBtn;
	padding: 5px 0;
	width: 100%;
	margin-bottom: 15px;
	&:hover {
		background-color: var(--color-yellow-second);
	}
}
.add_category {
	&_items {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 15px;
	}
	&_modal {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 99;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		@include flexCenter;
	}
	&_content {
		width: 500px;
		background-color: var(--color-main);
		padding: 20px;
		border-radius: 5px;
		text-align: center;
		color: var(--color-gray-light);

		.category_item > label {
			background-color: var(--color-secondary);
		}

		& > p {
			font-size: 14px;
			margin-bottom: 10px;
		}
		& > input {
			margin-bottom: 15px;
			/* width: 80%; */
			height: 40px;
			padding: 10px;
			outline: none;
			font-weight: 100;
			@include inputAndBtnType;
			background-color: var(--color-secondary);
			/* border: rgb(183, 154, 25) 1px solid; */
			width: 100%;
		}
		& > div > button {
			/* display: block; */
			@include mainColorBtn;
			padding: 5px 10px;
			border: none;
			background-color: rgb(103, 1, 1);

			&:first-of-type {
				margin: 3px;
				background-color: rgb(3, 67, 3);
			}
			&:last-of-type {
				margin: 3px;
				background-color: rgb(55, 55, 55);
			}
		}
	}
}
.category {
	display: flex;
	justify-content: left;
	flex-wrap: wrap;
	padding: 15px 10px;
	gap: 8px;
	& > button {
		@include flexCenter;
		@include yellowBtn;
		width: var(--btn-small);
		height: var(--btn-small);
		font-size: 20px;
		&:hover {
			background-color: var(--color-yellow-second);
		}
	}
	&_item {
		@include flexCenter;

		& > label {
			@include mainColorBtn;
			padding: 8px;
			color: var(--color-white);
			letter-spacing: 1px;
			&:hover {
				background-color: #22234c;
			}
		}
		& > input {
			display: none;
		}
		& > input:checked + label {
			background-color: var(--color-yellow);
			color: var(--color-secondary);
		}
	}
}
.amount_area {
	@include flexCenter;
	margin-bottom: 15px;
	gap: 15px;

	.count_input {
		height: 40px;
		width: 100%;
		padding: 10px;
		font-size: 16px;
		font-weight: 100;
		text-align: right;
		outline: none;
		color: var(--color-white);
		cursor: not-allowed;
		@include mainColorBtn;
	}
	.AC {
		width: var(--btn-small);
		height: var(--btn-small);
		font-weight: 300;
		@include flexCenter;
		@include yellowBtn;

		&:hover {
			background-color: var(--color-yellow-second);
		}
	}
}
.desc_area {
	@include flexCenter;
	margin-bottom: 15px;
	color: var(--color-white);
	.desc_input {
		width: 80%;
		height: 40px;
		padding: 10px;
		outline: none;
		font-weight: 100;
		@include inputAndBtnType;
	}
}
.num_area {
	display: grid;
	grid-template-columns: repeat(4, var(--btn-big));
	width: 100%;
	justify-content: center;
	gap: 3px;

	.num {
		width: var(--btn-big);
		height: var(--btn-big);
		font-size: 20px;
		font-weight: 100;
		color: var(--color-yellow);
		@include flexCenter;
		@include mainColorBtn;

		&:hover {
			background-color: #22234c;
		}
	}
}
</style>
