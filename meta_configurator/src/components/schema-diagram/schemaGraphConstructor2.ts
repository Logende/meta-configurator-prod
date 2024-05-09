import type {
  JsonSchemaObjectType,
  JsonSchemaType,
  SchemaPropertyTypes,
  TopLevelSchema,
} from '@/schema/jsonSchemaType';
import {
  EdgeData,
  EdgeType,
  SchemaGraph,
  SchemaObjectAttributeData,
  SchemaObjectNodeData,
} from '@/components/schema-diagram/schemaDiagramTypes';
import type {Path} from '@/utility/path';
import {getTypeDescription} from '@/schema/schemaReadingUtils';
import {jsonPointerToPath, pathToString} from '@/utility/pathUtils';
import {mergeAllOfs} from '@/schema/mergeAllOfs';

export function constructSchemaGraph2(rootSchema: TopLevelSchema): SchemaGraph {
  // copy schema to avoid modifying the original
  //rootSchema = JSON.parse(JSON.stringify(rootSchema));
  rootSchema = mergeAllOfs(rootSchema);

  const objectDefs = new Map<string, SchemaObjectNodeData>();
  identifyObjectDefinitions([], rootSchema, objectDefs);

  if (rootSchema.$defs) {
    for (const [key, value] of Object.entries(rootSchema.$defs)) {
      identifyObjectDefinitions(['$defs', key], value, objectDefs);
    }
  }
  if (rootSchema.definitions) {
    for (const [key, value] of Object.entries(rootSchema.definitions)) {
      identifyObjectDefinitions(['definitions', key], value, objectDefs);
    }
  }

  const schemaGraph = new SchemaGraph([], []);
  for (const [path, node] of objectDefs.entries()) {
    if (node.schema.type == 'object') {
      node.type = resolveObjectNodeType(node, objectDefs);
      schemaGraph.nodes.push(node);
      node.attributes = generateObjectAttributes(node.absolutePath, node.schema, objectDefs);
      generateAttributeEdges(node, objectDefs, schemaGraph);
    }
  }

  // remove all edges, where the receiver node is not an object
  schemaGraph.edges = schemaGraph.edges.filter(edge => {
    return edge.end.schema.type == 'object';
  });

  return schemaGraph;
}

function identifyObjectDefinitions(
  currentPath: Path,
  schema: JsonSchemaType,
  defs: Map<string, SchemaObjectNodeData>
) {
  if (schema === true || schema === false) {
    return new Map();
  }

  // It can be that simple types, such as strings with enum constraint, have their own definition.
  // We allow generating a node for this, so it can be referred to by other objects.
  // But we do not visualize those nodes for simple types.
  if (schema.type == 'object' || schema.title) {
    defs.set(pathToString(currentPath), generateInitialNode(currentPath, schema));
  }

  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties)) {
      if (typeof value === 'object') {
        if (value.type == 'object' || value.type == 'array') {
          const childPath = [...currentPath, 'properties', key];
          identifyObjectDefinitions(childPath, value, defs);
        }
      }
    }
  }
  if (schema.patternProperties) {
    for (const [key, value] of Object.entries(schema.patternProperties)) {
      if (typeof value === 'object') {
        if (value.type == 'object' || value.type == 'array') {
          const childPath = [...currentPath, 'patternProperties', key];
          identifyObjectDefinitions(childPath, value, defs);
        }
      }
    }
  }
  if (schema.items) {
    if (typeof schema.items === 'object') {
      const childPath = [...currentPath, 'items'];
      identifyObjectDefinitions(childPath, schema.items, defs);
    }
  }
  /*
    if (schema.oneOf) {
        for (const [index, value] of schema.oneOf.entries()) {
            if (typeof value === 'object') {
                result.set([...currentPath, 'oneOf', index.toString()], value);
            }
        }
    }
    if (schema.anyOf) {
        for (const [index, value] of schema.anyOf.entries()) {
            if (typeof value === 'object') {
                result.set([...currentPath, 'anyOf', index.toString()], value);
            }
        }
    }
    if (schema.allOf) {
        for (const [index, value] of schema.allOf.entries()) {
            if (typeof value === 'object') {
                result.set([...currentPath, 'allOf', index.toString()], value);
            }
        }
    }
    if (schema.if) {
        if (typeof schema.if === 'object') {
            result.set([...currentPath, 'if'], schema.if);
        }
    }
    if (schema.then) {
        if (typeof schema.then === 'object') {
            result.set([...currentPath, 'then'], schema.then);
        }
    }
    if (schema.else) {
        if (typeof schema.else === 'object') {
            result.set([...currentPath, 'else'], schema.else);
        }
    }
    if (schema.additionalProperties) {
        if (typeof schema.additionalProperties === 'object') {
            result.set([...currentPath, 'additionalProperties'], schema.additionalProperties);
        }
    }*/
}

function generateInitialNode(path: Path, schema: JsonSchemaObjectType): SchemaObjectNodeData {
  return new SchemaObjectNodeData(generateObjectTitle(path), path, schema, [], undefined);
}

function generateObjectTitle(path: Path): string {
  if (path.length == 0) {
    return 'root';
  }
  const lastElement = path[path.length - 1];
  if (typeof lastElement === 'string') {
    return lastElement;
  }
  if (path.length >= 2) {
    const titleOfParent = generateObjectTitle(path.slice(0, path.length - 1));
    return titleOfParent + '[' + lastElement + ']';
  } else {
    return 'element[' + lastElement + ']';
  }
}

