import type {
    JsonSchemaObjectType,
    TopLevelSchema
} from "@/schema/jsonSchemaType";
import {EdgeType, SchemaGraph, SchemaObjectNodeData} from "@/components/schema-diagram/schemaDiagramTypes";
import {EdgeData, SchemaObjectAttributeData} from "@/components/schema-diagram/schemaDiagramTypes";
import type {Path} from "@/utility/path";


export function constructSchemaGraph(rootSchema: TopLevelSchema): SchemaGraph {
    console.log("construct graph for schema ", rootSchema)
    const schemaGraph = new SchemaGraph([], [])


    if (rootSchema.$defs) {

        for (const [key, value] of Object.entries(rootSchema.$defs)) {
            constructObjectNode(
                ["$defs", key],
                key,
                value as JsonSchemaObjectType,
                schemaGraph
            )
        }
    }

    if (rootSchema.definitions) {
        for (const [key, value] of Object.entries(rootSchema.definitions)) {
           constructObjectNode(
                ["definitions", key],
                key,
                value as JsonSchemaObjectType,
               schemaGraph
            )
        }
    }

    if(rootSchema.type == 'object') {
        constructObjectNode(
            [],
            "root",
            rootSchema,
            schemaGraph
        )
    }

    console.log("result is ", schemaGraph)
    return  schemaGraph;
}



function constructObjectNode(absolutePath: Path, name: string, schema: JsonSchemaObjectType, graph: SchemaGraph) {
    const attributes: SchemaObjectAttributeData[] = [];

    if (schema.properties) {
        for (const [key, value] of Object.entries(schema.properties)) {
            // TODO: robustness check if type really is object?
            const attributeData = constructObjectAttribute(
                [...absolutePath, "properties", key],
                key,
                value as JsonSchemaObjectType,
                graph)
            attributes.push(attributeData);
            graph.edges.push(new EdgeData(
                absolutePath,
                attributeData.absolutePath,
                EdgeType.ATTRIBUTE
            ))
        }
    }
    const nodeData = new SchemaObjectNodeData(
        name,
        absolutePath,
        attributes
    )

    graph.nodes.push(nodeData)
}


function constructObjectAttribute(absolutePath: Path, name: string, schema: JsonSchemaObjectType, graph: SchemaGraph): SchemaObjectAttributeData {
    if (schema.$ref) {
        // TODO
    }

    const attributeData = new SchemaObjectAttributeData(
        name,
        schema.type as string,
        absolutePath,
        schema.deprecated ? schema.deprecated : false,
        false // todo: implement logic for this
    )

    if (schema.type == 'object') {
        constructObjectNode([...absolutePath],
            name,
            schema,
            graph)
    }

    return attributeData
}