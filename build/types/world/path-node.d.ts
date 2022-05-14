import { Path } from './path';
import { Object3D } from 'three';
export declare class PathNode {
    object: Object3D;
    path: Path;
    nextNode: PathNode;
    previousNode: PathNode;
    constructor(child: THREE.Object3D, path: Path);
}
