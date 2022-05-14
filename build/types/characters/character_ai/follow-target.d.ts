import { IControllable } from '../../interfaces/icontrollable';
import { ICharacterAI } from '../../interfaces/icharacter-ai';
import { Character } from '../character';
import { Object3D } from 'three';
export declare class FollowTarget implements ICharacterAI {
    character: Character;
    isTargetReached: boolean;
    target: Object3D;
    private stopDistance;
    constructor(target: Object3D, stopDistance?: number);
    getControlledAs<T extends IControllable>(): T;
    setTarget(target: Object3D): void;
    update(timeStep: number): void;
}
