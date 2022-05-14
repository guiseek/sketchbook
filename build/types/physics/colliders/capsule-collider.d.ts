import * as CANNON from 'cannon';
import { ICollider } from '../../interfaces/icollider';
export declare class CapsuleCollider implements ICollider {
    options: any;
    body: CANNON.Body;
    constructor(options: any);
}
