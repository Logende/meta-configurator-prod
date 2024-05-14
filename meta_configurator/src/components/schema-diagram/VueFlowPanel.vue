<script setup lang="ts">
import {computed, nextTick, onMounted, ref, watch} from 'vue';

import {useVueFlow, VueFlow} from '@vue-flow/core';
import SchemaObjectNode from '@/components/schema-diagram/SchemaObjectNode.vue';
import {getDataForMode, getSchemaForMode, getSessionForMode} from '@/data/useDataLink';
import {constructSchemaGraph} from '@/components/schema-diagram/schemaGraphConstructor';
import {SessionMode} from '@/store/sessionMode';
import {Path} from '@/utility/path';
import {useLayout} from './useLayout';
import type {Edge, Node} from '@/components/schema-diagram/schemaDiagramTypes';
import SchemaEnumNode from '@/components/schema-diagram/SchemaEnumNode.vue';
import {pathToString} from "@/utility/pathUtils";
import {useSettings} from "@/settings/useSettings";

const props = defineProps<{
  currentPath: Path;
}>();

const emit = defineEmits<{
  (e: 'zoom_into_path', path_to_add: Path): void;
  (e: 'select_path', path: Path): void;
}>();

const schemaData = getDataForMode(SessionMode.SchemaEditor);
const schemaSession = getSessionForMode(SessionMode.SchemaEditor);

const currentNodes = ref<Node[]>([]);
const currentEdges = ref<Edge[]>([]);

const graphDirection = computed(() => {
    // note that having edges from left ro right will usually lead to a more vertical graph, because usually it is
    // not very deeply nested, but there exist many nodes on the same levels
  return useSettings().schemaDiagram.vertical ? "LR" : "TB";
});

watch(getSchemaForMode(SessionMode.DataEditor).schemaPreprocessed, () => {
    // TODO: compare new and old nodes and then if no nodes are added, only update the data and if needed remove some node
  updateGraph();

  nextTick(() => {
    layoutGraph(graphDirection.value);
  });
});

onMounted(() => {
  updateGraph();
});


// scroll to the current selected element when it changes
watch(
    schemaSession.currentSelectedElement,
    () => {
        const absolutePath = schemaSession.currentSelectedElement.value;
        const node = currentNodes.value.find((node) => pathToString(absolutePath).startsWith(node.id));
        // TODO: function to find most suitable node for an ID
        console.log("updatd current selected element with path and node ", absolutePath, node)
        if (node) {
            console.log("node found", node.id)
            nextTick(() => {
                console.log("fitting view")
                fitView(
                    {
                        nodes: [node.id],
                        duration: 1000, // use this if you want a smooth transition to the node
                        padding: 1 // use this for some padding around the node
                    }
                )
            });
        }
    },
    {deep: true}
);

function updateGraph() {
  const schema = getSchemaForMode(SessionMode.DataEditor);
  const graph = constructSchemaGraph(schema.schemaPreprocessed.value);
  const vueFlowGraph = graph.toVueFlowGraph();
  currentNodes.value = vueFlowGraph.nodes;
  currentEdges.value = vueFlowGraph.edges;
}

const {layout} = useLayout();
const {fitView} = useVueFlow();

async function layoutGraph(direction) {
  currentNodes.value = layout(currentNodes.value, currentEdges.value, direction);
  nextTick(() => {
    fitView();
  });
}

function clickedNodeOrAttribute(path: Path) {
  if (schemaData.dataAt(path) != undefined) {
    emit('select_path', path);
  }
}
</script>

<template>
  <div class="layout-flow">
    <VueFlow
      :nodes="currentNodes"
      :edges="currentEdges"
      @nodes-initialized="layoutGraph(graphDirection)"
      :max-zoom="4"
      :min-zoom="0.1">
      <template #node-schemaobject="props">
        <SchemaObjectNode :data="props.data" @select_element="clickedNodeOrAttribute" :source-position="props.sourcePosition" :target-position="props.targetPosition"/>
      </template>
      <template #node-schemaenum="props">
        <SchemaEnumNode :data="props.data" @select_element="clickedNodeOrAttribute" :source-position="props.sourcePosition" :target-position="props.targetPosition"/>
      </template>
    </VueFlow>
  </div>
</template>

<style>
.layout-flow {
  background-color: white;
  height: 100%;
  width: 100%;
}
</style>
