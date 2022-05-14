import { ICharacterAI } from '../../interfaces/icharacter-ai';
import { Character } from '../character';
export declare class RandomBehaviour implements ICharacterAI {
    character: Character;
    private randomFrequency;
    constructor(randomFrequency?: number);
    update(timeStep: number): void;
}
