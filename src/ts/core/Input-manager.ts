import { IInputReceiver } from '../interfaces/iinput-receiver'
import { IUpdatable } from '../interfaces/iupdatable'
import { World } from '../world/World'

export class InputManager implements IUpdatable {
  updateOrder = 3

  world: World
  domElement: HTMLElement
  pointerLock: any
  isLocked: boolean
  inputReceiver: IInputReceiver

  boundOnMouseDown: (evt: MouseEvent) => void
  boundOnMouseMove: (evt: MouseEvent) => void
  boundOnMouseUp: (evt: MouseEvent) => void
  boundOnMouseWheelMove: (evt: WheelEvent) => void
  boundOnPointerlockChange: (evt: Event) => void
  boundOnPointerlockError: (evt: any) => void
  boundOnKeyDown: (evt: KeyboardEvent) => void
  boundOnKeyUp: (evt: KeyboardEvent) => void

  constructor(world: World, domElement: HTMLElement) {
    this.world = world
    this.pointerLock = world.params.Pointer_Lock
    this.domElement = domElement ?? document.body
    this.isLocked = false

    // Bindings for later event use
    // Mouse
    this.boundOnMouseDown = (evt) => this.onMouseDown(evt)
    this.boundOnMouseMove = (evt) => this.onMouseMove(evt)
    this.boundOnMouseUp = (evt) => this.onMouseUp(evt)
    this.boundOnMouseWheelMove = (evt) => this.onMouseWheelMove(evt)

    // Pointer lock
    this.boundOnPointerlockChange = (evt) => this.onPointerlockChange(evt)
    this.boundOnPointerlockError = (evt) => this.onPointerlockError(evt)

    // Keys
    this.boundOnKeyDown = (evt) => this.onKeyDown(evt)
    this.boundOnKeyUp = (evt) => this.onKeyUp(evt)

    // Init event listeners
    // Mouse
    this.domElement.addEventListener('mousedown', this.boundOnMouseDown, false)
    document.addEventListener('wheel', this.boundOnMouseWheelMove, false)
    document.addEventListener(
      'pointerlockchange',
      this.boundOnPointerlockChange,
      false
    )
    document.addEventListener(
      'pointerlockerror',
      this.boundOnPointerlockError,
      false
    )

    // Keys
    document.addEventListener('keydown', this.boundOnKeyDown, false)
    document.addEventListener('keyup', this.boundOnKeyUp, false)

    world.registerUpdatable(this)
  }

  update(timestep: number, unscaledTimeStep: number): void {
    if (!this.inputReceiver && !!this.world.cameraOperator) {
      this.setInputReceiver(this.world.cameraOperator)
    }

    this.inputReceiver?.inputReceiverUpdate(unscaledTimeStep)
  }

  setInputReceiver(receiver: IInputReceiver): void {
    this.inputReceiver = receiver
    this.inputReceiver.inputReceiverInit()
  }

  setPointerLock(enabled: boolean): void {
    this.pointerLock = enabled
  }

  onPointerlockChange(event: Event): void {
    if (document.pointerLockElement === this.domElement) {
      this.domElement.addEventListener(
        'mousemove',
        this.boundOnMouseMove,
        false
      )
      this.domElement.addEventListener('mouseup', this.boundOnMouseUp, false)
      this.isLocked = true
    } else {
      this.domElement.removeEventListener(
        'mousemove',
        this.boundOnMouseMove,
        false
      )
      this.domElement.removeEventListener('mouseup', this.boundOnMouseUp, false)
      this.isLocked = false
    }
  }

  onPointerlockError(event: MouseEvent): void {
    console.error('PointerLockControls: Unable to use Pointer Lock API')
  }

  onMouseDown(event: MouseEvent): void {
    if (this.pointerLock) {
      this.domElement.requestPointerLock()
    } else {
      this.domElement.addEventListener(
        'mousemove',
        this.boundOnMouseMove,
        false
      )
      this.domElement.addEventListener('mouseup', this.boundOnMouseUp, false)
    }

    if (this.inputReceiver !== undefined) {
      this.inputReceiver.handleMouseButton(event, 'mouse' + event.button, true)
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (this.inputReceiver !== undefined) {
      this.inputReceiver.handleMouseMove(
        event,
        event.movementX,
        event.movementY
      )
    }
  }

  onMouseUp(event: MouseEvent): void {
    if (!this.pointerLock) {
      this.domElement.removeEventListener(
        'mousemove',
        this.boundOnMouseMove,
        false
      )
      this.domElement.removeEventListener('mouseup', this.boundOnMouseUp, false)
    }

    if (this.inputReceiver !== undefined) {
      this.inputReceiver.handleMouseButton(event, 'mouse' + event.button, false)
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.inputReceiver !== undefined) {
      this.inputReceiver.handleKeyboardEvent(event, event.code, true)
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (this.inputReceiver !== undefined) {
      this.inputReceiver.handleKeyboardEvent(event, event.code, false)
    }
  }

  /**
   * @Todo use or remove
   */
  handleEvent<K extends keyof GlobalEventHandlersEventMap>() {
    return (event: GlobalEventHandlersEventMap[K]) => {
      if (this.inputReceiver !== undefined && event instanceof WheelEvent) {
        this.inputReceiver.handleMouseWheel(event, event.deltaY)
      }
    }
  }

  onMouseWheelMove(event: WheelEvent): void {
    if (this.inputReceiver !== undefined) {
      this.inputReceiver.handleMouseWheel(event, event.deltaY)
    }
  }
}
