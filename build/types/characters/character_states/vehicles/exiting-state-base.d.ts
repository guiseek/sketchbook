import { IControllable } from '../../../interfaces/icontrollable';
import { VehicleSeat } from '../../../vehicles/vehicle-seat';
import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../character';
import { Quaternion, Object3D, Vector3 } from 'three';
export declare abstract class ExitingStateBase extends CharacterStateBase {
    seat: VehicleSeat;
    protected vehicle: IControllable;
    protected startPosition: Vector3;
    protected endPosition: Vector3;
    protected startRotation: Quaternion;
    protected endRotation: Quaternion;
    protected exitPoint: Object3D;
    protected dummyObj: Object3D;
    constructor(character: Character, seat: VehicleSeat);
    detachCharacterFromVehicle(): void;
    updateEndRotation(): void;
}
