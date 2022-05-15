import { ICharacterState } from '../../interfaces/icharacter-state';
import { Character } from '../character';
import { CharacterStateBase } from './_stateLibrary';
export declare class DropIdle extends CharacterStateBase implements ICharacterState {
    constructor(character: Character);
    update(timeStep: number): void;
    onInputChange(): void;
}
