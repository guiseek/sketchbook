import { IInputReceiver } from '../interfaces/iinput-receiver';
import { Camera, Vector2, Vector3 } from 'three';
import { IUpdatable } from '../interfaces/iupdatable';
import { Character } from '../characters/character';
import { KeyBinding } from './key-binding';
import { World } from '../world/World';
export declare class CameraOperator implements IInputReceiver, IUpdatable {
    world: World;
    camera: Camera;
    updateOrder: number;
    target: Vector3;
    sensitivity: Vector2;
    radius: number;
    theta: number;
    phi: number;
    onMouseDownPosition: Vector2;
    onMouseDownTheta: any;
    onMouseDownPhi: any;
    targetRadius: number;
    movementSpeed: number;
    actions: {
        [action: string]: KeyBinding;
    };
    upVelocity: number;
    forwardVelocity: number;
    rightVelocity: number;
    followMode: boolean;
    characterCaller: Character;
    constructor(world: World, camera: Camera, sensitivityX?: number, sensitivityY?: number);
    setSensitivity(sensitivityX: number, sensitivityY?: number): void;
    setRadius(value: number, instantly?: boolean): void;
    move(deltaX: number, deltaY: number): void;
    update(timeScale: number): void;
    handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean): void;
    handleMouseWheel(event: WheelEvent, value: number): void;
    handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void;
    handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void;
    inputReceiverInit(): void;
    inputReceiverUpdate(timeStep: number): void;
}
