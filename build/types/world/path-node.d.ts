import { Object3D } from 'three';
import { Path } from './path';
export declare class PathNode {
    path: Path;
    object: Object3D;
    nextNode: PathNode;
    previousNode: PathNode;
    constructor(child: THREE.Object3D, path: Path);
}
