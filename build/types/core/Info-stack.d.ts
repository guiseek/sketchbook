import { InfoStackMessage } from './Info-stack-message';
import { IWorldEntity } from '../interfaces/iworld-entity';
import { EntityType } from '../enums/entity-type';
import { World } from '../world/World';
export declare class InfoStack implements IWorldEntity {
    updateOrder: number;
    entityType: EntityType;
    messages: InfoStackMessage[];
    entranceAnimation: string;
    exitAnimation: string;
    messageDuration: number;
    addMessage(text: string): void;
    update(timeStep: number): void;
    addToWorld(world: World): void;
    removeFromWorld(world: World): void;
}
