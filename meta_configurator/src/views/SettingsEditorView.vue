<script setup lang="ts">
import CombinedEditorComponent from '@/components/CombinedEditorComponent.vue';
import {SessionMode} from "@/store/sessionMode";
</script>

<template>
  <CombinedEditorComponent :mode="SessionMode.Settings"/>
</template>

<style scoped></style>
