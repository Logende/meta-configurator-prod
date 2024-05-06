import type {JsonSchemaWrapper} from "@/schema/jsonSchemaWrapper";
import type {Path, PathElement} from "@/utility/path";
import {useCurrentSession} from "@/data/useDataLink";


export class SchemaGraph {
    public constructor(public nodes: SchemaObjectNodeData[],
                       public edges: EdgeData[]) {
    }


    public toVueFlowNodes() {
        return this.nodes.map(data =>
            {
                return {
                    id: Math.random().toString(),
                    position: { x: Math.random() * 500, y: Math.random() * 500 },
                    label: data.name,
                    type: 'schemaobject',
                    data: data
                }
            }
        )
    }

}


export class SchemaObjectNodeData {

    public constructor(public name: string,
                       public absolutePath: Path,
                       public attributes: SchemaObjectAttributeData[]) {
    }

}

export class SchemaObjectAttributeData {

    public constructor(public name: string,
                       public type: string,
                       public absolutePath: Path,
                       public deprecated: boolean,
                       public required: boolean) {
    }

}

export class EdgeData {
    public constructor(public start: Path,
                       public end: Path,
                       public edgeType: EdgeType) {
    }
}


export enum EdgeType {
    ATTRIBUTE = 0
}