import { PathNode } from './path-node';
export declare class Path {
    nodes: {
        [nodeName: string]: PathNode;
    };
    private rootNode;
    constructor(root: THREE.Object3D);
    addNode(child: any): void;
    connectNodes(): void;
}
