import { ISpawnPoint } from '../interfaces/ispawn-point'
import { LoadingManager } from '../core/loading-manager'
import { Character } from '../characters/character'
import * as Utils from '../core/function-library'
import { Object3D, Vector3 } from 'three'
import { World } from './World'

export class CharacterSpawnPoint implements ISpawnPoint {
  constructor(public object: Object3D) {}

  spawn(loadingManager: LoadingManager, world: World) {
    loadingManager.loadGLTF('build/assets/boxman.glb', (model) => {
      const player = new Character(model)

      const worldPos = new Vector3()
      this.object.getWorldPosition(worldPos)
      player.setPosition(worldPos.x, worldPos.y, worldPos.z)

      const forward = Utils.getForward(this.object)
      player.setOrientation(forward, true)

      world.add(player)
      player.takeControl()
    })
  }
}
