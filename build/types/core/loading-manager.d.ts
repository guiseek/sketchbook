import { LoadingTrackerEntry } from './loading-trackerEntry';
import { Scenario } from '../world/scenario';
import { World } from '../world/World';
export declare class LoadingManager {
    firstLoad: boolean;
    onFinishedCallback: () => void;
    private world;
    private gltfLoader;
    private loadingTracker;
    constructor(world: World);
    loadGLTF(path: string, onLoadingFinished: (gltf: any) => void): void;
    addLoadingEntry(path: string): LoadingTrackerEntry;
    doneLoading(trackerEntry: LoadingTrackerEntry): void;
    createWelcomeScreenCallback(scenario: Scenario): void;
    private getLoadingPercentage;
    private isLoadingDone;
}
