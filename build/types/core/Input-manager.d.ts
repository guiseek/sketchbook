import { IInputReceiver } from '../interfaces/iinput-receiver';
import { IUpdatable } from '../interfaces/iupdatable';
import { World } from '../world/World';
export declare class InputManager implements IUpdatable {
    updateOrder: number;
    world: World;
    domElement: HTMLElement;
    pointerLock: any;
    isLocked: boolean;
    inputReceiver: IInputReceiver;
    boundOnMouseDown: (evt: MouseEvent) => void;
    boundOnMouseMove: (evt: MouseEvent) => void;
    boundOnMouseUp: (evt: MouseEvent) => void;
    boundOnMouseWheelMove: (evt: WheelEvent) => void;
    boundOnPointerlockChange: (evt: Event) => void;
    boundOnPointerlockError: (evt: any) => void;
    boundOnKeyDown: (evt: KeyboardEvent) => void;
    boundOnKeyUp: (evt: KeyboardEvent) => void;
    constructor(world: World, domElement: HTMLElement);
    update(timestep: number, unscaledTimeStep: number): void;
    setInputReceiver(receiver: IInputReceiver): void;
    setPointerLock(enabled: boolean): void;
    onPointerlockChange(event: Event): void;
    onPointerlockError(event: MouseEvent): void;
    onMouseDown(event: MouseEvent): void;
    onMouseMove(event: MouseEvent): void;
    onMouseUp(event: MouseEvent): void;
    onKeyDown(event: KeyboardEvent): void;
    onKeyUp(event: KeyboardEvent): void;
    /**
     * @Todo use or remove
     */
    handleEvent<K extends keyof GlobalEventHandlersEventMap>(): (event: GlobalEventHandlersEventMap[K]) => void;
    onMouseWheelMove(event: WheelEvent): void;
}
