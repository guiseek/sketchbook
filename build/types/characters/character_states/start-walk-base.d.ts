import { Character } from '../character';
import { CharacterStateBase } from './_stateLibrary';
export declare class StartWalkBase extends CharacterStateBase {
    constructor(character: Character);
    update(timeStep: number): void;
    onInputChange(): void;
}
