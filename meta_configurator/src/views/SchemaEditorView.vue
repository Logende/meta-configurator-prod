<script setup lang="ts">
import CombinedEditorComponent from '@/components/CombinedEditorComponent.vue';
import {SessionMode} from "@/store/sessionMode";
</script>

<template>
  <CombinedEditorComponent :mode="SessionMode.SchemaEditor" />
</template>

<style scoped></style>
