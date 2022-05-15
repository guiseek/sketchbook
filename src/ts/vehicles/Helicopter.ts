import { Euler, MathUtils, Object3D, Quaternion, Vector3 } from 'three'
import { VehicleHelicopterAction } from '../types/vehicle-action'
import { IControllable } from '../interfaces/icontrollable'
import { IWorldEntity } from '../interfaces/iworld-entity'
import { EntityType } from '../enums/entity-type'
import { KeyBinding } from '../core/key-binding'
import { Vehicle } from './vehicle'
import * as Utils from '../core/function-library'
import * as CANNON from 'cannon'

export class Helicopter extends Vehicle implements IControllable, IWorldEntity {
  actions: Record<VehicleHelicopterAction, KeyBinding>
  entityType: EntityType = EntityType.Helicopter
  rotors: Object3D[] = []

  private enginePower = 0

  constructor(gltf: any) {
    super(gltf)

    this.readHelicopterData(gltf)

    this.collision.preStep = (body: CANNON.Body) => {
      this.physicsPreStep(body, this)
    }

    this.actions = {
      ascend: new KeyBinding('ShiftLeft'),
      descend: new KeyBinding('Space'),
      pitchUp: new KeyBinding('KeyS'),
      pitchDown: new KeyBinding('KeyW'),
      yawLeft: new KeyBinding('KeyQ'),
      yawRight: new KeyBinding('KeyE'),
      rollLeft: new KeyBinding('KeyA'),
      rollRight: new KeyBinding('KeyD'),
      exitVehicle: new KeyBinding('KeyF'),
      seat_switch: new KeyBinding('KeyX'),
      view: new KeyBinding('KeyV'),
    }
  }

  noDirectionPressed() {
    const result =
      !this.actions.ascend.isPressed && !this.actions.descend.isPressed

    return result
  }

  update(timeStep: number) {
    super.update(timeStep)

    // Rotors visuals
    if (this.controllingCharacter !== undefined) {
      if (this.enginePower < 1) this.enginePower += timeStep * 0.2
      if (this.enginePower > 1) this.enginePower = 1
    } else {
      if (this.enginePower > 0) this.enginePower -= timeStep * 0.06
      if (this.enginePower < 0) this.enginePower = 0
    }

    this.rotors.forEach((rotor) => {
      rotor.rotateX(this.enginePower * timeStep * 30)
    })
  }

  onInputChange() {
    super.onInputChange()

    if (
      this.actions.exitVehicle.justPressed &&
      this.controllingCharacter !== undefined
    ) {
      this.forceCharacterOut()
    }
    if (this.actions.view.justPressed) {
      this.toggleFirstPersonView()
    }
  }

