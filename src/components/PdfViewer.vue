<template>
    <!-- 缩略图 -->
    <div class="pdf-thumb" @click="open = true">
        <canvas ref="thumbCanvas"></canvas>
    </div>

    {{ props.url }}

    <!-- 展开层 -->
    <div v-if="open" class="pdf-modal">
        <div class="pdf-toolbar">
            <button @click="prevPage">上一页</button>
            <span>{{ pageNum }} / {{ totalPages }}</span>
            <button @click="nextPage">下一页</button>
            <button @click="open = false">关闭</button>
        </div>

        <canvas ref="fullCanvas"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, shallowRef } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

const props = defineProps({
    url: String
})

const pdfDoc = shallowRef(null)

const open = ref(false)
const pageNum = ref(1)
const totalPages = ref(0)

const thumbCanvas = ref(null)
const fullCanvas = ref(null)

// 加载 PDF
const loadPdf = async () => {
    const task = pdfjsLib.getDocument(props.url)
    pdfDoc.value = await task.promise
    totalPages.value = pdfDoc.value.numPages
    renderThumb()
}

// 👉 渲染缩略图（第一页）
const renderThumb = async () => {
    const page = await pdfDoc.value.getPage(1)

    const viewport = page.getViewport({ scale: 0.3 })
    const canvas = thumbCanvas.value
    const ctx = canvas.getContext('2d')

    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
        canvasContext: ctx,
        viewport
    }).promise
}

// 👉 渲染当前页
const renderPage = async () => {
    if (!open.value) return

    await nextTick()

    const page = await pdfDoc.value.getPage(pageNum.value)

    const viewport = page.getViewport({ scale: 1.5 })
    const canvas = fullCanvas.value
    const ctx = canvas.getContext('2d')

    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({
        canvasContext: ctx,
        viewport
    }).promise
}

// 翻页
const nextPage = () => {
    if (pageNum.value < totalPages.value) pageNum.value++
}

const prevPage = () => {
    if (pageNum.value > 1) pageNum.value--
}

// 打开后渲染
watch(open, async (val) => {
    if (val) {
        await renderPage()
    }
})

// 翻页渲染
watch(pageNum, () => {
    renderPage()
})

// onMounted(() => {
//     loadPdf()
// })

watch(
    () => props.url,
    async (val) => {
        if (!val) return

        pageNum.value = 1
        open.value = false
        await loadPdf()
    },
    { immediate: true }
)
</script>

<style scoped>
.pdf-thumb {
    width: 160px;
    cursor: pointer;
    border: 1px solid #ddd;
}

.pdf-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.pdf-toolbar {
    color: white;
    margin-bottom: 10px;
    display: flex;
    gap: 10px;
}
</style>