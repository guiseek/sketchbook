import { Character } from '../characters/character';
import { IInputReceiver } from './iinput-receiver';
import { VehicleSeat } from '../vehicles/vehicle-seat';
import { EntityType } from '../enums/entity-type';
export interface IControllable extends IInputReceiver {
    entityType: EntityType;
    seats: VehicleSeat[];
    position: THREE.Vector3;
    controllingCharacter: Character;
    triggerAction(actionName: string, value: boolean): void;
    resetControls(): void;
    allowSleep(value: boolean): void;
    onInputChange(): void;
    noDirectionPressed(): boolean;
}
