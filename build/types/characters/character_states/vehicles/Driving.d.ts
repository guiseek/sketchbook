import { VehicleSeat } from 'src/ts/vehicles/vehicle-seat';
import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../character';
export declare class Driving extends CharacterStateBase {
    private seat;
    constructor(character: Character, seat: VehicleSeat);
    update(timeStep: number): void;
}
