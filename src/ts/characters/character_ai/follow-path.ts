import { ICharacterAI } from '../../interfaces/icharacter-ai'
import * as Utils from '../../core/function-library'
import { PathNode } from '../../world/path-node'
import { Vehicle } from '../../vehicles/vehicle'
import { FollowTarget } from './follow-target'
import { Vector3 } from 'three'
import * as CANNON from 'cannon'

export class FollowPath extends FollowTarget implements ICharacterAI {
  reverse = false

  private staleTimer = 0
  private targetNode: PathNode

  constructor(firstNode: PathNode, public nodeRadius: number) {
    super(firstNode.object, 0)
    this.targetNode = firstNode
  }

  update(timeStep: number): void {
    super.update(timeStep)

    // Todo only compute once in followTarget
    const source = new Vector3()
    const target = new Vector3()

    this.character.getWorldPosition(source)
    this.target.getWorldPosition(target)

    const viewVector = new Vector3().subVectors(target, source)
    viewVector.y = 0

    const targetToNextNode = this.targetNode.nextNode.object.position
      .clone()
      .sub(this.targetNode.object.position)

    targetToNextNode.y = 0
    targetToNextNode.normalize()

    const slowDownAngle = viewVector.clone().normalize().dot(targetToNextNode)

    const speed = (
      this.character.controlledObject as unknown as Vehicle
    ).collision.velocity.length()

    // console.log(slowDownAngle, viewVector.length(), speed);
    if (slowDownAngle < 0.7 && viewVector.length() < 50 && speed > 10) {
      this.character.controlledObject.triggerAction('reverse', true)
      this.character.controlledObject.triggerAction('throttle', false)
    }

    if (
      speed < 1 ||
      (this.character.controlledObject as Vehicle).rayCastVehicle
        .numWheelsOnGround === 0
    )
      this.staleTimer += timeStep
    else {
      this.staleTimer = 0
    }

    if (this.staleTimer > 5) {
      const worldPos = new Vector3()
      this.targetNode.object.getWorldPosition(worldPos)
      worldPos.y += 3

      this.getControlledAs<Vehicle>().collision.position =
        Utils.cannonVector(worldPos)

      this.getControlledAs<Vehicle>().collision.interpolatedPosition =
        Utils.cannonVector(worldPos)

      this.getControlledAs<Vehicle>().collision.angularVelocity =
        new CANNON.Vec3()

      this.getControlledAs<Vehicle>().collision.quaternion.copy(
        this.getControlledAs<Vehicle>().collision.initQuaternion
      )

      this.staleTimer = 0
    }

    if (viewVector.length() < this.nodeRadius) {
      if (this.reverse) {
        super.setTarget(this.targetNode.previousNode.object)
        this.targetNode = this.targetNode.previousNode
      } else {
        super.setTarget(this.targetNode.nextNode.object)
        this.targetNode = this.targetNode.nextNode
      }
    }
  }
}
