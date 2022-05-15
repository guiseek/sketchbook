import { EntityType } from '../enums/entity-type';
import { IUpdatable } from './iupdatable';
import { World } from '../world/World';
export interface IWorldEntity extends IUpdatable {
    entityType: EntityType;
    addToWorld(world: World): void;
    removeFromWorld(world: World): void;
}
