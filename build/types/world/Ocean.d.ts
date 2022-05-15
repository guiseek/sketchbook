import { ShaderMaterial } from 'three';
import { IUpdatable } from '../interfaces/iupdatable';
import { World } from './World';
export declare class Ocean implements IUpdatable {
    private world;
    updateOrder: number;
    material: ShaderMaterial;
    constructor(object: any, world: World);
    update(timeStep: number): void;
}
