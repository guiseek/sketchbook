import * as THREE from 'three';
import { VehicleSeat } from '../vehicles/vehicle-seat';
import { Character } from './character';
export declare class VehicleEntryInstance {
    character: Character;
    targetSeat: VehicleSeat;
    entryPoint: THREE.Object3D;
    wantsToDrive: boolean;
    constructor(character: Character);
    update(timeStep: number): void;
}
