import { SpringSimulator } from '../../../physics/spring_simulation/spring-simulator'
import { VehicleSeat } from '../../../vehicles/vehicle-seat'
import * as Utils from '../../../core/function-library'
import { CharacterStateBase } from '../_stateLibrary'
import { EnteringVehicle } from './entering-vehicle'
import { Character } from '../../character'
import { Side } from '../../../enums/side'
import { Idle } from '../idle'
import { Vector3, Quaternion, Object3D } from 'three'

export class OpenVehicleDoor extends CharacterStateBase {
  private hasOpenedDoor: boolean = false

  private startPosition = new Vector3()
  private endPosition = new Vector3()
  private startRotation = new Quaternion()
  private endRotation = new Quaternion()

  private factorSimluator: SpringSimulator

  constructor(
    character: Character,
    public seat: VehicleSeat,
    public entryPoint: Object3D
  ) {
    super(character)

    this.canFindVehiclesToEnter = false
    this.seat = seat
    this.entryPoint = entryPoint

    const side = Utils.detectRelativeSide(entryPoint, seat.seatPointObject)
    if (side === Side.Left) {
      this.playAnimation('open_door_standing_left', 0.1)
    } else if (side === Side.Right) {
      this.playAnimation('open_door_standing_right', 0.1)
    }

    this.character.resetVelocity()
    this.character.rotateModel()
    this.character.setPhysicsEnabled(false)

    this.character.setPhysicsEnabled(false)
    ;(this.seat.vehicle as unknown as Object3D).attach(this.character)

    this.startPosition.copy(this.character.position)
    this.endPosition.copy(this.entryPoint.position)
    this.endPosition.y += 0.53

    this.startRotation.copy(this.character.quaternion)
    this.endRotation.copy(this.entryPoint.quaternion)

    this.factorSimluator = new SpringSimulator(60, 10, 0.5)
    this.factorSimluator.target = 1
  }

  update(timeStep: number) {
    super.update(timeStep)

    if (this.timer > 0.3 && !this.hasOpenedDoor) {
      this.hasOpenedDoor = true
      this.seat.door?.open()
    }

    if (this.animationEnded(timeStep)) {
      if (this.anyDirection()) {
        this.character.vehicleEntryInstance = null
        this.character.world.graphicsWorld.attach(this.character)
        this.character.setPhysicsEnabled(true)
        this.character.setState(new Idle(this.character))
      } else {
        this.character.setState(
          new EnteringVehicle(this.character, this.seat, this.entryPoint)
        )
      }
    } else {
      this.factorSimluator.simulate(timeStep)

      let lerpPosition = new Vector3().lerpVectors(
        this.startPosition,
        this.endPosition,
        this.factorSimluator.position
      )
      this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z)

      Quaternion.slerp(
        this.startRotation,
        this.endRotation,
        this.character.quaternion,
        this.factorSimluator.position
      )
    }
  }
}
