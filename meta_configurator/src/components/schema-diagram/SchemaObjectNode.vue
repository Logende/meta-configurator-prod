<script setup lang="ts">
import {SchemaObjectNodeData} from '@/components/schema-diagram/schemaDiagramTypes';
import SchemaObjectAttribute from '@/components/schema-diagram/SchemaObjectAttribute.vue';
import {getSessionForMode} from '@/data/useDataLink';
import {SessionMode} from '@/store/sessionMode';
import type {Path} from '@/utility/path';
import {pathToString} from '@/utility/pathUtils';
import {Position, Handle} from "@vue-flow/core";
import {onMounted} from "vue";
import {useSettings} from "@/settings/useSettings";


const props = defineProps<{
  data: SchemaObjectNodeData;
  targetPosition?: Position;
  sourcePosition?: Position;
}>();

const schemaSession = getSessionForMode(SessionMode.SchemaEditor);

const emit = defineEmits<{
  (e: 'select_element', path: Path): void;
}>();

function clickedNode() {
  emit('select_element', props.data.absolutePath);
}

function clickedAttribute(path: Path) {
  emit('select_element', path);
}

function isHighlighted() {
  return (
    pathToString(schemaSession.currentSelectedElement.value) ===
    pathToString(props.data.absolutePath)
  );
}
</script>

<template>
  <div
    :class="{'bg-yellow-100': isHighlighted(), 'vue-flow__node-schemaobject': !isHighlighted}"
    @click="clickedNode()">
      <Handle type="target" :position="props.targetPosition!"></Handle>
    <!--small><i>{{ props.data.absolutePath }}</i></small-->
    <b>{{ props.data.name }}</b>
    <hr />
    <SchemaObjectAttribute
            v-if="useSettings().schemaDiagram.showAttributes"
      v-for="attribute in props.data!.attributes"
      :data="attribute!"
      @select_element="clickedAttribute"></SchemaObjectAttribute>
      <Handle type="source" :position="props.sourcePosition!"></Handle>
  </div>
</template>

<style>
.vue-flow__node-schemaobject {
  background: lightblue;
  color: black;

  border: 1px solid lightblue;
  border-radius: 4px;
  box-shadow: 0 0 0 3px lightblue;
  padding: 0px;
}
</style>
