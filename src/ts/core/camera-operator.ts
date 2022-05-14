import { IInputReceiver } from '../interfaces/iinput-receiver'
import { MathUtils, Camera, Vector2, Vector3 } from 'three'
import { IUpdatable } from '../interfaces/iupdatable'
import { Character } from '../characters/character'
import * as Utils from './function-library'
import { KeyBinding } from './key-binding'
import { World } from '../world/World'
import _ = require('lodash')

export class CameraOperator implements IInputReceiver, IUpdatable {
  public updateOrder: number = 4

  public world: World
  public camera: Camera
  public target: Vector3
  public sensitivity: Vector2
  public radius: number = 1
  public theta: number
  public phi: number
  public onMouseDownPosition: Vector2
  public onMouseDownTheta: any
  public onMouseDownPhi: any
  public targetRadius: number = 1

  public movementSpeed: number
  public actions: { [action: string]: KeyBinding }

  public upVelocity: number = 0
  public forwardVelocity: number = 0
  public rightVelocity: number = 0

  public followMode: boolean = false

  public characterCaller: Character

  constructor(
    world: World,
    camera: Camera,
    sensitivityX: number = 1,
    sensitivityY: number = sensitivityX * 0.8
  ) {
    this.world = world
    this.camera = camera
    this.target = new Vector3()
    this.sensitivity = new Vector2(sensitivityX, sensitivityY)

    this.movementSpeed = 0.06
    this.radius = 3
    this.theta = 0
    this.phi = 0

    this.onMouseDownPosition = new Vector2()
    this.onMouseDownTheta = this.theta
    this.onMouseDownPhi = this.phi

    this.actions = {
      forward: new KeyBinding('KeyW'),
      back: new KeyBinding('KeyS'),
      left: new KeyBinding('KeyA'),
      right: new KeyBinding('KeyD'),
      up: new KeyBinding('KeyE'),
      down: new KeyBinding('KeyQ'),
      fast: new KeyBinding('ShiftLeft'),
    }

    world.registerUpdatable(this)
  }

  public setSensitivity(
    sensitivityX: number,
    sensitivityY: number = sensitivityX
  ): void {
    this.sensitivity = new Vector2(sensitivityX, sensitivityY)
  }

  public setRadius(value: number, instantly: boolean = false): void {
    this.targetRadius = Math.max(0.001, value)
    if (instantly === true) {
      this.radius = value
    }
  }

  public move(deltaX: number, deltaY: number): void {
    this.theta -= deltaX * (this.sensitivity.x / 2)
    this.theta %= 360
    this.phi += deltaY * (this.sensitivity.y / 2)
    this.phi = Math.min(85, Math.max(-85, this.phi))
  }

  public update(timeScale: number): void {
    if (this.followMode === true) {
      this.camera.position.y = MathUtils.clamp(
        this.camera.position.y,
        this.target.y,
        Number.POSITIVE_INFINITY
      )
      this.camera.lookAt(this.target)
      let newPos = this.target
        .clone()
        .add(
          new Vector3()
            .subVectors(this.camera.position, this.target)
            .normalize()
            .multiplyScalar(this.targetRadius)
        )
      this.camera.position.x = newPos.x
      this.camera.position.y = newPos.y
      this.camera.position.z = newPos.z
    } else {
      this.radius = MathUtils.lerp(this.radius, this.targetRadius, 0.1)

      this.camera.position.x =
        this.target.x +
        this.radius *
          Math.sin((this.theta * Math.PI) / 180) *
          Math.cos((this.phi * Math.PI) / 180)
      this.camera.position.y =
        this.target.y + this.radius * Math.sin((this.phi * Math.PI) / 180)
      this.camera.position.z =
        this.target.z +
        this.radius *
          Math.cos((this.theta * Math.PI) / 180) *
          Math.cos((this.phi * Math.PI) / 180)
      this.camera.updateMatrix()
      this.camera.lookAt(this.target)
    }
  }

  public handleKeyboardEvent(
    event: KeyboardEvent,
    code: string,
    pressed: boolean
  ): void {
    // Free camera
    if (code === 'KeyC' && pressed === true && event.shiftKey === true) {
      if (this.characterCaller !== undefined) {
        this.world.inputManager.setInputReceiver(this.characterCaller)
        this.characterCaller = undefined
      }
    } else {
      for (const action in this.actions) {
        if (this.actions.hasOwnProperty(action)) {
          const binding = this.actions[action]

          if (_.includes(binding.eventCodes, code)) {
            binding.isPressed = pressed
          }
        }
      }
    }
  }

  public handleMouseWheel(event: WheelEvent, value: number): void {
    this.world.scrollTheTimeScale(value)
  }

  public handleMouseButton(
    event: MouseEvent,
    code: string,
    pressed: boolean
  ): void {
    for (const action in this.actions) {
      if (this.actions.hasOwnProperty(action)) {
        const binding = this.actions[action]

        if (_.includes(binding.eventCodes, code)) {
          binding.isPressed = pressed
        }
      }
    }
  }

  public handleMouseMove(
    event: MouseEvent,
    deltaX: number,
    deltaY: number
  ): void {
    this.move(deltaX, deltaY)
  }

  public inputReceiverInit(): void {
    this.target.copy(this.camera.position)
    this.setRadius(0, true)
    // this.world.dirLight.target = this.world.camera;

    this.world.updateControls([
      {
        keys: ['W', 'S', 'A', 'D'],
        desc: 'Mover-se',
      },
      {
        keys: ['E', 'Q'],
        desc: 'Mover para cima / baixo',
      },
      {
        keys: ['Shift'],
        desc: 'Acelerar',
      },
      {
        keys: ['Shift', '+', 'C'],
        desc: 'Sair do modo de câmera livre',
      },
    ])
  }

  public inputReceiverUpdate(timeStep: number): void {
    // Set fly speed
    let speed =
      this.movementSpeed *
      (this.actions.fast.isPressed ? timeStep * 600 : timeStep * 60)

    const up = Utils.getUp(this.camera)
    const right = Utils.getRight(this.camera)
    const forward = Utils.getBack(this.camera)

    this.upVelocity = MathUtils.lerp(
      this.upVelocity,
      +this.actions.up.isPressed - +this.actions.down.isPressed,
      0.3
    )
    this.forwardVelocity = MathUtils.lerp(
      this.forwardVelocity,
      +this.actions.forward.isPressed - +this.actions.back.isPressed,
      0.3
    )
    this.rightVelocity = MathUtils.lerp(
      this.rightVelocity,
      +this.actions.right.isPressed - +this.actions.left.isPressed,
      0.3
    )

    this.target.add(up.multiplyScalar(speed * this.upVelocity))
    this.target.add(forward.multiplyScalar(speed * this.forwardVelocity))
    this.target.add(right.multiplyScalar(speed * this.rightVelocity))
  }
}
