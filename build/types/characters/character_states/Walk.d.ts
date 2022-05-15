import { Character } from '../character';
import { CharacterStateBase } from './_stateLibrary';
export declare class Walk extends CharacterStateBase {
    constructor(character: Character);
    update(timeStep: number): void;
    onInputChange(): void;
}
