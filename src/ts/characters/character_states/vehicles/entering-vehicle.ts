import { SpringSimulator } from '../../../physics/spring_simulation/spring-simulator'
import { IControllable } from '../../../interfaces/icontrollable'
import { VehicleSeat } from '../../../vehicles/vehicle-seat'
import * as Utils from '../../../core/function-library'
import { EntityType } from '../../../enums/entity-type'
import { CharacterStateBase } from '../_stateLibrary'
import { SeatType } from '../../../enums/seat-type'
import { Character } from '../../character'
import { Side } from '../../../enums/side'
import { Sitting } from './sitting'
import { Driving } from './driving'
import { Object3D, Vector3, Quaternion, MathUtils } from 'three'

export class EnteringVehicle extends CharacterStateBase {
  private vehicle: IControllable
  private animData: any
  private seat: VehicleSeat

  private initialPositionOffset = new Vector3()
  private startPosition = new Vector3()
  private endPosition = new Vector3()
  private startRotation = new Quaternion()
  private endRotation = new Quaternion()

  private factorSimulator: SpringSimulator

  constructor(character: Character, seat: VehicleSeat, entryPoint: Object3D) {
    super(character)

    this.canFindVehiclesToEnter = false
    this.vehicle = seat.vehicle
    this.seat = seat

    const side = Utils.detectRelativeSide(entryPoint, seat.seatPointObject)
    this.animData = this.getEntryAnimations(seat.vehicle.entityType)
    this.playAnimation(this.animData[side], 0.1)

    this.character.resetVelocity()
    this.character.tiltContainer.rotation.z = 0
    this.character.setPhysicsEnabled(false)

    const vehicle = this.seat.vehicle as unknown as Object3D
    vehicle.attach(this.character)

    this.startPosition.copy(entryPoint.position)
    this.startPosition.y += 0.53
    this.endPosition.copy(seat.seatPointObject.position)
    this.endPosition.y += 0.6
    this.initialPositionOffset
      .copy(this.startPosition)
      .sub(this.character.position)

    this.startRotation.copy(this.character.quaternion)
    this.endRotation.copy(this.seat.seatPointObject.quaternion)

    this.factorSimulator = new SpringSimulator(60, 10, 0.5)
    this.factorSimulator.target = 1
  }

  update(timeStep: number): void {
    super.update(timeStep)

    if (this.animationEnded(timeStep)) {
      this.character.occupySeat(this.seat)
      this.character.setPosition(
        this.endPosition.x,
        this.endPosition.y,
        this.endPosition.z
      )

      if (this.seat.type === SeatType.Driver) {
        if (this.seat.door) this.seat.door.physicsEnabled = true
        this.character.setState(new Driving(this.character, this.seat))
      } else if (this.seat.type === SeatType.Passenger) {
        this.character.setState(new Sitting(this.character, this.seat))
      }
    } else {
      if (this.seat.door) {
        this.seat.door.physicsEnabled = false
        this.seat.door.rotation = 1
      }

      const factor = MathUtils.clamp(
        this.timer / (this.animationLength - this.animData.end_early),
        0,
        1
      )
      const sineFactor = Utils.easeInOutSine(factor)
      this.factorSimulator.simulate(timeStep)

      const currentPosOffset = new Vector3().lerpVectors(
        this.initialPositionOffset,
        new Vector3(),
        this.factorSimulator.position
      )
      const lerpPosition = new Vector3().lerpVectors(
        this.startPosition.clone().sub(currentPosOffset),
        this.endPosition,
        sineFactor
      )
      this.character.setPosition(lerpPosition.x, lerpPosition.y, lerpPosition.z)

      Quaternion.slerp(
        this.startRotation,
        this.endRotation,
        this.character.quaternion,
        this.factorSimulator.position
      )
    }
  }

  private getEntryAnimations(type: EntityType): any {
    switch (type) {
      case EntityType.Airplane:
        return {
          [Side.Left]: 'enter_airplane_left',
          [Side.Right]: 'enter_airplane_right',
          end_early: 0.3,
        }
      default:
        return {
          [Side.Left]: 'sit_down_left',
          [Side.Right]: 'sit_down_right',
          end_early: 0.0,
        }
    }
  }
}
