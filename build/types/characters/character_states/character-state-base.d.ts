import { Character } from '../character';
import { ICharacterState } from '../../interfaces/icharacter-state';
export declare abstract class CharacterStateBase implements ICharacterState {
    character: Character;
    timer: number;
    animationLength: any;
    canFindVehiclesToEnter: boolean;
    canEnterVehicles: boolean;
    canLeaveVehicles: boolean;
    constructor(character: Character);
    update(timeStep: number): void;
    onInputChange(): void;
    noDirection(): boolean;
    anyDirection(): boolean;
    fallInAir(): void;
    animationEnded(timeStep: number): boolean;
    setAppropriateDropState(): void;
    setAppropriateStartWalkState(): void;
    protected playAnimation(animName: string, fadeIn: number): void;
}
