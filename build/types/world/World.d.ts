import * as THREE from 'three';
import * as CANNON from 'cannon';
import { CameraOperator } from '../core/camera-operator';
import { Stats } from '../../lib/utils/Stats';
import { CannonDebugRenderer } from '../../lib/cannon/CannonDebugRenderer';
import { InputManager } from '../core/Input-manager';
import { LoadingManager } from '../core/loading-manager';
import { InfoStack } from '../core/Info-stack';
import { IWorldEntity } from '../interfaces/iworld-entity';
import { IUpdatable } from '../interfaces/iupdatable';
import { Character } from '../characters/character';
import { Path } from './path';
import { Vehicle } from '../vehicles/vehicle';
import { Scenario } from './scenario';
import { Sky } from './sky';
export declare class World {
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    composer: any;
    stats: Stats;
    graphicsWorld: THREE.Scene;
    sky: Sky;
    physicsWorld: CANNON.World;
    parallelPairs: any[];
    physicsFrameRate: number;
    physicsFrameTime: number;
    physicsMaxPrediction: number;
    clock: THREE.Clock;
    renderDelta: number;
    logicDelta: number;
    requestDelta: number;
    sinceLastFrame: number;
    justRendered: boolean;
    params: any;
    inputManager: InputManager;
    cameraOperator: CameraOperator;
    timeScaleTarget: number;
    console: InfoStack;
    cannonDebugRenderer: CannonDebugRenderer;
    scenarios: Scenario[];
    characters: Character[];
    vehicles: Vehicle[];
    paths: Path[];
    scenarioGUIFolder: any;
    updatables: IUpdatable[];
    private lastScenarioID;
    constructor(worldScenePath?: any);
    update(timeStep: number, unscaledTimeStep: number): void;
    updatePhysics(timeStep: number): void;
    isOutOfBounds(position: CANNON.Vec3): boolean;
    outOfBoundsRespawn(body: CANNON.Body, position?: CANNON.Vec3): void;
    /**
     * Rendering loop.
     * Implements fps limiter and frame-skipping
     * Calls world's "update" function before rendering.
     * @param {World} world
     */
    render(world: World): void;
    setTimeScale(value: number): void;
    add(worldEntity: IWorldEntity): void;
    registerUpdatable(registree: IUpdatable): void;
    remove(worldEntity: IWorldEntity): void;
    unregisterUpdatable(registree: IUpdatable): void;
    loadScene(loadingManager: LoadingManager, gltf: any): void;
    launchScenario(scenarioID: string, loadingManager?: LoadingManager): void;
    restartScenario(): void;
    clearEntities(): void;
    scrollTheTimeScale(scrollAmount: number): void;
    updateControls(controls: any): void;
    private generateHTML;
    private createParamsGUI;
}
