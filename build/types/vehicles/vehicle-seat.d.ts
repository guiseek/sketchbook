import { IControllable } from '../interfaces/icontrollable';
import { Character } from '../characters/character';
import { SeatType } from '../enums/seat-type';
import { VehicleDoor } from './vehicle-door';
import { Object3D } from 'three';
export declare class VehicleSeat {
    vehicle: IControllable;
    seatPointObject: Object3D;
    connectedSeatsString: string;
    connectedSeats: VehicleSeat[];
    type: SeatType;
    entryPoints: Object3D[];
    door: VehicleDoor;
    occupiedBy: Character;
    constructor(vehicle: IControllable, object: THREE.Object3D, gltf: any);
    update(timeStep: number): void;
}
