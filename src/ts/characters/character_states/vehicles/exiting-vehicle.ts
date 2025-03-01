import * as THREE from 'three'
import * as Utils from '../../../core/function-library'

import { Character } from '../../character'
import { Side } from '../../../enums/side'
import { VehicleSeat } from '../../../vehicles/vehicle-seat'
import { Idle } from '../idle'
import { CloseVehicleDoorOutside } from './close-vehicle-door-outside'
import { Vehicle } from 'src/ts/vehicles/vehicle'
import { Falling } from '../falling'
import { DropRolling } from '../drop-rolling'
import { ExitingStateBase } from './exiting-state-base'

export class ExitingVehicle extends ExitingStateBase {
  constructor(character: Character, seat: VehicleSeat) {
    super(character, seat)

    this.exitPoint = seat.entryPoints[0]

    this.endPosition.copy(this.exitPoint.position)
    this.endPosition.y += 0.52

    const side = Utils.detectRelativeSide(seat.seatPointObject, this.exitPoint)
    if (side === Side.Left) {
      this.playAnimation('stand_up_left', 0.1)
    } else if (side === Side.Right) {
      this.playAnimation('stand_up_right', 0.1)
    }
  }

  public update(timeStep: number): void {
    super.update(timeStep)

    if (this.animationEnded(timeStep)) {
      this.detachCharacterFromVehicle()

      this.seat.door.physicsEnabled = true

      if (!this.character.rayHasHit) {
        this.character.setState(new Falling(this.character))
        this.character.leaveSeat()
      } else if (
        (this.vehicle as unknown as Vehicle).collision.velocity.length() > 1
      ) {
        this.character.setState(new DropRolling(this.character))
        this.character.leaveSeat()
      } else if (this.anyDirection() || this.seat.door === undefined) {
        this.character.setState(new Idle(this.character))
        this.character.leaveSeat()
      } else {
        this.character.setState(
          new CloseVehicleDoorOutside(this.character, this.seat)
        )
      }
    } else {
      // Door
      if (this.seat.door) {
        this.seat.door.physicsEnabled = false
      }

      // Position
      let factor = this.timer / this.animationLength
      let smoothFactor = Utils.easeInOutSine(factor)
      let lerpPosition = new THREE.Vector3().lerpVectors(
        this.startPosition,
        this.endPosition,
        smoothFactor
      )
      this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z)

      // Rotation
      this.updateEndRotation()
      THREE.Quaternion.slerp(
        this.startRotation,
        this.endRotation,
        this.character.quaternion,
        smoothFactor
      )
    }
  }
}
