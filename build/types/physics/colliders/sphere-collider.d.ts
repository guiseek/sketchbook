import { ICollider } from '../../interfaces/icollider';
import * as CANNON from 'cannon';
import { Mesh } from 'three';
export declare class SphereCollider implements ICollider {
    options: any;
    body: CANNON.Body;
    debugModel: Mesh;
    constructor(options: any);
}
