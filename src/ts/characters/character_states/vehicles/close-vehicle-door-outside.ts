import { VehicleSeat } from '../../../vehicles/vehicle-seat'
import * as Utils from '../../../core/function-library'
import { CharacterStateBase } from '../_stateLibrary'
import { Character } from '../../character'
import { Side } from '../../../enums/side'
import { Idle } from '../idle'

export class CloseVehicleDoorOutside extends CharacterStateBase {
  private hasClosedDoor: boolean = false

  constructor(character: Character, public seat: VehicleSeat) {
    super(character)

    this.seat = seat
    this.canFindVehiclesToEnter = false

    const side = Utils.detectRelativeSide(
      seat.seatPointObject,
      seat.door.doorObject
    )
    if (side === Side.Left) {
      this.playAnimation('close_door_standing_right', 0.1)
    } else if (side === Side.Right) {
      this.playAnimation('close_door_standing_left', 0.1)
    }
  }

  public update(timeStep: number): void {
    super.update(timeStep)

    if (this.timer > 0.3 && !this.hasClosedDoor) {
      this.hasClosedDoor = true
      this.seat.door.close()
    }

    if (this.animationEnded(timeStep)) {
      this.character.setState(new Idle(this.character))
      this.character.leaveSeat()
    }
  }
}
