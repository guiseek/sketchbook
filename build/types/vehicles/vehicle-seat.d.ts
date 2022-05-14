import * as THREE from 'three';
import { SeatType } from '../enums/seat-type';
import { IControllable } from '../interfaces/icontrollable';
import { VehicleDoor } from './vehicle-door';
import { Character } from '../characters/character';
export declare class VehicleSeat {
    vehicle: IControllable;
    seatPointObject: THREE.Object3D;
    connectedSeatsString: string;
    connectedSeats: VehicleSeat[];
    type: SeatType;
    entryPoints: THREE.Object3D[];
    door: VehicleDoor;
    occupiedBy: Character;
    constructor(vehicle: IControllable, object: THREE.Object3D, gltf: any);
    update(timeStep: number): void;
}
