<template>
    <PdfViewer :url="pdfUrl" />
    <PdfViewer :url="pdfUrl2" />
</template>


<script setup>
import { ref } from 'vue';
import PdfViewer from './PdfViewer.vue';

const pdfUrl = ref('/pokemon-ultimate-edition-book.pdf')
const pdfUrl2 = ref('/demo.pdf')


</script>
