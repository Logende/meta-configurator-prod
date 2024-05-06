<script setup lang="ts">
import { Position } from '@vue-flow/core'
import {SchemaObjectNodeData} from "@/components/schema-diagram/schemaDiagramTypes";


// props were passed from the slot using `v-bind="customNodeProps"`
const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    data: SchemaObjectNodeData

})

</script>

<template>
  <div class="vue-flow__node-schemaattribute">
      <div>{{ props.data.name }}</div>
  </div>
</template>

<style>
.vue-flow__node-schemaattribute {
    background: #42a8f8;
    color: #000000;
    padding: 10px;
}

</style>