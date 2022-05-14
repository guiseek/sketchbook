import { VehicleSeat } from '../vehicles/vehicle-seat';
import { Object3D } from 'three';
import { Character } from './character';
export declare class VehicleEntryInstance {
    character: Character;
    targetSeat: VehicleSeat;
    entryPoint: Object3D;
    wantsToDrive: boolean;
    constructor(character: Character);
    update(timeStep?: number): void;
}
