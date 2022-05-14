import { World } from '../world/World'
import { EntityType } from '../enums/entity-type'
import { IUpdatable } from './iupdatable'

export interface IWorldEntity extends IUpdatable {
  entityType: EntityType

  addToWorld(world: World): void
  removeFromWorld(world: World): void
}
