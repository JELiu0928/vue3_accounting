<script setup lang="ts">
import * as XLSX from 'xlsx'
import { defineProps ,ref,watch} from 'vue'
import  { ExpenseType } from '@/interfaces/ExpenseType'

const props = defineProps<{
  treeData: any  // 定義傳入的 treeData 型別
}>()
// const latestTreeData = ref(props.treeData)  // 用來儲存最新的 treeData


interface Category {
	children: Array<ExpenseType>
	id: string
	label: string
	total: number
	expanded: boolean
	type: string
}

const filterData = ()=>{
    const data:any[] = []

    // 遍歷treeData，每個分類都有children
    props.treeData.forEach((category:Category) => {
    //   latestTreeData.value.forEach(category => {
        // console.log('category',category)
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                // 將每個child的資料與其所屬的category資料結合
                data.push({
                    categoryName: category.label,  // 分類名稱
                    date: child.date,              // 日期
                    description: child.description, // 說明
                    amount: child.amount           // 金額
                })
            })
        }
    })

    return data
}

// watch(() => props.treeData, (newData) => {
//   latestTreeData.value = newData
//   console.log('最新的 treeData:', latestTreeData.value)
// })
const exportToExcel = () => {
    const data = filterData()
	const ws = XLSX.utils.json_to_sheet(data) // 將資料轉換為工作表
	const wb = XLSX.utils.book_new() // 創建一個新的工作簿
	XLSX.utils.book_append_sheet(wb, ws, '記帳資料') // 將工作表附加到工作簿
	XLSX.writeFile(wb, '帳目.xlsx') // 生成並下載檔案
}
// const ExcelUpload = (event: Event) => {
// 	// const file = event.target.files[0]
// 	const reader = new FileReader()

//     const target = event.target as HTMLInputElement
//     if (target && target.files) {
//         const file = target.files[0]
//         reader.onload = () => {
//             const data = reader.result
//             const wb = XLSX.read(data, { type: 'binary' })
//             const ws = wb.Sheets[wb.SheetNames[0]] // 取得第一個工作表
//             const json = XLSX.utils.sheet_to_json(ws) // 將工作表轉換為 JSON 格式
//             treeData.value = json // 更新樹狀資料
//             console.log(json) // 你可以在這裡處理匯入的資料
//         }

//         reader.readAsBinaryString(file)
//     }
// }
</script>

<template>
	<!-- <div class="excel_container"> -->
	<button class="excel_export" @click="exportToExcel">匯出 Excel</button>
	<!-- <label class="excel_upload" for="ExcelUpload">匯入 Excel</label> -->
	<!-- <input id="ExcelUpload" type="file" @change="ExcelUpload" /> -->
	<!-- <button @click="ExcelUpload"></button> -->
	<!-- </div> -->
</template>
<style lang="scss">
.excel {
	&_upload {
		@include yellowBtn;
		padding: 8px 10px;
		background-color: var(--color-yellow);
		border: none;
		color: var(--color-secondary);
		font-size: 14px;
		&:hover {
			background-color: var(--color-yellow-second);
		}
		& + input {
			display: none;
		}
	}
	
}
</style>
