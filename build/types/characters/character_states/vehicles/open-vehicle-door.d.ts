import { VehicleSeat } from '../../../vehicles/vehicle-seat';
import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../character';
import { Object3D } from 'three';
export declare class OpenVehicleDoor extends CharacterStateBase {
    seat: VehicleSeat;
    entryPoint: Object3D;
    private hasOpenedDoor;
    private startPosition;
    private endPosition;
    private startRotation;
    private endRotation;
    private factorSimluator;
    constructor(character: Character, seat: VehicleSeat, entryPoint: Object3D);
    update(timeStep: number): void;
}
