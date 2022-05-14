import * as CANNON from 'cannon'
import * as _ from 'lodash'
import * as Utils from '../core/function-library'

import { KeyBinding } from '../core/key-binding'
import { VectorSpringSimulator } from '../physics/spring_simulation/vector-spring-simulator'
import { RelativeSpringSimulator } from '../physics/spring_simulation/relative-spring-simulator'
import { OpenVehicleDoor as OpenVehicleDoor } from './character_states/vehicles/open-vehicle-door'
import { ExitingAirplane } from './character_states/vehicles/exiting-airplane'
import { EnteringVehicle } from './character_states/vehicles/entering-vehicle'
import { ExitingVehicle } from './character_states/vehicles/exiting-vehicle'
import { CapsuleCollider } from '../physics/colliders/capsule-collider'
import { ClosestObjectFinder } from '../core/cclosest-object-finder'
import { ICharacterState } from '../interfaces/icharacter-state'
import { VehicleEntryInstance } from './vehicle-entry-instance'
import { Driving } from './character_states/vehicles/driving'
import { IControllable } from '../interfaces/icontrollable'
import { CollisionGroups } from '../enums/collision-groups'
import { IWorldEntity } from '../interfaces/iworld-entity'
import { ICharacterAI } from '../interfaces/icharacter-ai'
import { GroundImpactData } from './ground-impact-data'
import { VehicleSeat } from '../vehicles/vehicle-seat'
import { EntityType } from '../enums/entity-type'
import { Idle } from './character_states/idle'
import { Vehicle } from '../vehicles/vehicle'
import { SeatType } from '../enums/seat-type'
import { World } from '../world/World'
import {
  MeshLambertMaterial,
  AnimationMixer,
  AnimationClip,
  BoxGeometry,
  Quaternion,
  MathUtils,
  Object3D,
  Material,
  Matrix4,
  Vector3,
  Group,
  Mesh,
} from 'three'

export class Character extends Object3D implements IWorldEntity {
  updateOrder = 1
  entityType = EntityType.Character

  height = 0
  tiltContainer: Group
  modelContainer: Group
  materials: Material[] = []
  mixer: AnimationMixer
  animations: any[]

  // Movement
  acceleration: Vector3 = new Vector3()
  velocity: Vector3 = new Vector3()
  arcadeVelocityInfluence: Vector3 = new Vector3()
  velocityTarget: Vector3 = new Vector3()
  arcadeVelocityIsAdditive = false

  defaultVelocitySimulatorDamping = 0.8
  defaultVelocitySimulatorMass = 50
  velocitySimulator: VectorSpringSimulator
  moveSpeed = 4
  angularVelocity = 0
  orientation: Vector3 = new Vector3(0, 0, 1)
  orientationTarget: Vector3 = new Vector3(0, 0, 1)
  defaultRotationSimulatorDamping = 0.5
  defaultRotationSimulatorMass = 10
  rotationSimulator: RelativeSpringSimulator
  viewVector: Vector3
  actions: { [action: string]: KeyBinding }
  characterCapsule: CapsuleCollider

  // Ray casting
  rayResult: CANNON.RaycastResult = new CANNON.RaycastResult()
  rayHasHit = false
  rayCastLength = 0.57
  raySafeOffset = 0.03
  wantsToJump = false
  initJumpSpeed = -1
  groundImpactData: GroundImpactData = new GroundImpactData()
  raycastBox: Mesh

  world: World
  charState: ICharacterState
  behaviour: ICharacterAI

  // Vehicles
  controlledObject: IControllable
  occupyingSeat: VehicleSeat = null
  vehicleEntryInstance: VehicleEntryInstance = null

  private physicsEnabled = true

