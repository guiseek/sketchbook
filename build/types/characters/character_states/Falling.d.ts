import { CharacterStateBase } from './_stateLibrary';
import { ICharacterState } from '../../interfaces/icharacter-state';
import { Character } from '../character';
export declare class Falling extends CharacterStateBase implements ICharacterState {
    constructor(character: Character);
    update(timeStep: number): void;
}
