import { ICollider } from '../../interfaces/icollider';
import * as CANNON from 'cannon';
export declare class CapsuleCollider implements ICollider {
    options: any;
    body: CANNON.Body;
    constructor(options: any);
}
