import { ISpawnPoint } from '../interfaces/ispawn-point';
import * as THREE from 'three';
import { World } from './World';
import { LoadingManager } from '../core/loading-manager';
export declare class CharacterSpawnPoint implements ISpawnPoint {
    private object;
    constructor(object: THREE.Object3D);
    spawn(loadingManager: LoadingManager, world: World): void;
}
