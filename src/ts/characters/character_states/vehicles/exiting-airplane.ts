import { Vector3, Object3D, MathUtils, Quaternion } from 'three'
import * as Utils from '../../../core/function-library'

import { Character } from '../../character'
import { VehicleSeat } from '../../../vehicles/vehicle-seat'
import { Falling } from '../falling'
import { ExitingStateBase } from './exiting-state-base'
import { Vehicle } from '../../../vehicles/vehicle'

export class ExitingAirplane extends ExitingStateBase {
  constructor(character: Character, seat: VehicleSeat) {
    super(character, seat)

    this.endPosition.copy(this.startPosition)
    this.endPosition.y += 1

    const quat = Utils.threeQuat(
      (seat.vehicle as unknown as Vehicle).collision.quaternion
    )
    const forward = new Vector3(0, 0, 1).applyQuaternion(quat)
    this.exitPoint = new Object3D()
    this.exitPoint.lookAt(forward)
    this.exitPoint.position.copy(this.endPosition)

    this.playAnimation('jump_idle', 0.1)
  }

  update(timeStep: number) {
    super.update(timeStep)

    if (this.animationEnded(timeStep)) {
      this.detachCharacterFromVehicle()
      this.character.setState(new Falling(this.character))
      this.character.leaveSeat()
    } else {
      let beginningCutoff = 0.3
      let factor = MathUtils.clamp(
        (this.timer / this.animationLength - beginningCutoff) *
          (1 / (1 - beginningCutoff)),
        0,
        1
      )
      let smoothFactor = Utils.easeOutQuad(factor)
      let lerpPosition = new Vector3().lerpVectors(
        this.startPosition,
        this.endPosition,
        smoothFactor
      )
      this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z)

      // Rotation
      this.updateEndRotation()
      Quaternion.slerp(
        this.startRotation,
        this.endRotation,
        this.character.quaternion,
        smoothFactor
      )
    }
  }
}
