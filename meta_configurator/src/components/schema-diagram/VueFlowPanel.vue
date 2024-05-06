<script setup lang="ts">

import {computed, ref} from "vue";

import { VueFlow, useVueFlow } from '@vue-flow/core'
import SchemaObjectNode from "@/components/schema-diagram/SchemaObjectNode.vue";
import {getSchemaForMode, useCurrentSession} from "@/data/useDataLink";
import {constructSchemaGraph} from "@/components/schema-diagram/schemaGraphConstructor";
import {JsonSchemaWrapper} from "@/schema/jsonSchemaWrapper";
import {SessionMode} from "@/store/sessionMode";


const currentGraph = computed(() => {
    const schema = getSchemaForMode(SessionMode.DataEditor);
    console.log("generate current graph")
    return constructSchemaGraph(schema.schemaPreprocessed.value)
});

const initialNodes = ref([
    {
        id: '1',
        type: 'type',
        position: { x: 50, y: 50 },
        label: 'Node 1',
    }
])
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

function onAddNode() {
    // add a single node to the graph
    addNodes(generateRandomNode())
}

function onAddNodes() {
    // add multiple nodes to the graph
    addNodes(Array.from({ length: 10 }, generateRandomNode))
}

</script>

<template>
    <VueFlow :nodes="currentGraph.toVueFlowNodes()">
        <template #node-type="props">
            <SchemaObjectNode v-bind="props" />
        </template>

    </VueFlow>

    <button type="button" @click="onAddNode">Add a node</button>
    <button type="button" @click="onAddNodes">Add multiple nodes</button>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
</style>