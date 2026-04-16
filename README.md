# PDF 组件库说明文档

## 项目概述

本项目基于 Vue 3 + Vite + pdfjs-dist 实现了一个功能完整的 PDF 查看组件库，包含以下核心功能：

- PDF 文件加载与渲染
- 页面导航（上一页/下一页）
- 缩略图预览
- 全屏查看模式
- 多 PDF 文件同时展示

## 核心文件说明

### 1. usePdf.js

**路径**：`src/components/usePdf.js`

**功能**：Vue 3 组合式 API 钩子，提供 PDF 加载和渲染的核心功能。

**主要功能**：
- 加载 PDF 文件
- 渲染指定页码的 PDF 内容
- 管理 PDF 文档状态
- 防止并发渲染

**核心 API**：

| 名称 | 类型 | 描述 |
|------|------|------|
| `pdfDoc` | `shallowRef` | PDF 文档对象 |
| `pageNum` | `ref` | 当前页码 |
| `totalPages` | `ref` | 总页数 |
| `loading` | `ref` | 加载状态 |
| `loadPdf(url)` | `function` | 加载 PDF 文件 |
| `renderPage(canvas, num)` | `function` | 渲染指定页码到画布 |

**实现细节**：
- 使用 `shallowRef` 存储 PDF 文档对象，提高性能
- 实现了并发渲染防止机制
- 完整的错误处理

### 2. PdfViewer.vue

**路径**：`src/components/PdfViewer.vue`

**功能**：完整的 PDF 查看器组件，支持缩略图和全屏查看模式。

**主要功能**：
- 显示 PDF 第一页缩略图
- 点击缩略图打开全屏查看模式
- 全屏模式下的页面导航
- 响应式布局

**使用方法**：
```vue
<PdfViewer :url="pdfUrl" />
```

**属性**：
- `url`：PDF 文件的 URL 路径

**实现细节**：
- 独立实现了 PDF 加载和渲染逻辑
- 使用 `watch` 监听 URL 变化，自动重新加载 PDF
- 模态框式全屏查看

### 3. baseDemo.vue

**路径**：`src/components/baseDemo.vue`

**功能**：基础的 PDF 查看演示，展示了如何使用 `usePdf` 钩子。

**主要功能**：
- 加载指定 PDF 文件
- 显示页码信息
- 提供翻页功能

**实现细节**：
- 使用 `usePdf` 钩子管理 PDF 状态
- 监听页码变化自动渲染
- 确保 canvas 元素已挂载后再渲染

### 4. HelloWorld.vue

**路径**：`src/components/HelloWorld.vue`

**功能**：主组件，展示多个 PDF 文件的使用示例。

**实现细节**：
- 导入并使用 `PdfViewer` 组件
- 展示多个 PDF 文件的预览

## 技术实现细节

### PDF 加载与渲染流程

1. **配置 PDF.js**：
   ```javascript
   import * as pdfjsLib from 'pdfjs-dist'
   import workerSrc from 'pdfjs-dist/build/pdf.worker?url'
   
   pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
   ```

2. **加载 PDF 文件**：
   ```javascript
   const loadingTask = pdfjsLib.getDocument(url)
   pdfDoc.value = await loadingTask.promise
   totalPages.value = pdfDoc.value.numPages
   ```

3. **渲染 PDF 页面**：
   ```javascript
   const page = await pdfDoc.value.getPage(num)
   const viewport = page.getViewport({ scale: 1.5 })
   const context = canvas.getContext('2d')
   
   canvas.height = viewport.height
   canvas.width = viewport.width
   
   await page.render({
     canvasContext: context,
     viewport
   }).promise
   ```

### 性能优化

1. **使用 shallowRef**：
   - 对于 PDF 文档对象这种大型对象，使用 `shallowRef` 可以避免深度响应式带来的性能损耗

2. **防止并发渲染**：
   - 使用 `rendering` 标志防止多个渲染任务同时执行

3. **合理的组件拆分**：
   - 将 PDF 核心逻辑抽离到 `usePdf` 钩子
   - 组件化设计，提高代码复用性

### 响应式设计

1. **监听属性变化**：
   - 使用 `watch` 监听 URL 变化，自动重新加载 PDF
   - 监听页码变化，自动渲染对应页面

2. **条件渲染**：
   - 只有在打开状态下才渲染全屏 PDF
   - 确保 canvas 元素已挂载后再渲染

## 常见问题和解决方案

### 1. 错误：Cannot read private member #pagesNumber

**原因**：PDF 文档对象加载失败或不完整，导致访问其私有成员时出错。

**解决方案**：
- 确保 PDF 文件路径正确
- 添加错误处理机制
- 验证 PDF 文档对象的完整性

### 2. PDF 渲染不出来

**可能原因**：
- Canvas 元素未正确挂载
- PDF 文件路径错误
- 网络问题导致 PDF 加载失败

**解决方案**：
- 使用 `nextTick` 确保 Canvas 已挂载
- 检查 PDF 文件路径
- 添加加载状态和错误提示

### 3. 性能问题

**解决方案**：
- 使用 `shallowRef` 存储 PDF 文档对象
- 实现并发渲染防止机制
- 合理控制渲染时机

## 示例代码

### 基础使用示例

```vue
<template>
  <div>
    <canvas ref="canvasRef"></canvas>
    <div>
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

onMounted(async () => {
  await loadPdf('/example.pdf')
  await nextTick()
  await renderPage(canvasRef.value, pageNum.value)
})

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

watch(pageNum, (val) => {
  renderPage(canvasRef.value, val)
})
</script>
```

### 高级使用示例

```vue
<template>
  <div>
    <PdfViewer :url="pdfUrl" />
    <PdfViewer :url="anotherPdfUrl" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PdfViewer from './PdfViewer.vue'

const pdfUrl = ref('/document1.pdf')
const anotherPdfUrl = ref('/document2.pdf')
</script>
```

## 总结

本项目实现了一个功能完整、性能优化的 PDF 查看组件库，基于 Vue 3 和 pdfjs-dist 实现。通过合理的组件设计和性能优化，提供了流畅的 PDF 查看体验。

主要特点：
- 模块化设计，核心逻辑抽离到 `usePdf` 钩子
- 支持多 PDF 文件同时展示
- 缩略图预览和全屏查看模式
- 完善的错误处理和性能优化
- 响应式设计，自动适应数据变化

该组件库可以直接集成到 Vue 3 项目中，用于展示和查看 PDF 文件，满足各种 PDF 查看场景的需求。