import { VehicleSeat } from '../../../vehicles/vehicle-seat';
import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../character';
export declare class CloseVehicleDoorOutside extends CharacterStateBase {
    seat: VehicleSeat;
    private hasClosedDoor;
    constructor(character: Character, seat: VehicleSeat);
    update(timeStep: number): void;
}
