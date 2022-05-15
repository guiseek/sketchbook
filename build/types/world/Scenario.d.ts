import { World } from './World';
import { LoadingManager } from '../core/loading-manager';
import { Object3D } from 'three';
export declare class Scenario {
    world: World;
    id: string;
    name: string;
    spawnAlways: boolean;
    default: boolean;
    descriptionTitle: string;
    descriptionContent: string;
    private rootNode;
    private spawnPoints;
    private invisible;
    private initialCameraAngle;
    constructor(root: Object3D, world: World);
    createLaunchLink(): void;
    launch(loadingManager: LoadingManager, world: World): void;
}
