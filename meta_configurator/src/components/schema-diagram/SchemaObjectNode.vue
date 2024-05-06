<script setup lang="ts">
import { Position } from '@vue-flow/core'
import {SchemaObjectNodeData} from "@/components/schema-diagram/schemaDiagramTypes";
import SchemaObjectAttribute from "@/components/schema-diagram/SchemaObjectAttribute.vue";


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
  <div class="vue-flow__node-schemaobject">
    <Handle type="target" :position="Position.Top" />
      <div>{{ props.data.absolutePath }}</div>
      <div>{{ props.data.name }}</div>
      <SchemaObjectAttribute v-for="[key, value] of Object.entries(props.data?.schema.properties)"
                             :data="new SchemaObjectNodeData(key, value, ['unknown'])"></SchemaObjectAttribute>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<style>
.vue-flow__node-schemaobject {
    background: #c8d6e1;
    color: #000000;
    padding: 10px;
}

</style>