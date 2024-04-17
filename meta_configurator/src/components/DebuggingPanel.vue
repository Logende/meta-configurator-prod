<!--
Panel for debugging purposes
-->
<script setup lang="ts">
import {computed} from 'vue';
import {useSessionStore} from '@/store/sessionStore';
import {
    getDataForMode,
    getSchemaForMode,
    getSessionForMode,
} from '@/data/useDataLink';


const sessionMode = computed(() => useSessionStore().currentMode);


const fileData = computed(() => getFileData());
const schemaContent = computed(() => getSchema());
const dataAtCurrentPathContent = computed(() => getDataAtCurrentPath());
function getFileData() {
  return getDataForMode(this.mode).unparsedData.value;
}

function getSchema() {
  return JSON.stringify(getSchemaForMode(this.mode).schemaWrapper.value);
}

function getDataAtCurrentPath() {
  return JSON.stringify(getSessionForMode(this.mode).dataAtCurrentPath);
}
</script>

<template>
  <div><b>currentMode:</b> {{ sessionMode }}</div>
  <div><b>currentPath:</b> {{ getSessionForMode(sessionMode).currentPath }}</div>
  <div><b>currentSelectedElement:</b> {{ getSessionForMode(sessionMode).currentSelectedElement.value }}</div>
  <div><b>fileData</b></div>
  <textarea class="bg-amber-300" v-model="fileData" />
  <div><b>schemaContent</b></div>
  <textarea class="bg-cyan-200" v-model="schemaContent" />
  <div><b>dataAtCurrentPath</b></div>
  <textarea class="bg-green-300" v-model="dataAtCurrentPathContent" />
</template>

<style scoped></style>
