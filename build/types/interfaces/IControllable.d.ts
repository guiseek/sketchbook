import { VehicleSeat } from '../vehicles/vehicle-seat';
import { Character } from '../characters/character';
import { IInputReceiver } from './iinput-receiver';
import { EntityType } from '../enums/entity-type';
import { Vector3, Object3D } from 'three';
export interface IControllable extends IInputReceiver, Object3D {
    entityType: EntityType;
    seats: VehicleSeat[];
    position: Vector3;
    controllingCharacter: Character;
    triggerAction(actionName: string, value: boolean): void;
    resetControls(): void;
    allowSleep(value: boolean): void;
    onInputChange(): void;
    noDirectionPressed(): boolean;
}
