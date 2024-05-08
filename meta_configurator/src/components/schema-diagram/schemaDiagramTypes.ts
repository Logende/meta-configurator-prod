import type {Path, PathElement} from '@/utility/path';
import {pathToString} from '@/utility/pathUtils';
import {useLayout} from '@/components/schema-diagram/useLayout';
import {MarkerType} from '@vue-flow/core';

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
      let type = 'normal-edge';
      let label = 'no label';
      let color = 'black';
      const markerEnd = MarkerType.Arrow;

      switch (data.edgeType) {
        case EdgeType.ATTRIBUTE:
          label = 'contains';
          break;
        case EdgeType.ARRAY_ATTRIBUTE:
          label = 'contains 0..n';
          break;
        case EdgeType.ALL_OF:
          label = 'allOf';
          //  type = "smoothstep";
          color = 'seagreen';
          break;
        case EdgeType.ANY_OF:
          label = 'anyOf';
          //type = "smoothstep";
          color = 'seagreen';
          break;
        case EdgeType.ONE_OF:
          label = 'oneOf';
          // type = "smoothstep";
          color = 'seagreen';
          break;
        case EdgeType.IF:
          label = 'if';
          type = 'straight';
          color = 'indianred';
          break;
        case EdgeType.THEN:
          label = 'then';
          type = 'straight';
          color = 'indianred';
          break;
        case EdgeType.ELSE:
          label = 'else';
          type = 'straight';
          color = 'indianred';
          break;
      }

      return {
        id: pathsToEdgeId(data.start, data.end),
        source: pathToNodeId(data.start),
        target: pathToNodeId(data.end),
        type: type,
        label: label,
        data: data,
        markerEnd: markerEnd,
        animated: false,
        style: {stroke: color, 'stroke-width': 1.5},
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
  IF,
  THEN,
  ELSE,
}