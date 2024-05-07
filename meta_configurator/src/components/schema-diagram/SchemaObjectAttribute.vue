<script setup lang="ts">
import {Position} from '@vue-flow/core';
import {
  SchemaObjectAttributeData,
  SchemaObjectNodeData,
} from '@/components/schema-diagram/schemaDiagramTypes';

// props were passed from the slot using `v-bind="customNodeProps"`
const props = defineProps({
  data: SchemaObjectAttributeData,
});
</script>

<template>
  <div class="vue-flow__node-schemaattribute">
    <li>{{ props.data.name }}: {{ props.data.type }}</li>
  </div>
</template>

<style>
.vue-flow__node-schemaattribute {
  background: lightgray;
  color: #000000;
  padding: 0px;
}
</style>