  physicsPreStep(body: CANNON.Body, heli: Helicopter) {
    const quat = Utils.threeQuat(body.quaternion)
    const right = new Vector3(1, 0, 0).applyQuaternion(quat)
    const globalUp = new Vector3(0, 1, 0)
    const up = new Vector3(0, 1, 0).applyQuaternion(quat)
    const forward = new Vector3(0, 0, 1).applyQuaternion(quat)

    // Throttle
    if (heli.actions.ascend.isPressed) {
      body.velocity.x += up.x * 0.15 * this.enginePower
      body.velocity.y += up.y * 0.15 * this.enginePower
      body.velocity.z += up.z * 0.15 * this.enginePower
    }
    if (heli.actions.descend.isPressed) {
      body.velocity.x -= up.x * 0.15 * this.enginePower
      body.velocity.y -= up.y * 0.15 * this.enginePower
      body.velocity.z -= up.z * 0.15 * this.enginePower
    }

    // Vertical stabilization
    const gravity = heli.world.physicsWorld.gravity
    let gravityCompensation = new CANNON.Vec3(
      -gravity.x,
      -gravity.y,
      -gravity.z
    ).length()
    gravityCompensation *= heli.world.physicsFrameTime
    gravityCompensation *= 0.98
    let dot = globalUp.dot(up)
    gravityCompensation *= Math.sqrt(MathUtils.clamp(dot, 0, 1))

    const vertDamping = new Vector3(0, body.velocity.y, 0).multiplyScalar(-0.01)
    const vertStab = up.clone()
    vertStab.multiplyScalar(gravityCompensation)
    vertStab.add(vertDamping)
    vertStab.multiplyScalar(heli.enginePower)

    body.velocity.x += vertStab.x
    body.velocity.y += vertStab.y
    body.velocity.z += vertStab.z

    // Positional damping
    body.velocity.x *= MathUtils.lerp(1, 0.995, this.enginePower)
    body.velocity.z *= MathUtils.lerp(1, 0.995, this.enginePower)

    // Rotation stabilization
    if (this.controllingCharacter !== undefined) {
      const rotStabVelocity = new Quaternion().setFromUnitVectors(up, globalUp)
      rotStabVelocity.x *= 0.3
      rotStabVelocity.y *= 0.3
      rotStabVelocity.z *= 0.3
      rotStabVelocity.w *= 0.3
      const rotStabEuler = new Euler().setFromQuaternion(rotStabVelocity)

      body.angularVelocity.x += rotStabEuler.x * this.enginePower
      body.angularVelocity.y += rotStabEuler.y * this.enginePower
      body.angularVelocity.z += rotStabEuler.z * this.enginePower
    }

    // Pitch
    if (heli.actions.pitchUp.isPressed) {
      body.angularVelocity.x -= right.x * 0.07 * this.enginePower
      body.angularVelocity.y -= right.y * 0.07 * this.enginePower
      body.angularVelocity.z -= right.z * 0.07 * this.enginePower
    }
    if (heli.actions.pitchDown.isPressed) {
      body.angularVelocity.x += right.x * 0.07 * this.enginePower
      body.angularVelocity.y += right.y * 0.07 * this.enginePower
      body.angularVelocity.z += right.z * 0.07 * this.enginePower
    }

    // Yaw
    if (heli.actions.yawLeft.isPressed) {
      body.angularVelocity.x += up.x * 0.07 * this.enginePower
      body.angularVelocity.y += up.y * 0.07 * this.enginePower
      body.angularVelocity.z += up.z * 0.07 * this.enginePower
    }
    if (heli.actions.yawRight.isPressed) {
      body.angularVelocity.x -= up.x * 0.07 * this.enginePower
      body.angularVelocity.y -= up.y * 0.07 * this.enginePower
      body.angularVelocity.z -= up.z * 0.07 * this.enginePower
    }

    // Roll
    if (heli.actions.rollLeft.isPressed) {
      body.angularVelocity.x -= forward.x * 0.07 * this.enginePower
      body.angularVelocity.y -= forward.y * 0.07 * this.enginePower
      body.angularVelocity.z -= forward.z * 0.07 * this.enginePower
    }
    if (heli.actions.rollRight.isPressed) {
      body.angularVelocity.x += forward.x * 0.07 * this.enginePower
      body.angularVelocity.y += forward.y * 0.07 * this.enginePower
      body.angularVelocity.z += forward.z * 0.07 * this.enginePower
    }

    // Angular damping
    body.angularVelocity.x *= 0.97
    body.angularVelocity.y *= 0.97
    body.angularVelocity.z *= 0.97
  }

  readHelicopterData(gltf: any) {
    gltf.scene.traverse((child) => {
      if (child.hasOwnProperty('userData')) {
        if (child.userData.hasOwnProperty('data')) {
          if (child.userData.data === 'rotor') {
            this.rotors.push(child)
          }
        }
      }
    })
  }

  inputReceiverInit() {
    super.inputReceiverInit()

    this.world.updateControls([
      {
        keys: ['Shift'],
        desc: 'Subir',
      },
      {
        keys: ['Space'],
        desc: 'Descer',
      },
      {
        keys: ['W', 'S'],
        desc: 'Pitch',
      },
      {
        keys: ['Q', 'E'],
        desc: 'Yaw',
      },
      {
        keys: ['A', 'D'],
        desc: 'Roll',
      },
      {
        keys: ['V'],
        desc: 'Ver seleção',
      },
      {
        keys: ['F'],
        desc: 'Sair do helicóptero',
      },
      {
        keys: ['Shift', '+', 'R'],
        desc: 'Começar novamente',
      },
      {
        keys: ['Shift', '+', 'C'],
        desc: 'Câmera livre',
      },
    ])
  }
}
