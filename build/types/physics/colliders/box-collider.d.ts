import * as CANNON from 'cannon';
import * as THREE from 'three';
import { ICollider } from '../../interfaces/icollider';
export declare class BoxCollider implements ICollider {
    options: any;
    body: CANNON.Body;
    debugModel: THREE.Mesh;
    constructor(options: any);
}