  constructor(gltf: any) {
    super()

    this.readCharacterData(gltf)
    this.setAnimations(gltf.animations)

    // The visuals group is centered for easy character tilting
    this.tiltContainer = new Group()
    this.add(this.tiltContainer)

    // Model container is used to reliably ground the character, as animation can alter the position of the model itself
    this.modelContainer = new Group()
    this.modelContainer.position.y = -0.57
    this.tiltContainer.add(this.modelContainer)
    this.modelContainer.add(gltf.scene)

    this.mixer = new AnimationMixer(gltf.scene)

    this.velocitySimulator = new VectorSpringSimulator(
      60,
      this.defaultVelocitySimulatorMass,
      this.defaultVelocitySimulatorDamping
    )
    this.rotationSimulator = new RelativeSpringSimulator(
      60,
      this.defaultRotationSimulatorMass,
      this.defaultRotationSimulatorDamping
    )

    this.viewVector = new Vector3()

    // Actions
    this.actions = {
      up: new KeyBinding('KeyW'),
      down: new KeyBinding('KeyS'),
      left: new KeyBinding('KeyA'),
      right: new KeyBinding('KeyD'),
      run: new KeyBinding('ShiftLeft'),
      jump: new KeyBinding('Space'),
      use: new KeyBinding('KeyE'),
      enter: new KeyBinding('KeyF'),
      enter_passenger: new KeyBinding('KeyG'),
      seat_switch: new KeyBinding('KeyX'),
      primary: new KeyBinding('Mouse0'),
      secondary: new KeyBinding('Mouse1'),
    }

    // Physics
    // Player Capsule
    this.characterCapsule = new CapsuleCollider({
      mass: 1,
      position: new CANNON.Vec3(),
      height: 0.5,
      radius: 0.25,
      segments: 8,
      friction: 0.0,
    })
    // capsulePhysics.physical.collisionFilterMask = ~CollisionGroups.Trimesh;
    this.characterCapsule.body.shapes.forEach((shape) => {
      // tslint:disable-next-line: no-bitwise
      shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders
    })
    this.characterCapsule.body.allowSleep = false

    // Move character to different collision group for raycasting
    this.characterCapsule.body.collisionFilterGroup = 2

    // Disable character rotation
    this.characterCapsule.body.fixedRotation = true
    this.characterCapsule.body.updateMassProperties()

    // Ray cast debug
    const boxGeo = new BoxGeometry(0.1, 0.1, 0.1)
    const boxMat = new MeshLambertMaterial({
      color: 0xff0000,
    })
    this.raycastBox = new Mesh(boxGeo, boxMat)
    this.raycastBox.visible = false

    // Physics pre/post step callback bindings
    this.characterCapsule.body.preStep = (body: CANNON.Body) => {
      this.physicsPreStep(body, this)
    }
    this.characterCapsule.body.postStep = (body: CANNON.Body) => {
      this.physicsPostStep(body, this)
    }

    // States
    this.setState(new Idle(this))
  }

  setAnimations(animations: []): void {
    this.animations = animations
  }

  setArcadeVelocityInfluence(x: number, y: number = x, z: number = x): void {
    this.arcadeVelocityInfluence.set(x, y, z)
  }

  setViewVector(vector: Vector3): void {
    this.viewVector.copy(vector).normalize()
  }

  /**
   * Set state to the player. Pass state class (function) name.
   * @param {function} State
   */
  setState(state: ICharacterState): void {
    this.charState = state
    this.charState.onInputChange()
  }

  setPosition(x: number, y: number, z: number): void {
    if (this.physicsEnabled) {
      this.characterCapsule.body.previousPosition = new CANNON.Vec3(x, y, z)
      this.characterCapsule.body.position = new CANNON.Vec3(x, y, z)
      this.characterCapsule.body.interpolatedPosition = new CANNON.Vec3(x, y, z)
    } else {
      this.position.x = x
      this.position.y = y
      this.position.z = z
    }
  }

  resetVelocity(): void {
    this.velocity.x = 0
    this.velocity.y = 0
    this.velocity.z = 0

    this.characterCapsule.body.velocity.x = 0
    this.characterCapsule.body.velocity.y = 0
    this.characterCapsule.body.velocity.z = 0

    this.velocitySimulator.init()
  }

  setArcadeVelocityTarget(
    velZ: number,
    velX: number = 0,
    velY: number = 0
  ): void {
    this.velocityTarget.z = velZ
    this.velocityTarget.x = velX
    this.velocityTarget.y = velY
  }

  setOrientation(vector: Vector3, instantly: boolean = false): void {
    let lookVector = new Vector3().copy(vector).setY(0).normalize()
    this.orientationTarget.copy(lookVector)

    if (instantly) {
      this.orientation.copy(lookVector)
    }
  }

