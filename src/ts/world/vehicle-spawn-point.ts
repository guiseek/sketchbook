import { FollowPath } from '../characters/character_ai/follow-path'
import { LoadingManager } from '../core/loading-manager'
import { ISpawnPoint } from '../interfaces/ispawn-point'
import { Helicopter } from '../vehicles/helicopter'
import { Character } from '../characters/character'
import * as Utils from '../core/function-library'
import { Airplane } from '../vehicles/airplane'
import { Vehicle } from '../vehicles/vehicle'
import { Car } from '../vehicles/car'
import { World } from './World'
import { Object3D, Vector3, Quaternion } from 'three'

export class VehicleSpawnPoint implements ISpawnPoint {
  type: string
  driver: string
  firstAINode: string

  constructor(private object: Object3D) {}

  spawn(loadingManager: LoadingManager, world: World): void {
    loadingManager.loadGLTF(
      'build/assets/' + this.type + '.glb',
      (model: any) => {
        let vehicle: Vehicle = this.getNewVehicleByType(model, this.type)
        vehicle.spawnPoint = this.object

        let worldPos = new Vector3()
        let worldQuat = new Quaternion()
        this.object.getWorldPosition(worldPos)
        this.object.getWorldQuaternion(worldQuat)

        vehicle.setPosition(worldPos.x, worldPos.y + 1, worldPos.z)
        vehicle.collision.quaternion.copy(Utils.cannonQuat(worldQuat))
        world.add(vehicle)

        if (this.driver !== undefined) {
          loadingManager.loadGLTF('build/assets/boxman.glb', (charModel) => {
            let character = new Character(charModel)
            world.add(character)
            character.teleportToVehicle(vehicle, vehicle.seats[0])

            if (this.driver === 'player') {
              character.takeControl()
            } else if (this.driver === 'ai') {
              if (this.firstAINode !== undefined) {
                let nodeFound = false
                for (const pathName in world.paths) {
                  if (world.paths.hasOwnProperty(pathName)) {
                    const path = world.paths[pathName]

                    for (const nodeName in path.nodes) {
                      if (
                        Object.prototype.hasOwnProperty.call(
                          path.nodes,
                          nodeName
                        )
                      ) {
                        const node = path.nodes[nodeName]

                        if (node.object.name === this.firstAINode) {
                          character.setBehaviour(new FollowPath(node, 10))
                          nodeFound = true
                        }
                      }
                    }
                  }
                }

                if (!nodeFound) {
                  console.error('Path node ' + this.firstAINode + 'not found.')
                }
              }
            }
          })
        }
      }
    )
  }

  private getNewVehicleByType(model: any, type: string): Vehicle {
    switch (type) {
      case 'car':
        return new Car(model)
      case 'heli':
        return new Helicopter(model)
      case 'airplane':
        return new Airplane(model)
    }
  }
}
