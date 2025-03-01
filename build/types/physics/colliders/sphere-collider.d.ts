import * as CANNON from 'cannon';
import * as THREE from 'three';
import { ICollider } from '../../interfaces/icollider';
export declare class SphereCollider implements ICollider {
    options: any;
    body: CANNON.Body;
    debugModel: THREE.Mesh;
    constructor(options: any);
}