function generateObjectAttributes(
  path: Path,
  schema: JsonSchemaObjectType,
  objectDefs: Map<string, SchemaObjectNodeData>
): SchemaObjectAttributeData[] {
  const attributes: SchemaObjectAttributeData[] = [];
  for (const [attributeName, attributeSchema] of Object.entries(schema.properties || {})) {
    if (typeof attributeSchema === 'object') {
      const required = schema.required ? schema.required.includes(attributeName) : false;
      let typeDescription = generateAttributeTypeDescription(
        [...path, 'properties', attributeName],
        attributeSchema,
        objectDefs
      );
      const attributeData = new SchemaObjectAttributeData(
        attributeName,
        typeDescription,
        [...path, 'properties', attributeName],
        attributeSchema.deprecated ? attributeSchema.deprecated : false,
        required,
        attributeSchema
      );
      attributes.push(attributeData);
    }
  }
  return attributes;
}

function generateAttributeTypeDescription(
  path: Path,
  schema: JsonSchemaObjectType,
  objectDefs: Map<string, SchemaObjectNodeData>
): string {
  // use regular type description, which is good for simple types
  let typeDescription = getTypeDescription(schema);

  // if data type has a reference, overwrite with the object behind the reference
  const referenceObject = resolveReferenceNode(schema, objectDefs);
  if (referenceObject) {
    typeDescription = referenceObject.name;
  }

  // if data type is an array, overwrite with the type of the array items
  if (schema.type == 'array' && schema.items) {
    const arrayItemObject = resolveArrayItemNode(path, schema, objectDefs);
    if (arrayItemObject) {
      typeDescription = arrayItemObject.name + '[]';
    } else {
      if (typeof schema.items === 'object') {
        typeDescription = getTypeDescription(schema.items) + '[]';
      }
    }
  }

  // if data type is an object, overwrite with actual name of the object definition
  if (schema.type == 'object') {
    const attributeNode = resolveObjectAttributeNode(path, schema, objectDefs);
    if (attributeNode) {
      typeDescription = attributeNode.name;
    }
  }

  return typeDescription;
}

function generateAttributeEdges(
  node: SchemaObjectNodeData,
  objectDefs: Map<string, SchemaObjectNodeData>,
  graph: SchemaGraph
) {
  for (const attribute of node.attributes) {
    const attrSchema = attribute.schema;

    if (attrSchema.$ref) {
      const referenceObject = resolveReferenceNode(attrSchema, objectDefs);
      if (referenceObject) {
        graph.edges.push(new EdgeData(node, referenceObject, EdgeType.ATTRIBUTE));
      } else {
        console.warn(
          'Unable to find reference node for attribute ' +
            attribute.name +
            ' with path ' +
            pathToString(attribute.absolutePath)
        );
      }
    } else if (attrSchema.type == 'object') {
      const objectAttributeNode = resolveObjectAttributeNode(
        attribute.absolutePath,
        attrSchema,
        objectDefs
      );
      if (objectAttributeNode) {
        graph.edges.push(new EdgeData(node, objectAttributeNode, EdgeType.ATTRIBUTE));
      }
    } else if (attrSchema.type == 'array') {
      const arrayItemObject = resolveArrayItemNode(attribute.absolutePath, attrSchema, objectDefs);
      // if the array item type is a simple type, then no node will be found and no edge created
      if (arrayItemObject) {
        graph.edges.push(new EdgeData(node, arrayItemObject, EdgeType.ARRAY_ATTRIBUTE));
      }
    }
  }
}

function resolveReferenceNode(
  schema: JsonSchemaObjectType,
  objectDefs: Map<string, SchemaObjectNodeData>
): SchemaObjectNodeData | undefined {
  if (schema.$ref) {
    const refPath = jsonPointerToPath(schema.$ref.replace('#', ''));
    const refPathString = pathToString(refPath);
    if (objectDefs.has(refPathString)) {
      return objectDefs.get(refPathString);
    }
  }
  return undefined;
}

function resolveArrayItemNode(
  path: Path,
  schema: JsonSchemaObjectType,
  objectDefs: Map<string, SchemaObjectNodeData>
): SchemaObjectNodeData | undefined {
  if (schema.type == 'array' && schema.items) {
    if (typeof schema.items == 'object') {
      let itemObjectPath = [...path, 'items'];
      const referenceObject = resolveReferenceNode(schema.items, objectDefs);
      if (referenceObject) {
        itemObjectPath = referenceObject.absolutePath;
      }
      return objectDefs.get(pathToString(itemObjectPath));
    }
  }
  return undefined;
}

function resolveObjectAttributeNode(
  path: Path,
  schema: JsonSchemaObjectType,
  objectDefs: Map<string, SchemaObjectNodeData>
): SchemaObjectNodeData | undefined {
  if (schema.type == 'object') {
    return objectDefs.get(pathToString(path));
  }
  return undefined;
}

function resolveObjectNodeType(
  node: SchemaObjectNodeData,
  objectDefs: Map<string, SchemaObjectNodeData>
): SchemaPropertyTypes | undefined {
  if (node.schema.type) {
    return node.schema.type;
  }
  const referenceObject = resolveReferenceNode(node.schema, objectDefs);
  if (referenceObject) {
    return referenceObject.schema.type;
  }
  return undefined;
}
