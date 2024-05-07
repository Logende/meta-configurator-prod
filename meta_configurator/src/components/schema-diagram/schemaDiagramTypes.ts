import type {Path, PathElement} from '@/utility/path';
import {pathToString} from '@/utility/pathUtils';
import {useLayout} from '@/components/schema-diagram/useLayout';

export class SchemaGraph {
  public constructor(public nodes: SchemaObjectNodeData[], public edges: EdgeData[]) {}

  private toVueFlowNodes(): Node[] {
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

  private toVueFlowEdges(): Edge[] {
    return this.edges.map(data => {
      return {
        id: pathsToEdgeId(data.start, data.end),
        source: pathToNodeId(data.start),
        target: pathToNodeId(data.end),
        type: 'default', // todo: different edges for different types
        data: data,
        animated: false,
      };
    });
  }

  public toVueFlowGraph(): VueFlowGraph {
    const nodes = this.toVueFlowNodes();
    const edges = this.toVueFlowEdges();
    return new VueFlowGraph(nodes, edges);
  }
}

export class VueFlowGraph {
  public constructor(public nodes: Node[], public edges: Edge[]) {}

  public updateLayout() {
    this.nodes = useLayout().layout(this.nodes, this.edges);
  }
}

export interface Node {
  id: string;
  position: {x: number; y: number};
  label: string;
  type: string;
  data: any;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: string;
  data: any;
  animated: boolean;
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
  ATTRIBUTE,
  ARRAY_ATTRIBUTE,
  ALL_OF,
  ANY_OF,
  ONE_OF,
}
