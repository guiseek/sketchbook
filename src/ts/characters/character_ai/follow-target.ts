import { IControllable } from '../../interfaces/icontrollable'
import { ICharacterAI } from '../../interfaces/icharacter-ai'
import * as Utils from '../../core/function-library'
import { Vehicle } from '../../vehicles/vehicle'
import { Character } from '../character'
import { Object3D, Vector3 } from 'three'

export class FollowTarget implements ICharacterAI {
  character: Character
  isTargetReached: boolean

  target: Object3D
  private stopDistance: number

  constructor(target: Object3D, stopDistance: number = 1.3) {
    this.target = target
    this.stopDistance = stopDistance
  }

  getControlledAs<T extends IControllable>() {
    return this.character.controlledObject as T
  }

  setTarget(target: Object3D): void {
    this.target = target
  }

  update(timeStep: number): void {
    if (this.character.controlledObject !== undefined) {
      const source = new Vector3()
      const target = new Vector3()

      this.character.getWorldPosition(source)
      this.target.getWorldPosition(target)

      const viewVector = new Vector3().subVectors(target, source)

      // Follow character
      if (viewVector.length() > this.stopDistance) {
        this.isTargetReached = false
      } else {
        this.isTargetReached = true
      }

      const forward = new Vector3(0, 0, 1).applyQuaternion(
        (this.character.controlledObject as unknown as Object3D).quaternion
      )
      viewVector.y = 0
      viewVector.normalize()
      const angle = Utils.getSignedAngleBetweenVectors(forward, viewVector)

      const goingForward =
        forward.dot(
          Utils.threeVector(
            (this.character.controlledObject as unknown as Vehicle).collision
              .velocity
          )
        ) > 0
      const speed = (
        this.character.controlledObject as unknown as Vehicle
      ).collision.velocity.length()

      if (forward.dot(viewVector) < 0.0) {
        this.character.controlledObject.triggerAction('reverse', true)
        this.character.controlledObject.triggerAction('throttle', false)
      } else {
        this.character.controlledObject.triggerAction('throttle', true)
        this.character.controlledObject.triggerAction('reverse', false)
      }

      if (Math.abs(angle) > 0.15) {
        if (forward.dot(viewVector) > 0 || goingForward) {
          if (angle > 0) {
            this.character.controlledObject.triggerAction('left', true)
            this.character.controlledObject.triggerAction('right', false)
          } else {
            this.character.controlledObject.triggerAction('right', true)
            this.character.controlledObject.triggerAction('left', false)
          }
        } else {
          if (angle > 0) {
            this.character.controlledObject.triggerAction('right', true)
            this.character.controlledObject.triggerAction('left', false)
          } else {
            this.character.controlledObject.triggerAction('left', true)
            this.character.controlledObject.triggerAction('right', false)
          }
        }
      } else {
        this.character.controlledObject.triggerAction('left', false)
        this.character.controlledObject.triggerAction('right', false)
      }
    } else {
      let viewVector = new Vector3().subVectors(
        this.target.position,
        this.character.position
      )
      this.character.setViewVector(viewVector)

      // Follow character
      if (viewVector.length() > this.stopDistance) {
        this.isTargetReached = false
        this.character.triggerAction('up', true)
      }
      // Stand still
      else {
        this.isTargetReached = true
        this.character.triggerAction('up', false)

        // Look at character
        this.character.setOrientation(viewVector)
      }
    }
  }
}
