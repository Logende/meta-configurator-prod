import type {JsonSchemaWrapper} from '@/schema/jsonSchemaWrapper';
import type {Path, PathElement} from '@/utility/path';
import {useCurrentSession} from '@/data/useDataLink';
import {pathToString} from '@/utility/pathUtils';

export class SchemaGraph {
  public constructor(public nodes: SchemaObjectNodeData[], public edges: EdgeData[]) {}

  public toVueFlowNodes() {
    return this.nodes.map(data => {
      return {
        id: pathToNodeId(data.absolutePath),
        position: {x: Math.random() * 500, y: Math.random() * 500},
        label: data.name,
        type: 'schemaobject',
        data: data,
      };
    });
  }

  public toVueFlowEdges() {
    return this.edges.map(data => {
      return {
        id: pathsToEdgeId(data.start, data.end),
        source: pathToNodeId(data.start),
        target: pathToNodeId(data.end),
        type: 'edge',
        data: data,
        animated: false,
      };
    });
  }
}

export function pathsToEdgeId(start: Path, end: Path): string {
  return '- ' + pathToNodeId(start) + ' - ' + pathToNodeId(end) + ' ->';
}

export function pathToNodeId(path: Path): string {
  if (path.length == 0) {
    return 'root';
  } else {
    return pathToString(path);
  }
}

export class SchemaObjectNodeData {
  public constructor(
    public name: string,
    public absolutePath: Path,
    public attributes: SchemaObjectAttributeData[]
  ) {}
}

export class SchemaObjectAttributeData {
  public constructor(
    public name: string,
    public type: string,
    public absolutePath: Path,
    public deprecated: boolean,
    public required: boolean
  ) {}
}

export class EdgeData {
  public constructor(public start: Path, public end: Path, public edgeType: EdgeType) {}
}

export enum EdgeType {
  ATTRIBUTE = 0,
  ATTRIBUTE_REF = 0,
}
