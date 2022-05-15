import { LoadingManager } from '../core/loading-manager';
import { ISpawnPoint } from '../interfaces/ispawn-point';
import { World } from './World';
import { Object3D } from 'three';
export declare class VehicleSpawnPoint implements ISpawnPoint {
    private object;
    type: string;
    driver: string;
    firstAINode: string;
    constructor(object: Object3D);
    spawn(loadingManager: LoadingManager, world: World): void;
    private getNewVehicleByType;
}
