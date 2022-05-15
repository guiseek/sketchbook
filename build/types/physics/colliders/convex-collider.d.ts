import { ICollider } from '../../interfaces/icollider';
import { Object3D } from 'three';
import * as CANNON from 'cannon';
export declare class ConvexCollider implements ICollider {
    mesh: any;
    options: any;
    body: CANNON.Body;
    debugModel: any;
    constructor(mesh: Object3D, options: any);
}
