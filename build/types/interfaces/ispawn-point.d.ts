import { World } from '../world/World';
import { LoadingManager } from '../core/loading-manager';
export interface ISpawnPoint {
    spawn(loadingManager: LoadingManager, world: World): void;
}
