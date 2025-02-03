<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ExpenseList from './ExpenseList.vue'
import { ElDatePicker, ElConfigProvider } from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// 定義 input 欄位的值
const countValue = ref<string>('')
const descValue = ref('')

// 定義按鈕的數字或符號
const buttons = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', '.', '=', '+']
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
const date = ref(new Date())
const locale = zhCn
const selectedCate = ref(null)
const selectedType = ref('expense')
const myExpenseList = ref([])
const isEditMode = ref(false) // 是否為編輯模式
const currentEditItem = ref(null) // 當前編輯的項目

const loadStorageExpense = () => {
	const storageExpense = localStorage.getItem('storageExpense')
	if (storageExpense) {
		myExpenseList.value = JSON.parse(storageExpense)
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
	if (operators.includes(lastChar)) {
		countValue.value = countValue.value.slice(0, -1) // 去掉最後一個符號
	}
	try {
		// 使用 eval 計算數學表達式
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
		const selectedCategory = categories.find((c) => c.id === selectedCate.value)
		console.log('===', selectedType.value)
		const defaultDescription = selectedCategory ? selectedCategory.cate : ''
		countValue.value = String(eval(countValue.value.replace(/÷/g, '/').replace(/×/g, '*')))
		const expense = {
			id: isEditMode.value ? currentEditItem.value.id : Date.now(), // 如果是編輯模式，保持 id 不變,
			date: formattedDate,
			amount: countValue.value,
			category: selectedCate.value,
			description: descValue.value || defaultDescription,
			type: selectedType.value,
		}

		// 編輯模式下更新資料
		if (isEditMode.value) {
			console.log('編輯', currentEditItem.value)
			const index = myExpenseList.value.findIndex((item) => {
				console.log('item', item)
				return item.id === currentEditItem.value.id
			})
			console.log('index', index)
			if (index !== -1) {
				myExpenseList.value[index] = expense
			}
		} else {
			console.log('新增')

			// 新增項目
			myExpenseList.value.push(expense)
		}
		// myExpenseList.value.push(expense)
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

	console.log(myExpenseList)
	console.log(localStorage.getItem('storageExpense'))
}
const editExpense = (expense) => {
	console.log('ex', expense)
	isEditMode.value = true
	currentEditItem.value = expense
	date.value = new Date(expense.date)
	selectedCate.value = expense.category
	descValue.value = expense.description
	countValue.value = expense.amount
	selectedType.value = expense.type
}
const removeExpense = (expense) => {
	// localStorage.getItem('storageExpense')
	const confirmRemove = confirm('確定刪除嗎?')
	if (confirmRemove) {
		myExpenseList.value = myExpenseList.value.filter((item) => item.id !== expense.id)
		localStorage.setItem('storageExpense', JSON.stringify(myExpenseList.value))
		console.log('remove', expense)
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
			</div>
			<div class="desc_area">
				<label for="desc">說明：</label>
				<input id="desc" type="text" v-model="descValue" class="desc_input" />
			</div>
			<div class="amount_area">
				<input v-model="countValue" type="text" readonly class="count_input" />
				<div class="AC" @click="clearInput">AC</div>
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
	font-family: 'Roboto', serif;
	font-weight: 100;
}
.container {
	box-sizing: border-box;

	display: flex;
	justify-content: center;
	gap: 40px;
	.left_area {
		/* width: 100%; */
		flex: 0.5;
		max-width: 500px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-sizing: border-box;
		/* border: 1px solid #fff; */
		& > * {
			width: 100%;
		}

		.el-input__wrapper,
		.el-input__inner {
			background-color: var(--color-second);
			color: var(--color-yellow);
			cursor: pointer;
			font-family: 'Roboto', serif;
			font-weight: 100;
			font-size: 15px;
			letter-spacing: 1px;
			/* border: transparent solid 1px; */
			/* border-top: 1px solid #22234c; */
			/* border-bottom: 1px solid #22234c; */
		}
		.el-input__wrapper {
			box-shadow: 0 0 0 1px #22234c inset;
		}
		.el-input__inner {
			width: 90%;
		}
		.save_btn {
			margin-top: 15px;
			/* line-height: 40px; */
			height: 40px;
			background-color: var(--color-second);
			width: 289px;
			color: var(--color-yellow);
			/* border: 1px solid #22234c;
			border-radius: 5px;
			cursor: pointer; */
			@include border5;
			&:hover {
				background-color: #22234c;
			}
		}
		.type_area {
			display: flex;
			justify-content: center;
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
	}
	.right_area {
		flex: 1;
		/* margin-left: 2rem; */
	}
}

.category {
	display: flex;
	flex-wrap: wrap;
	justify-content: left;
	padding: 10px;
	gap: 8px;
	&_item {
		/* margin: 20px; */
		/* flex: 1; */
		/* margin-bottom: 15px; */
		display: flex;
		align-items: center;
		& > label {
			/* font-size: large; */
			background-color: var(--color-second);
			padding: 8px;
			/* cursor: pointer;
			border: 1px solid #22234c;
			border-radius: 5px; */
			@include border5;
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
			color: var(--color-second);
		}
	}
}
.amount_area {
	display: flex;
	margin-bottom: 15px;
	align-items: center;
	gap: 15px;
	justify-content: center;
	.count_input {
		/* width: 100%; */
		/* flex: 1; */
		padding: 10px;
		font-size: 20px;
		font-weight: 100;

		outline: none;
		/* border: 1px solid #22234c;
		border-radius: 5px; */

		@include border5;
		cursor: not-allowed;

		text-align: right;
		height: 40px;
		color: var(--color-white);
		background-color: var(--color-second);

		font-family: 'Roboto', serif;
		font-weight: 100;
	}
	.AC {
		border-radius: 5px;
		/* margin-left: 10px; */
		/* width: 40px; */
		/* height: 40px; */
		width: var(--btn-small);
		height: var(--btn-small);
		/* width: 20%; */
		background-color: var(--color-yellow);
		color: var(--color-second);
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		&:hover {
			background-color: var(--color-yellow-second);
		}
	}
}
.desc_area {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 15px;
	color: var(--color-white);
	.desc_input {
		padding: 10px;
		/* font-size: 20px; */
		outline: none;
		border: 1px solid #22234c;
		border-radius: 5px;
		height: 40px;
		color: var(--color-white);
		background-color: var(--color-second);
		font-family: 'Roboto', serif;
		font-weight: 100;
		width: 80%;
	}
}
.num_area {
	display: grid;
	grid-template-columns: repeat(4, var(--btn-big));
	width: 100%;
	/* align-content: center; */
	justify-items: center;
	justify-content: center;
	gap: 3px;

	.num {
		width: var(--btn-big);
		height: var(--btn-big);
		/* margin: 5px; */
		/* width: 100%; */
		/* height: 100%; */
		border-radius: 5px;
		border: 1px solid #22234c;
		font-size: 20px;
		background-color: var(--color-second);
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		color: var(--color-yellow);
		font-weight: 100;

		&:hover {
			background-color: #22234c;
		}
	}
}
</style>
