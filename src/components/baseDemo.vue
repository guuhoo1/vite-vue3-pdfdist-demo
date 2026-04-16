<template>
  <div>
    <canvas ref="canvasRef"></canvas>

    <div style="margin-top: 10px">
      <button @click="prevPage">上一页</button>
      <span>{{ pageNum }} / {{ totalPages }}</span>
      <button @click="nextPage">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { usePdf } from './usePdf'
const canvasRef = ref(null)

const {
  pageNum,
  totalPages,
  loadPdf,
  renderPage
} = usePdf()

// 初始化
onMounted(async () => {
  await loadPdf('/pokemon-ultimate-edition-book.pdf')
  await nextTick() // 👈 确保 canvas 已挂载
  await renderPage(canvasRef.value, pageNum.value)
})

// 翻页
const nextPage = () => {
  if (pageNum.value < totalPages.value) {
    pageNum.value++
  }
}

const prevPage = () => {
  if (pageNum.value > 1) {
    pageNum.value--
  }
}

// 监听页码变化自动渲染
watch(pageNum, (val) => {
  renderPage(canvasRef.value, val)
})
</script>