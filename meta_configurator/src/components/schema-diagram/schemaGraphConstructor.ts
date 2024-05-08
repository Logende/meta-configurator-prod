import type {JsonSchemaObjectType, JsonSchemaType, TopLevelSchema} from '@/schema/jsonSchemaType';
import {
  EdgeData,
  EdgeType,
  SchemaGraph,
  SchemaObjectAttributeData,
  SchemaObjectNodeData,
} from '@/components/schema-diagram/schemaDiagramTypes';
import type {Path} from '@/utility/path';
import {jsonPointerToPath} from '@/utility/pathUtils';
import {getTypeDescription} from "@/schema/schemaReadingUtils";

export function constructSchemaGraph(rootSchema: TopLevelSchema): SchemaGraph {
  const schemaGraph = new SchemaGraph([], []);

  if (rootSchema.$defs) {
    for (const [key, value] of Object.entries(rootSchema.$defs)) {
      constructObjectOrBooleanNode(['$defs', key], key, value as JsonSchemaObjectType, schemaGraph);
    }
  }

  if (rootSchema.definitions) {
    for (const [key, value] of Object.entries(rootSchema.definitions)) {
      constructObjectOrBooleanNode(['definitions', key], key, value as JsonSchemaObjectType, schemaGraph);
    }
  }

  constructObjectOrBooleanNode([], 'root', rootSchema, schemaGraph);

  return schemaGraph;
}

function constructObjectOrBooleanNode(
  absolutePath: Path,
  name: string,
  schema: JsonSchemaType,
  graph: SchemaGraph
) {

  if (schema === true || schema === false) {
    const nodeData = new SchemaObjectNodeData(schema.toString(), absolutePath, []);
    graph.nodes.push(nodeData);
    return;
  }

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
      EdgeType.ALL_OF,
        true
    );
  }
  if (schema.anyOf) {
    constructObjectSubSchemasContent(
      absolutePath,
      [...absolutePath, 'anyOf'],
      schema.anyOf,
      graph,
      EdgeType.ANY_OF,
        true
    );
  }
  if (schema.oneOf) {
    constructObjectSubSchemasContent(
        absolutePath,
        [...absolutePath, 'oneOf'],
        schema.oneOf,
        graph,
        EdgeType.ONE_OF,
        true
    );
  }

  // TODO: put if,else,then as subcomponent within the ObjectNode
  if (schema.if) {
    constructObjectSubSchemaContent(
        absolutePath,
        [...absolutePath, 'if'],
        schema.if,
        graph,
        EdgeType.IF,
        false
    );
  }
  if (schema.then) {
    constructObjectSubSchemaContent(
        absolutePath,
        [...absolutePath, 'then'],
        schema.then,
        graph,
        EdgeType.THEN,
        false
    );
  }

    if (schema.else) {
      constructObjectSubSchemaContent(
          absolutePath,
          [...absolutePath, 'else'],
          schema.else,
          graph,
          EdgeType.ELSE,
          false
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
  edgeType: EdgeType,
  isHierarchicalParent: boolean
) {
  for (const [index, value] of subSchemas.entries()) {
    constructObjectSubSchemaContent(nodePath, [...absolutePath, index], value, graph, edgeType, isHierarchicalParent);
  }
}

function constructObjectSubSchemaContent(
  nodePath: Path,
  absolutePath: Path,
  subSchema: JsonSchemaType,
  graph: SchemaGraph,
  edgeType: EdgeType,
  isHierarchicalParent: boolean
) {
  if (typeof subSchema === 'object' && subSchema.$ref) {
      graph.edges.push(
        new EdgeData(nodePath, jsonPointerToPath(subSchema.$ref.replace('#', '')), edgeType)
      );
  } else {
    const subObjectNodeId = absolutePath.slice(absolutePath.length - 2).join('/');
    constructObjectOrBooleanNode(absolutePath, subObjectNodeId, subSchema, graph);
    if (isHierarchicalParent) {
      graph.edges.push(new EdgeData(absolutePath, nodePath, edgeType));
    } else {
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

  let typeDescription = getTypeDescription(schema);

  if (schema.type == 'object') {
    constructObjectOrBooleanNode(absolutePath, name, schema, graph);
    graph.edges.push(new EdgeData(nodePath, absolutePath, EdgeType.ATTRIBUTE));
  } else if (schema.type == 'array') {
    constructObjectSubSchemaContent(
      nodePath,
      [...absolutePath, 'items'],
      schema.items as JsonSchemaType,
      graph,
      EdgeType.ARRAY_ATTRIBUTE,
        false
    );
  } else if (schema.$ref) {
    typeDescription = 'ref';
    graph.edges.push(
      new EdgeData(nodePath, jsonPointerToPath(schema.$ref.replace('#', '')), EdgeType.ATTRIBUTE)
    );
  }


  return new SchemaObjectAttributeData(
      name,
      typeDescription,
      absolutePath,
      schema.deprecated ? schema.deprecated : false,
      required
  );
}
