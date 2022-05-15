import { IControllable } from '../../../interfaces/icontrollable'
import { VehicleSeat } from '../../../vehicles/vehicle-seat'
import * as Utils from '../../../core/function-library'
import { CharacterStateBase } from '../_stateLibrary'
import { Vehicle } from '../../../vehicles/vehicle'
import { Character } from '../../character'
import { Quaternion, Object3D, Vector3 } from 'three'

export abstract class ExitingStateBase extends CharacterStateBase {
  protected vehicle: IControllable
  protected startPosition = new Vector3()
  protected endPosition = new Vector3()
  protected startRotation = new Quaternion()
  protected endRotation = new Quaternion()
  protected exitPoint: Object3D
  protected dummyObj: Object3D

  constructor(character: Character, public seat: VehicleSeat) {
    super(character)

    this.canFindVehiclesToEnter = false
    this.seat = seat
    this.vehicle = seat.vehicle

    this.seat.door?.open()

    this.startPosition.copy(this.character.position)
    this.startRotation.copy(this.character.quaternion)

    this.dummyObj = new Object3D()
  }

  detachCharacterFromVehicle() {
    this.character.controlledObject = undefined
    this.character.resetOrientation()
    this.character.world.graphicsWorld.attach(this.character)
    this.character.resetVelocity()
    this.character.setPhysicsEnabled(true)
    this.character.setPosition(
      this.character.position.x,
      this.character.position.y,
      this.character.position.z
    )
    this.character.inputReceiverUpdate(0)
    this.character.characterCapsule.body.velocity.copy(
      (this.vehicle as unknown as Vehicle).rayCastVehicle.chassisBody.velocity
    )
    this.character.feetRaycast()
  }

  updateEndRotation(): void {
    const forward = Utils.getForward(this.exitPoint)
    forward.y = 0
    forward.normalize()

    this.character.world.graphicsWorld.attach(this.dummyObj)
    this.exitPoint.getWorldPosition(this.dummyObj.position)

    const target = this.dummyObj.position.clone().add(forward)
    this.dummyObj.lookAt(target)
    this.seat.seatPointObject.parent.attach(this.dummyObj)
    this.endRotation.copy(this.dummyObj.quaternion)
  }
}
