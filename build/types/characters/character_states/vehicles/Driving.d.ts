import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../character';
import { VehicleSeat } from 'src/ts/vehicles/vehicle-seat';
export declare class Driving extends CharacterStateBase {
    private seat;
    constructor(character: Character, seat: VehicleSeat);
    update(timeStep: number): void;
}
