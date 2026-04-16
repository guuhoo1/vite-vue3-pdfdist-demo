// usePdf.js
import { ref, shallowRef } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

export function usePdf() {
    const pdfDoc = shallowRef(null)
    const pageNum = ref(1)
    const totalPages = ref(0)
    const loading = ref(false)

    // 👇 关键：防止并发渲染
    let rendering = false

    const loadPdf = async (url) => {
        loading.value = true
        try {
            const loadingTask = pdfjsLib.getDocument(url)
            pdfDoc.value = await loadingTask.promise

            console.log('pdfDoc:', pdfDoc.value)

            console.log(typeof pdfDoc.value.getPage)
            totalPages.value = pdfDoc.value.numPages
        } finally {
            loading.value = false
        }
    }

    const renderPage = async (canvas, num = 1) => {
        if (!pdfDoc.value || rendering) return

        rendering = true

        try {
            const page = await pdfDoc.value.getPage(num)

            const viewport = page.getViewport({ scale: 1.5 })
            const context = canvas.getContext('2d')

            canvas.height = viewport.height
            canvas.width = viewport.width

            const renderTask = page.render({
                canvasContext: context,
                viewport
            })

            await renderTask.promise
        } catch (err) {
            console.error('render error:', err)
        } finally {
            rendering = false
        }
    }

    return {
        pdfDoc,
        pageNum,
        totalPages,
        loading,
        loadPdf,
        renderPage
    }
}