  resetOrientation(): void {
    const forward = Utils.getForward(this)
    this.setOrientation(forward, true)
  }

  setBehaviour(behaviour: ICharacterAI): void {
    behaviour.character = this
    this.behaviour = behaviour
  }

  setPhysicsEnabled(value: boolean): void {
    this.physicsEnabled = value

    if (value === true) {
      this.world.physicsWorld.addBody(this.characterCapsule.body)
    } else {
      this.world.physicsWorld.remove(this.characterCapsule.body)
    }
  }

  readCharacterData(gltf: any): void {
    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        Utils.setupMeshProperties(child)

        if (child.material !== undefined) {
          this.materials.push(child.material)
        }
      }
    })
  }

  handleKeyboardEvent(
    event: KeyboardEvent,
    code: string,
    pressed: boolean
  ): void {
    if (this.controlledObject !== undefined) {
      this.controlledObject.handleKeyboardEvent(event, code, pressed)
    } else {
      // Free camera
      if (code === 'KeyC' && pressed === true && event.shiftKey === true) {
        this.resetControls()
        this.world.cameraOperator.characterCaller = this
        this.world.inputManager.setInputReceiver(this.world.cameraOperator)
      } else if (
        code === 'KeyR' &&
        pressed === true &&
        event.shiftKey === true
      ) {
        this.world.restartScenario()
      } else {
        for (const action in this.actions) {
          if (this.actions.hasOwnProperty(action)) {
            const binding = this.actions[action]

            if (_.includes(binding.eventCodes, code)) {
              this.triggerAction(action, pressed)
            }
          }
        }
      }
    }
  }

  handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
    if (this.controlledObject !== undefined) {
      this.controlledObject.handleMouseButton(event, code, pressed)
    } else {
      for (const action in this.actions) {
        if (this.actions.hasOwnProperty(action)) {
          const binding = this.actions[action]

          if (_.includes(binding.eventCodes, code)) {
            this.triggerAction(action, pressed)
          }
        }
      }
    }
  }

  handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void {
    if (this.controlledObject !== undefined) {
      this.controlledObject.handleMouseMove(event, deltaX, deltaY)
    } else {
      this.world.cameraOperator.move(deltaX, deltaY)
    }
  }

  handleMouseWheel(event: WheelEvent, value: number): void {
    if (this.controlledObject !== undefined) {
      this.controlledObject.handleMouseWheel(event, value)
    } else {
      this.world.scrollTheTimeScale(value)
    }
  }

  triggerAction(actionName: string, value: boolean): void {
    // Get action and set it's parameters
    let action = this.actions[actionName]

    if (action.isPressed !== value) {
      // Set value
      action.isPressed = value

      // Reset the 'just' attributes
      action.justPressed = false
      action.justReleased = false

      // Set the 'just' attributes
      if (value) action.justPressed = true
      else action.justReleased = true

      // Tell player to handle states according to new input
      this.charState.onInputChange()

      // Reset the 'just' attributes
      action.justPressed = false
      action.justReleased = false
    }
  }

  takeControl(): void {
    if (this.world !== undefined) {
      this.world.inputManager.setInputReceiver(this)
    } else {
      console.warn(
        "Attempting to take control of a character that doesn't belong to a world."
      )
    }
  }

  resetControls(): void {
    for (const action in this.actions) {
      if (this.actions.hasOwnProperty(action)) {
        this.triggerAction(action, false)
      }
    }
  }

  update(timeStep: number): void {
    this.behaviour?.update(timeStep)
    this.vehicleEntryInstance?.update(timeStep)
    // console.log(this.occupyingSeat);
    this.charState?.update(timeStep)

    // this.visuals.position.copy(this.modelOffset);
    if (this.physicsEnabled) this.springMovement(timeStep)
    if (this.physicsEnabled) this.springRotation(timeStep)
    if (this.physicsEnabled) this.rotateModel()
    if (this.mixer !== undefined) this.mixer.update(timeStep)

    // Sync physics/graphics
    if (this.physicsEnabled) {
      this.position.set(
        this.characterCapsule.body.interpolatedPosition.x,
        this.characterCapsule.body.interpolatedPosition.y,
        this.characterCapsule.body.interpolatedPosition.z
      )
    } else {
      let newPos = new Vector3()
      this.getWorldPosition(newPos)

      this.characterCapsule.body.position.copy(Utils.cannonVector(newPos))
      this.characterCapsule.body.interpolatedPosition.copy(
        Utils.cannonVector(newPos)
      )
    }

    this.updateMatrixWorld()
  }

  inputReceiverInit(): void {
    if (this.controlledObject !== undefined) {
      this.controlledObject.inputReceiverInit()
      return
    }

    this.world.cameraOperator.setRadius(1.6, true)
    this.world.cameraOperator.followMode = false
    // this.world.dirLight.target = this;

    this.displayControls()
  }

  displayControls(): void {
    this.world.updateControls([
      {
        keys: ['W', 'A', 'S', 'D'],
        desc: 'Movimento',
      },
      {
        keys: ['Shift'],
        desc: 'Correr',
      },
      {
        keys: ['Space'],
        desc: 'Pular',
      },
      {
        keys: ['F', 'or', 'G'],
        desc: 'Entre no veículo',
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

  inputReceiverUpdate(timeStep: number): void {
    if (this.controlledObject !== undefined) {
      this.controlledObject.inputReceiverUpdate(timeStep)
    } else {
      // Look in camera's direction
      this.viewVector = new Vector3().subVectors(
        this.position,
        this.world.camera.position
      )
      this.getWorldPosition(this.world.cameraOperator.target)
    }
  }

  setAnimation(clipName: string, fadeIn: number): number {
    if (this.mixer !== undefined) {
      // gltf
      let clip = AnimationClip.findByName(this.animations, clipName)

      let action = this.mixer.clipAction(clip)
      if (action === null) {
        console.error(`Animation ${clipName} not found!`)
        return 0
      }

      this.mixer.stopAllAction()
      action.fadeIn(fadeIn)
      action.play()

      return action.getClip().duration
    }
  }

  springMovement(timeStep: number): void {
    // Simulator
    this.velocitySimulator.target.copy(this.velocityTarget)
    this.velocitySimulator.simulate(timeStep)

    // Update values
    this.velocity.copy(this.velocitySimulator.position)
    this.acceleration.copy(this.velocitySimulator.velocity)
  }

  springRotation(timeStep: number): void {
    // Spring rotation
    // Figure out angle between current and target orientation
    let angle = Utils.getSignedAngleBetweenVectors(
      this.orientation,
      this.orientationTarget
    )

    // Simulator
    this.rotationSimulator.target = angle
    this.rotationSimulator.simulate(timeStep)
    let rot = this.rotationSimulator.position

    // Updating values
    this.orientation.applyAxisAngle(new Vector3(0, 1, 0), rot)
    this.angularVelocity = this.rotationSimulator.velocity
  }

  getLocalMovementDirection(): Vector3 {
    const positiveX = this.actions.right.isPressed ? -1 : 0
    const negativeX = this.actions.left.isPressed ? 1 : 0
    const positiveZ = this.actions.up.isPressed ? 1 : 0
    const negativeZ = this.actions.down.isPressed ? -1 : 0

    return new Vector3(
      positiveX + negativeX,
      0,
      positiveZ + negativeZ
    ).normalize()
  }

  getCameraRelativeMovementVector(): Vector3 {
    const localDirection = this.getLocalMovementDirection()
    const flatViewVector = new Vector3(
      this.viewVector.x,
      0,
      this.viewVector.z
    ).normalize()

    return Utils.appplyVectorMatrixXZ(flatViewVector, localDirection)
  }

  setCameraRelativeOrientationTarget(): void {
    if (this.vehicleEntryInstance === null) {
      let moveVector = this.getCameraRelativeMovementVector()

      if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0) {
        this.setOrientation(this.orientation)
      } else {
        this.setOrientation(moveVector)
      }
    }
  }

  rotateModel(): void {
    this.lookAt(
      this.position.x + this.orientation.x,
      this.position.y + this.orientation.y,
      this.position.z + this.orientation.z
    )
    this.tiltContainer.rotation.z =
      -this.angularVelocity * 2.3 * this.velocity.length()
    this.tiltContainer.position.setY(
      Math.cos(Math.abs(this.angularVelocity * 2.3 * this.velocity.length())) /
        2 -
        0.5
    )
  }

  jump(initJumpSpeed: number = -1): void {
    this.wantsToJump = true
    this.initJumpSpeed = initJumpSpeed
  }

  findVehicleToEnter(wantsToDrive: boolean): void {
    // reusable world position variable
    let worldPos = new Vector3()

    // Find best vehicle
    let vehicleFinder = new ClosestObjectFinder<Vehicle>(this.position, 10)
    this.world.vehicles.forEach((vehicle) => {
      vehicleFinder.consider(vehicle, vehicle.position)
    })

    if (vehicleFinder.closestObject !== undefined) {
      let vehicle = vehicleFinder.closestObject
      let vehicleEntryInstance = new VehicleEntryInstance(this)
      vehicleEntryInstance.wantsToDrive = wantsToDrive

      // Find best seat
      let seatFinder = new ClosestObjectFinder<VehicleSeat>(this.position)
      for (const seat of vehicle.seats) {
        if (wantsToDrive) {
          // Consider driver seats
          if (seat.type === SeatType.Driver) {
            seat.seatPointObject.getWorldPosition(worldPos)
            seatFinder.consider(seat, worldPos)
          }
          // Consider passenger seats connected to driver seats
          else if (seat.type === SeatType.Passenger) {
            for (const connSeat of seat.connectedSeats) {
              if (connSeat.type === SeatType.Driver) {
                seat.seatPointObject.getWorldPosition(worldPos)
                seatFinder.consider(seat, worldPos)
                break
              }
            }
          }
        } else {
          // Consider passenger seats
          if (seat.type === SeatType.Passenger) {
            seat.seatPointObject.getWorldPosition(worldPos)
            seatFinder.consider(seat, worldPos)
          }
        }
      }

      if (seatFinder.closestObject !== undefined) {
        let targetSeat = seatFinder.closestObject
        vehicleEntryInstance.targetSeat = targetSeat

        let entryPointFinder = new ClosestObjectFinder<Object3D>(this.position)

        for (const point of targetSeat.entryPoints) {
          point.getWorldPosition(worldPos)
          entryPointFinder.consider(point, worldPos)
        }

        if (entryPointFinder.closestObject !== undefined) {
          vehicleEntryInstance.entryPoint = entryPointFinder.closestObject
          this.triggerAction('up', true)
          this.vehicleEntryInstance = vehicleEntryInstance
        }
      }
    }
  }

  enterVehicle(seat: VehicleSeat, entryPoint: Object3D): void {
    this.resetControls()

    if (seat.door?.rotation < 0.5) {
      this.setState(new OpenVehicleDoor(this, seat, entryPoint))
    } else {
      this.setState(new EnteringVehicle(this, seat, entryPoint))
    }
  }

  teleportToVehicle(vehicle: Vehicle, seat: VehicleSeat): void {
    this.resetVelocity()
    this.rotateModel()
    this.setPhysicsEnabled(false)
    ;(vehicle as unknown as Object3D).attach(this)

    this.setPosition(
      seat.seatPointObject.position.x,
      seat.seatPointObject.position.y + 0.6,
      seat.seatPointObject.position.z
    )
    this.quaternion.copy(seat.seatPointObject.quaternion)

    this.occupySeat(seat)
    this.setState(new Driving(this, seat))

    this.startControllingVehicle(vehicle, seat)
  }

  startControllingVehicle(vehicle: IControllable, seat: VehicleSeat): void {
    if (this.controlledObject !== vehicle) {
      this.transferControls(vehicle)
      this.resetControls()

      this.controlledObject = vehicle
      this.controlledObject.allowSleep(false)
      vehicle.inputReceiverInit()

      vehicle.controllingCharacter = this
    }
  }

  transferControls(entity: IControllable): void {
    // Currently running through all actions of this character and the vehicle,
    // comparing keycodes of actions and based on that triggering vehicle's actions
    // Maybe we should ask input manager what's the current state of the keyboard
    // and read those values... TODO
    for (const action1 in this.actions) {
      if (this.actions.hasOwnProperty(action1)) {
        for (const action2 in entity.actions) {
          if (entity.actions.hasOwnProperty(action2)) {
            let a1 = this.actions[action1]
            let a2 = entity.actions[action2]

            a1.eventCodes.forEach((code1) => {
              a2.eventCodes.forEach((code2) => {
                if (code1 === code2) {
                  entity.triggerAction(action2, a1.isPressed)
                }
              })
            })
          }
        }
      }
    }
  }

  stopControllingVehicle(): void {
    if (this.controlledObject?.controllingCharacter === this) {
      this.controlledObject.allowSleep(true)
      this.controlledObject.controllingCharacter = undefined
      this.controlledObject.resetControls()
      this.controlledObject = undefined
      this.inputReceiverInit()
    }
  }

  exitVehicle(): void {
    if (this.occupyingSeat !== null) {
      if (this.occupyingSeat.vehicle.entityType === EntityType.Airplane) {
        this.setState(new ExitingAirplane(this, this.occupyingSeat))
      } else {
        this.setState(new ExitingVehicle(this, this.occupyingSeat))
      }

      this.stopControllingVehicle()
    }
  }

  occupySeat(seat: VehicleSeat): void {
    this.occupyingSeat = seat
    seat.occupiedBy = this
  }

  leaveSeat(): void {
    if (this.occupyingSeat !== null) {
      this.occupyingSeat.occupiedBy = null
      this.occupyingSeat = null
    }
  }

  physicsPreStep(body: CANNON.Body, character: Character): void {
    character.feetRaycast()

    // Raycast debug
    if (character.rayHasHit) {
      if (character.raycastBox.visible) {
        character.raycastBox.position.x = character.rayResult.hitPointWorld.x
        character.raycastBox.position.y = character.rayResult.hitPointWorld.y
        character.raycastBox.position.z = character.rayResult.hitPointWorld.z
      }
    } else {
      if (character.raycastBox.visible) {
        character.raycastBox.position.set(
          body.position.x,
          body.position.y - character.rayCastLength - character.raySafeOffset,
          body.position.z
        )
      }
    }
  }

  feetRaycast(): void {
    // Player ray casting
    // Create ray
    let body = this.characterCapsule.body
    const start = new CANNON.Vec3(
      body.position.x,
      body.position.y,
      body.position.z
    )
    const end = new CANNON.Vec3(
      body.position.x,
      body.position.y - this.rayCastLength - this.raySafeOffset,
      body.position.z
    )
    // Raycast options
    const rayCastOptions = {
      collisionFilterMask: CollisionGroups.Default,
      skipBackfaces: true /* ignore back faces */,
    }
    // Cast the ray
    this.rayHasHit = this.world.physicsWorld.raycastClosest(
      start,
      end,
      rayCastOptions,
      this.rayResult
    )
  }

  physicsPostStep(body: CANNON.Body, character: Character): void {
    // Get velocities
    let simulatedVelocity = new Vector3(
      body.velocity.x,
      body.velocity.y,
      body.velocity.z
    )

    // Take local velocity
    let arcadeVelocity = new Vector3()
      .copy(character.velocity)
      .multiplyScalar(character.moveSpeed)
    // Turn local into global
    arcadeVelocity = Utils.appplyVectorMatrixXZ(
      character.orientation,
      arcadeVelocity
    )

    let newVelocity = new Vector3()

    // Additive velocity mode
    if (character.arcadeVelocityIsAdditive) {
      newVelocity.copy(simulatedVelocity)

      let globalVelocityTarget = Utils.appplyVectorMatrixXZ(
        character.orientation,
        character.velocityTarget
      )
      let add = new Vector3()
        .copy(arcadeVelocity)
        .multiply(character.arcadeVelocityInfluence)

      if (
        Math.abs(simulatedVelocity.x) <
          Math.abs(globalVelocityTarget.x * character.moveSpeed) ||
        Utils.haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)
      ) {
        newVelocity.x += add.x
      }
      if (
        Math.abs(simulatedVelocity.y) <
          Math.abs(globalVelocityTarget.y * character.moveSpeed) ||
        Utils.haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)
      ) {
        newVelocity.y += add.y
      }
      if (
        Math.abs(simulatedVelocity.z) <
          Math.abs(globalVelocityTarget.z * character.moveSpeed) ||
        Utils.haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)
      ) {
        newVelocity.z += add.z
      }
    } else {
      newVelocity = new Vector3(
        MathUtils.lerp(
          simulatedVelocity.x,
          arcadeVelocity.x,
          character.arcadeVelocityInfluence.x
        ),
        MathUtils.lerp(
          simulatedVelocity.y,
          arcadeVelocity.y,
          character.arcadeVelocityInfluence.y
        ),
        MathUtils.lerp(
          simulatedVelocity.z,
          arcadeVelocity.z,
          character.arcadeVelocityInfluence.z
        )
      )
    }

    // If we're hitting the ground, stick to ground
    if (character.rayHasHit) {
      // Flatten velocity
      newVelocity.y = 0

      // Move on top of moving objects
      if (character.rayResult.body.mass > 0) {
        let pointVelocity = new CANNON.Vec3()
        character.rayResult.body.getVelocityAtWorldPoint(
          character.rayResult.hitPointWorld,
          pointVelocity
        )
        newVelocity.add(Utils.threeVector(pointVelocity))
      }

      // Measure the normal vector offset from direct "up" vector
      // and transform it into a matrix
      let up = new Vector3(0, 1, 0)
      let normal = new Vector3(
        character.rayResult.hitNormalWorld.x,
        character.rayResult.hitNormalWorld.y,
        character.rayResult.hitNormalWorld.z
      )
      let q = new Quaternion().setFromUnitVectors(up, normal)
      let m = new Matrix4().makeRotationFromQuaternion(q)

      // Rotate the velocity vector
      newVelocity.applyMatrix4(m)

      // Compensate for gravity
      // newVelocity.y -= body.world.physicsWorld.gravity.y / body.character.world.physicsFrameRate;

      // Apply velocity
      body.velocity.x = newVelocity.x
      body.velocity.y = newVelocity.y
      body.velocity.z = newVelocity.z
      // Ground character
      body.position.y =
        character.rayResult.hitPointWorld.y +
        character.rayCastLength +
        newVelocity.y / character.world.physicsFrameRate
    } else {
      // If we're in air
      body.velocity.x = newVelocity.x
      body.velocity.y = newVelocity.y
      body.velocity.z = newVelocity.z

      // Save last in-air information
      character.groundImpactData.velocity.x = body.velocity.x
      character.groundImpactData.velocity.y = body.velocity.y
      character.groundImpactData.velocity.z = body.velocity.z
    }

    // Jumping
    if (character.wantsToJump) {
      // If initJumpSpeed is set
      if (character.initJumpSpeed > -1) {
        // Flatten velocity
        body.velocity.y = 0
        let speed = Math.max(
          character.velocitySimulator.position.length() * 4,
          character.initJumpSpeed
        )
        body.velocity = Utils.cannonVector(
          character.orientation.clone().multiplyScalar(speed)
        )
      } else {
        // Moving objects compensation
        let add = new CANNON.Vec3()
        character.rayResult.body.getVelocityAtWorldPoint(
          character.rayResult.hitPointWorld,
          add
        )
        body.velocity.vsub(add, body.velocity)
      }

      // Add positive vertical velocity
      body.velocity.y += 4
      // Move above ground by 2x safe offset value
      body.position.y += character.raySafeOffset * 2
      // Reset flag
      character.wantsToJump = false
    }
  }

  addToWorld(world: World): void {
    if (_.includes(world.characters, this)) {
      console.warn('Adding character to a world in which it already exists.')
    } else {
      // Set world
      this.world = world

      // Register character
      world.characters.push(this)

      // Register physics
      world.physicsWorld.addBody(this.characterCapsule.body)

      // Add to graphicsWorld
      world.graphicsWorld.add(this)
      world.graphicsWorld.add(this.raycastBox)

      // Shadow cascades
      this.materials.forEach((mat) => {
        world.sky.csm.setupMaterial(mat)
      })
    }
  }

  removeFromWorld(world: World): void {
    if (!_.includes(world.characters, this)) {
      console.warn("Removing character from a world in which it isn't present.")
    } else {
      if (world.inputManager.inputReceiver === this) {
        world.inputManager.inputReceiver = undefined
      }

      this.world = undefined

      // Remove from characters
      _.pull(world.characters, this)

      // Remove physics
      world.physicsWorld.remove(this.characterCapsule.body)

      // Remove visuals
      world.graphicsWorld.remove(this)
      world.graphicsWorld.remove(this.raycastBox)
    }
  }
}
