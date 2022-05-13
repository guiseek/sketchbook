import { CharacterStateBase } from './_stateLibrary';
import { ICharacterState } from '../../interfaces/ICharacterState';
import { Character } from '../character';
export declare class JumpIdle extends CharacterStateBase implements ICharacterState {
    private alreadyJumped;
    constructor(character: Character);
    update(timeStep: number): void;
}
