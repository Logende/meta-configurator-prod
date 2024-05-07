import type {JsonSchemaObjectType, JsonSchemaType, TopLevelSchema} from '@/schema/jsonSchemaType';
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
      if (typeof schema === 'object') {
        const required = schema.required ? schema.required.includes(key) : false;
        const attributeData = constructObjectAttribute(
          absolutePath,
          [...absolutePath, 'properties', key],
          key,
          value as JsonSchemaObjectType,
          required,
          graph
        );
        attributes.push(attributeData);
      }
    }
  }

  if (schema.allOf) {
    constructObjectSubSchemasContent(
      absolutePath,
      [...absolutePath, 'allOf'],
      schema.allOf,
      graph,
      EdgeType.ALL_OF
    );
  }
  if (schema.anyOf) {
    constructObjectSubSchemasContent(
      absolutePath,
      [...absolutePath, 'anyOf'],
      schema.anyOf,
      graph,
      EdgeType.ANY_OF
    );
  }
  if (schema.oneOf) {
    constructObjectSubSchemasContent(
      absolutePath,
      [...absolutePath, 'oneOf'],
      schema.oneOf,
      graph,
      EdgeType.ONE_OF
    );
  }

  const nodeData = new SchemaObjectNodeData(name, absolutePath, attributes);

  graph.nodes.push(nodeData);
}

function constructObjectSubSchemasContent(
  nodePath: Path,
  absolutePath: Path,
  subSchemas: JsonSchemaType[],
  graph: SchemaGraph,
  edgeType: EdgeType
) {
  for (const [index, value] of subSchemas.entries()) {
    constructObjectSubSchemaContent(nodePath, [...absolutePath, index], value, graph, edgeType);
  }
}

function constructObjectSubSchemaContent(
  nodePath: Path,
  absolutePath: Path,
  subSchema: JsonSchemaType,
  graph: SchemaGraph,
  edgeType: EdgeType
) {
  if (typeof subSchema === 'object') {
    if (subSchema.$ref) {
      graph.edges.push(
        new EdgeData(nodePath, jsonPointerToPath(subSchema.$ref.replace('#', '')), edgeType)
      );
    } else {
      const subObjectNodeId = absolutePath.slice(absolutePath.length - 2).join('/');
      constructObjectNode(absolutePath, subObjectNodeId, subSchema as JsonSchemaObjectType, graph);
      graph.edges.push(new EdgeData(nodePath, absolutePath, edgeType));
    }
  }
}

function constructObjectAttribute(
  nodePath: Path,
  absolutePath: Path,
  name: string,
  schema: JsonSchemaObjectType,
  required: boolean,
  graph: SchemaGraph
): SchemaObjectAttributeData {
  const attributeData = new SchemaObjectAttributeData(
    name,
    schema.type ? schema.type : 'unknown',
    absolutePath,
    schema.deprecated ? schema.deprecated : false,
    required
  );

  if (schema.type == 'object') {
    constructObjectNode(absolutePath, name, schema, graph);
    graph.edges.push(new EdgeData(nodePath, absolutePath, EdgeType.ATTRIBUTE));
  } else if (schema.type == 'array') {
    constructObjectSubSchemaContent(
      nodePath,
      [...absolutePath, 'items'],
      schema.items as JsonSchemaType,
      graph,
      EdgeType.ARRAY_ATTRIBUTE
    );
  } else if (schema.$ref) {
    graph.edges.push(
      new EdgeData(nodePath, jsonPointerToPath(schema.$ref.replace('#', '')), EdgeType.ATTRIBUTE)
    );
  }

  return attributeData;
}
