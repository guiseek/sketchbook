import { Vehicle } from './vehicle'
import * as Utils from '../core/function-library'
import { VehicleSeat } from './vehicle-seat'
import { Side } from '../enums/side'
import { Vector3, Object3D, Euler } from 'three'

export class VehicleDoor {
  vehicle: Vehicle
  doorObject: Object3D
  doorVelocity = 0
  doorWorldPos = new Vector3()
  lastTrailerPos = new Vector3()
  lastTrailerVel = new Vector3()

  rotation = 0
  achievingTargetRotation = false
  physicsEnabled = false
  targetRotation = 0
  rotationSpeed = 5

  lastVehicleVel = new Vector3()
  lastVehiclePos = new Vector3()

  private sideMultiplier: number

  constructor(public seat: VehicleSeat, object: Object3D) {
    this.vehicle = seat.vehicle as unknown as Vehicle
    this.doorObject = object

    const side = Utils.detectRelativeSide(
      this.seat.seatPointObject,
      this.doorObject
    )
    if (side === Side.Left) this.sideMultiplier = -1
    else if (side === Side.Right) this.sideMultiplier = 1
    else this.sideMultiplier = 0
  }

  update(timestep: number) {
    if (this.achievingTargetRotation) {
      if (this.rotation < this.targetRotation) {
        this.rotation += timestep * this.rotationSpeed

        if (this.rotation > this.targetRotation) {
          this.rotation = this.targetRotation
          // this.resetPhysTrailer();
          this.achievingTargetRotation = false
          this.physicsEnabled = true
        }
      } else if (this.rotation > this.targetRotation) {
        this.rotation -= timestep * this.rotationSpeed

        if (this.rotation < this.targetRotation) {
          this.rotation = this.targetRotation
          // this.resetPhysTrailer();
          this.achievingTargetRotation = false
          this.physicsEnabled = false
        }
      }
    }

    this.doorObject.setRotationFromEuler(
      new Euler(0, this.sideMultiplier * this.rotation, 0)
    )
  }

  preStepCallback() {
    if (this.physicsEnabled && !this.achievingTargetRotation) {
      // Door world position
      this.doorObject.getWorldPosition(this.doorWorldPos)

      // Get acceleration
      let vehicleVel = Utils.threeVector(
        this.vehicle.rayCastVehicle.chassisBody.velocity
      )
      let vehicleVelDiff = vehicleVel.clone().sub(this.lastVehicleVel)

      // Get vectors
      const quat = Utils.threeQuat(
        this.vehicle.rayCastVehicle.chassisBody.quaternion
      )
      const back = new Vector3(0, 0, -1).applyQuaternion(quat)
      const up = new Vector3(0, 1, 0).applyQuaternion(quat)

      // Get imaginary positions
      let trailerPos = back
        .clone()
        .applyAxisAngle(up, this.sideMultiplier * this.rotation)
        .add(this.doorWorldPos)
      let trailerPushedPos = trailerPos.clone().sub(vehicleVelDiff)

      // Update last values
      this.lastVehicleVel.copy(vehicleVel)
      this.lastTrailerPos.copy(trailerPos)

      // Measure angle difference
      let v1 = trailerPos.clone().sub(this.doorWorldPos).normalize()
      let v2 = trailerPushedPos.clone().sub(this.doorWorldPos).normalize()
      let angle = Utils.getSignedAngleBetweenVectors(v1, v2, up)

      // Apply door velocity
      this.doorVelocity += this.sideMultiplier * angle * 0.05
      this.rotation += this.doorVelocity

      // Bounce door when it reaches rotation limit
      if (this.rotation < 0) {
        this.rotation = 0

        if (this.doorVelocity < -0.08) {
          this.close()
          this.doorVelocity = 0
        } else {
          this.doorVelocity = -this.doorVelocity / 2
        }
      }
      if (this.rotation > 1) {
        this.rotation = 1
        this.doorVelocity = -this.doorVelocity / 2
      }

      // Damping
      this.doorVelocity = this.doorVelocity * 0.98
    }
  }

  open() {
    // this.resetPhysTrailer();
    this.achievingTargetRotation = true
    this.targetRotation = 1
  }

  close() {
    this.achievingTargetRotation = true
    this.targetRotation = 0
  }

  resetPhysTrailer() {
    // Door world position
    this.doorObject.getWorldPosition(this.doorWorldPos)

    // Get acceleration
    this.lastVehicleVel = new Vector3()

    // Get vectors
    const quat = Utils.threeQuat(
      this.vehicle.rayCastVehicle.chassisBody.quaternion
    )
    const back = new Vector3(0, 0, -1).applyQuaternion(quat)
    this.lastTrailerPos.copy(back.add(this.doorWorldPos))
  }
}
