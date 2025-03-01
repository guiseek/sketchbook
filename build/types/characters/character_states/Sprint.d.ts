import { CharacterStateBase } from './_stateLibrary';
import { Character } from '../character';
export declare class Sprint extends CharacterStateBase {
    constructor(character: Character);
    update(timeStep: number): void;
    onInputChange(): void;
}
