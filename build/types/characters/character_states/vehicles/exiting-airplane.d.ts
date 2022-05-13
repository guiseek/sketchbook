import { Character } from '../../character';
import { VehicleSeat } from '../../../vehicles/VehicleSeat';
import { ExitingStateBase } from './exiting-state-base';
export declare class ExitingAirplane extends ExitingStateBase {
    constructor(character: Character, seat: VehicleSeat);
    update(timeStep: number): void;
}
