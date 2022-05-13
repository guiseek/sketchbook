import { CharacterStateBase } from '../_stateLibrary';
import { Character } from '../../character';
import { VehicleSeat } from 'src/ts/vehicles/VehicleSeat';
export declare class Sitting extends CharacterStateBase {
    private seat;
    constructor(character: Character, seat: VehicleSeat);
    update(timeStep: number): void;
    onInputChange(): void;
}
