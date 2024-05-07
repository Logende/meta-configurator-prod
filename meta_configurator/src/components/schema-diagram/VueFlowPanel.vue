<script setup lang="ts">

import {computed, ref} from "vue";

import { VueFlow, useVueFlow } from '@vue-flow/core'
import SchemaObjectNode from "@/components/schema-diagram/SchemaObjectNode.vue";
import {getSchemaForMode, useCurrentSession} from "@/data/useDataLink";
import {constructSchemaGraph} from "@/components/schema-diagram/schemaGraphConstructor";
import {SessionMode} from "@/store/sessionMode";
import {JsonSchemaWrapper} from "@/schema/jsonSchemaWrapper";
import {Path} from "@/utility/path";



const props = defineProps<{
    sessionMode: SessionMode;
    currentPath: Path;
}>();

const emit = defineEmits<{
    (e: 'zoom_into_path', path_to_add: Path): void;
    (e: 'select_path', path: Path): void;
}>();


const currentGraph = computed(() => {
    const schema = getSchemaForMode(SessionMode.DataEditor);
    console.log("generate current graph")
    return constructSchemaGraph(schema.schemaPreprocessed.value)
});


const { addNodes } = useVueFlow()

function generateRandomNode() {
    return {
        id: Math.random().toString(),
        position: { x: Math.random() * 500, y: Math.random() * 500 },
        label: 'Random Node',
        type: 'schemaobject',
        data: useCurrentSession().schemaAtCurrentPath
    }
}


</script>

<template>
    <VueFlow :nodes="currentGraph.toVueFlowNodes()"
    :edges="currentGraph.toVueFlowEdges()">
        <template #node-schemaobject="props">
            <SchemaObjectNode v-bind="props" />
        </template>

    </VueFlow>

</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
</style>