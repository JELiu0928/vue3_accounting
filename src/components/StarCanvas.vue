<template>
    <div class="container">
        <div class="starry-sky">
            <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight" class="star-canvas"></canvas>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
// 設置畫布寬度/長度為瀏覽器寬度/長度的 3 倍
const canvasWidth = window.innerWidth * 3
const canvasHeight = window.innerHeight * 3

const initCanvas = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    // 畫布繪圖上下文
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 設置背景
    ctx.fillStyle = '#090a29'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // 繪製星星：遍歷畫布的大部分區域
    for (let i = 1; i < 1000; i++) {
        for (let j = 1; j < 1000; j++) {
            // 使用隨機偏移來打破網格感
            const randomOffsetX = i * Math.random() * canvasWidth * 0.05
            const randomOffsetY = j * Math.random() * canvasHeight * 0.05

            // 星星大小隨機
            const radius = Math.random() 

            // 創建放射性漸變
            const gradient = ctx.createRadialGradient(
                randomOffsetX, randomOffsetY, 0, 
                randomOffsetX, randomOffsetY, radius * 5
            )

            // 漸變顏色 0是中心 往1(邊緣)漸變
            gradient.addColorStop(0, '#fffbea')
            gradient.addColorStop(1, '#050515')

            // 繪製星星
            ctx.beginPath()
            ctx.arc(randomOffsetX, randomOffsetY, radius, 0, 2 * Math.PI)
            ctx.fillStyle = gradient
            ctx.fill()
        }
    }
   
}

onMounted(() => {
    initCanvas()
})
</script>

<style scoped>
.container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: -1;
}

.starry-sky {
    position: relative;
    top: -100vh;
    left: -100vw;
    width: 300vw;
    height: 300vh;
    animation: rotateCanvas 120s infinite linear;
}

@keyframes rotateCanvas {
    0%{
        transform: rotate(0);
    }
    100%{
        transform: rotate(360deg);
    }
}
</style>