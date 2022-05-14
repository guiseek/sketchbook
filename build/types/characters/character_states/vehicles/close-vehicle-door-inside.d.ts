import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../character';
import { VehicleSeat } from '../../../vehicles/vehicle-seat';
export declare class CloseVehicleDoorInside extends CharacterStateBase {
    private seat;
    private hasClosedDoor;
    constructor(character: Character, seat: VehicleSeat);
    update(timeStep: number): void;
}
