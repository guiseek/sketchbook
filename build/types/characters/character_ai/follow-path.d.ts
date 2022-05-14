import { FollowTarget } from './follow-target';
import { ICharacterAI } from '../../interfaces/icharacter-ai';
import { PathNode } from '../../world/path-node';
export declare class FollowPath extends FollowTarget implements ICharacterAI {
    nodeRadius: number;
    reverse: boolean;
    private staleTimer;
    private targetNode;
    constructor(firstNode: PathNode, nodeRadius: number);
    update(timeStep: number): void;
}
