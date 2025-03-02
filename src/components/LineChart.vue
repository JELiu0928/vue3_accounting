<script setup lang="ts">
import { ref, onMounted, watch ,nextTick } from 'vue';
import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

let chartInstance: Chart | null = null;


const props = defineProps<{
    lineChartData: any  // 定義傳入的 treeData 型別
}>()
// Vue3 + Vite 環境下使用 Chart.js，需要手動註冊模組
Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


const chartCanvas = ref<HTMLCanvasElement | null>(null);

const renderChart = () => {
    //利用ref取得canvas，以操作js
    const canvas = chartCanvas.value;
    
    // 設定較高解析度，防止模糊
    if(canvas){
        const ctx = canvas.getContext('2d');   

        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = 800 * pixelRatio; // 內部解析度變寬
        canvas.height = 600 * pixelRatio;
        ctx && ctx.scale(pixelRatio, pixelRatio);

    // nextTick(() => {
        if (chartInstance) {
            chartInstance.destroy();
        }
        const { labels, incomeData, expenseData } = props.lineChartData;
        // console.log('labesls ',labels,'incomeData',incomeData,'expenseData',expenseData)
        chartInstance = new Chart(canvas, {
            type: 'line',
            data: {
            labels,
            datasets: [incomeData,expenseData]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                    ticks: {
                        autoSkip: false, // 禁止自動隱藏標籤
                        maxRotation: 0,  // 防止標籤旋轉，讓它們直列顯示
                        minRotation: 0
                    }
                    }
                }
            }
        });
  
    }

};

// watch(() => props.expenseList, renderChart, { deep: true });
watch(() => props.lineChartData, renderChart, { deep: true });
onMounted(() => {
    renderChart();
});
</script>
<template>
    <div>
        <canvas ref="chartCanvas"></canvas>
    </div>
</template>
<style scoped>
    div {
        width: 100%;
        height: 300px;
    }
</style>
<!-- <template>
    <div style="width: 100%; max-width: 600px; height: 400px;">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { Chart, LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
  
  const chartCanvas = ref(null);
  let chartInstance = null;
  
  // ✅ 必須手動註冊 Chart.js 模組
  Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
  
  const renderChart = () => {
    if (chartInstance) {
      chartInstance.destroy(); // 銷毀舊圖表，避免重複渲染
    }
  
    // 📌 ✅ 這裡是寫死的收支數據
    const labels = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'];
    const incomeData = [5000, 7000, 6500, 8000, 7200, 9000]; // 收入
    const expenseData = [3000, 4500, 4000, 5000, 4800, 6000]; // 支出
  
    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '收入',
            data: incomeData,
            borderColor: 'green',
            backgroundColor: 'rgba(0, 255, 0, 0.2)',
            fill: true
          },
          {
            label: '支出',
            data: expenseData,
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.2)',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  };
  
  onMounted(() => {
    renderChart();
  });
  </script> -->
  