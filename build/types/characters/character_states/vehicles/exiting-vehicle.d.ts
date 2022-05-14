import { Character } from '../../character';
import { VehicleSeat } from '../../../vehicles/vehicle-seat';
import { ExitingStateBase } from './exiting-state-base';
export declare class ExitingVehicle extends ExitingStateBase {
    constructor(character: Character, seat: VehicleSeat);
    update(timeStep: number): void;
}
