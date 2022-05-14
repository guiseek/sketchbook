import { VehicleSeat } from '../../../vehicles/vehicle-seat'
import * as Utils from '../../../core/function-library'
import { CharacterStateBase } from '../_stateLibrary'
import { SeatType } from '../../../enums/seat-type'
import { Character } from '../../character'
import { Side } from '../../../enums/side'
import { Driving } from './driving'
import { Sitting } from './sitting'

export class CloseVehicleDoorInside extends CharacterStateBase {
  private hasClosedDoor: boolean = false

  constructor(character: Character, public seat: VehicleSeat) {
    super(character)

    this.seat = seat
    this.canFindVehiclesToEnter = false
    this.canLeaveVehicles = false

    const side = Utils.detectRelativeSide(
      seat.seatPointObject,
      seat.door.doorObject
    )
    if (side === Side.Left) {
      this.playAnimation('close_door_sitting_left', 0.1)
    } else if (side === Side.Right) {
      this.playAnimation('close_door_sitting_right', 0.1)
    }

    this.seat.door?.open()
  }

  update(timeStep: number): void {
    super.update(timeStep)

    if (this.timer > 0.4 && !this.hasClosedDoor) {
      this.hasClosedDoor = true
      this.seat.door?.close()
    }

    if (this.animationEnded(timeStep)) {
      if (this.seat.type === SeatType.Driver) {
        this.character.setState(new Driving(this.character, this.seat))
      } else if (this.seat.type === SeatType.Passenger) {
        this.character.setState(new Sitting(this.character, this.seat))
      }
    }
  }
}
