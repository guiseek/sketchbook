import * as THREE from 'three';
import { World } from './World';
import { IUpdatable } from '../interfaces/iupdatable';
export declare class Ocean implements IUpdatable {
    updateOrder: number;
    material: THREE.ShaderMaterial;
    private world;
    constructor(object: any, world: World);
    update(timeStep: number): void;
}
