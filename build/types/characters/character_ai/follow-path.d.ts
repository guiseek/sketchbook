import { ICharacterAI } from '../../interfaces/icharacter-ai';
import { PathNode } from '../../world/path-node';
import { FollowTarget } from './follow-target';
export declare class FollowPath extends FollowTarget implements ICharacterAI {
    nodeRadius: number;
    reverse: boolean;
    private staleTimer;
    private targetNode;
    constructor(firstNode: PathNode, nodeRadius: number);
    update(timeStep: number): void;
}
