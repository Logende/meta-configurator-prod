<script setup lang="ts">
import {Position} from '@vue-flow/core';
import {SchemaObjectNodeData} from '@/components/schema-diagram/schemaDiagramTypes';
import SchemaObjectAttribute from '@/components/schema-diagram/SchemaObjectAttribute.vue';

// props were passed from the slot using `v-bind="customNodeProps"`
const props = defineProps({
  data: SchemaObjectNodeData,
});
</script>

<template>
  <div class="vue-flow__node-schemaobject">
    <!--small><i>{{ props.data.absolutePath }}</i></small-->
    <b>{{ props.data.name }}</b>
    <SchemaObjectAttribute
      v-for="attribute in props.data!.attributes"
      :data="attribute!"></SchemaObjectAttribute>
  </div>
</template>

<style>
.vue-flow__node-schemaobject {
  background: lightsteelblue;
  color: black;
  padding: 2px;
}
</style>
