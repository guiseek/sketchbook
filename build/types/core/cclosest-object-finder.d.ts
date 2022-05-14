import { Vector3 } from 'three';
export declare class ClosestObjectFinder<T> {
    closestObject: T;
    private closestDistance;
    private referencePosition;
    private maxDistance;
    constructor(referencePosition: Vector3, maxDistance?: number);
    consider(object: T, objectPosition: Vector3): void;
}
