import { CharacterStateBase } from './_stateLibrary';
import { ICharacterState } from '../../interfaces/icharacter-state';
import { Character } from '../character';
export declare class JumpRunning extends CharacterStateBase implements ICharacterState {
    private alreadyJumped;
    constructor(character: Character);
    update(timeStep: number): void;
}
