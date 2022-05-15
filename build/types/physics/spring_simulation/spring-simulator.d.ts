import { SimulationFrame } from './simulation-frame';
import { SimulatorBase } from './simulator-base';
export declare class SpringSimulator extends SimulatorBase {
    position: number;
    velocity: number;
    target: number;
    cache: SimulationFrame[];
    constructor(fps: number, mass: number, damping: number, startPosition?: number, startVelocity?: number);
    /**
     * Advances the simulation by given time step
     * @param {number} timeStep
     */
    simulate(timeStep: number): void;
    /**
     * Gets another simulation frame
     */
    getFrame(isLastFrame: boolean): SimulationFrame;
}
