import * as THREE from 'three';
import { ISpawnPoint } from '../interfaces/ispawn-point';
import { World } from './World';
import { LoadingManager } from '../core/loading-manager';
export declare class VehicleSpawnPoint implements ISpawnPoint {
    type: string;
    driver: string;
    firstAINode: string;
    private object;
    constructor(object: THREE.Object3D);
    spawn(loadingManager: LoadingManager, world: World): void;
    private getNewVehicleByType;
}
