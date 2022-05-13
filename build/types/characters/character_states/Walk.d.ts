import { CharacterStateBase } from './_stateLibrary';
import { Character } from '../character';
export declare class Walk extends CharacterStateBase {
    constructor(character: Character);
    update(timeStep: number): void;
    onInputChange(): void;
}
