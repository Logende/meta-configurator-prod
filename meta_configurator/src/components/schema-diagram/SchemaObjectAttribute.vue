<script setup lang="ts">
import {SchemaObjectAttributeData} from '@/components/schema-diagram/schemaDiagramTypes';

const props = defineProps({
  data: SchemaObjectAttributeData,
});
</script>

<template>
  <div class="vue-flow__node-schemaattribute">
    <li>
      <span :class="{'line-through': props.data?.deprecated}">{{ props.data.name }}</span>
      <span class="text-red-600">{{ props.data.required ? '*' : '' }}</span>
      <span>: {{ props.data.type }}</span>
    </li>
  </div>
</template>

<style>
.vue-flow__node-schemaattribute {
  background: lightgray;
  color: #000000;
  padding: 0px;
}
</style>
