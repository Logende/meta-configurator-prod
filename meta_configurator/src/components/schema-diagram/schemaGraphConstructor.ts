import type {JsonSchemaObjectType, TopLevelSchema} from '@/schema/jsonSchemaType';
import {
  EdgeType,
  SchemaGraph,
  SchemaObjectNodeData,
} from '@/components/schema-diagram/schemaDiagramTypes';
import {EdgeData, SchemaObjectAttributeData} from '@/components/schema-diagram/schemaDiagramTypes';
import type {Path} from '@/utility/path';
import {jsonPointerToPath} from '@/utility/pathUtils';

export function constructSchemaGraph(rootSchema: TopLevelSchema): SchemaGraph {
  console.log('construct graph for schema ', rootSchema);
  const schemaGraph = new SchemaGraph([], []);

  if (rootSchema.$defs) {
    for (const [key, value] of Object.entries(rootSchema.$defs)) {
      constructObjectNode(['$defs', key], key, value as JsonSchemaObjectType, schemaGraph);
    }
  }

  if (rootSchema.definitions) {
    for (const [key, value] of Object.entries(rootSchema.definitions)) {
      constructObjectNode(['definitions', key], key, value as JsonSchemaObjectType, schemaGraph);
    }
  }

  constructObjectNode([], 'root', rootSchema, schemaGraph);

  console.log('result is ', schemaGraph);
  return schemaGraph;
}

function constructObjectNode(
  absolutePath: Path,
  name: string,
  schema: JsonSchemaObjectType,
  graph: SchemaGraph
) {
  const attributes: SchemaObjectAttributeData[] = [];

  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      // TODO: robustness check if type really is object?
      const attributeData = constructObjectAttribute(
        absolutePath,
        [...absolutePath, 'properties', key],
        key,
        value as JsonSchemaObjectType,
        graph
      );
      attributes.push(attributeData);
    }
  }
  const nodeData = new SchemaObjectNodeData(name, absolutePath, attributes);

  graph.nodes.push(nodeData);
}

function constructObjectAttribute(
  nodePath: Path,
  absolutePath: Path,
  name: string,
  schema: JsonSchemaObjectType,
  graph: SchemaGraph
): SchemaObjectAttributeData {
  const attributeData = new SchemaObjectAttributeData(
    name,
    schema.type as string,
    absolutePath,
    schema.deprecated ? schema.deprecated : false,
    false // todo: implement logic for this
  );

  if (schema.type == 'object') {
    constructObjectNode(absolutePath, name, schema, graph);
    graph.edges.push(new EdgeData(nodePath, absolutePath, EdgeType.ATTRIBUTE));
  } else if (schema.type == 'array') {
    // TODO
  } else if (schema.$ref) {
    graph.edges.push(
      new EdgeData(
        nodePath,
        jsonPointerToPath(schema.$ref.replace('#', '')),
        EdgeType.ATTRIBUTE_REF
      )
    );
  }

  return attributeData;
}
