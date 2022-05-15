import { SimulatorBase } from './simulator-base';
import { SimulationFrameVector } from './simulation-frame-vector';
import { Vector3 } from 'three';
export declare class VectorSpringSimulator extends SimulatorBase {
    position: Vector3;
    velocity: Vector3;
    target: Vector3;
    cache: SimulationFrameVector[];
    constructor(fps: number, mass: number, damping: number);
    init(): void;
    /**
     * Advances the simulation by given time step
     * @param {number} timeStep
     */
    simulate(timeStep: number): void;
    /**
     * Gets another simulation frame
     */
    getFrame(isLastFrame: boolean): SimulationFrameVector;
}
