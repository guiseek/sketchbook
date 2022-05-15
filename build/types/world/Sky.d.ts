import { IUpdatable } from '../interfaces/iupdatable';
import { default as CSM } from 'three-csm';
import { World } from './World';
import { Object3D, Vector3 } from 'three';
export declare class Sky extends Object3D implements IUpdatable {
    private world;
    updateOrder: number;
    sunPosition: Vector3;
    csm: CSM;
    set theta(value: number);
    set phi(value: number);
    private _phi;
    private _theta;
    private hemiLight;
    private maxHemiIntensity;
    private minHemiIntensity;
    private skyMesh;
    private skyMaterial;
    constructor(world: World);
    update(timeScale: number): void;
    refreshSunPosition(): void;
    refreshHemiIntensity(): void;
}
