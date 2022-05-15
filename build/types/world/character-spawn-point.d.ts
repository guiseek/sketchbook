import { ISpawnPoint } from '../interfaces/ispawn-point';
import { LoadingManager } from '../core/loading-manager';
import { Object3D } from 'three';
import { World } from './World';
export declare class CharacterSpawnPoint implements ISpawnPoint {
    object: Object3D;
    constructor(object: Object3D);
    spawn(loadingManager: LoadingManager, world: World): void;
}
