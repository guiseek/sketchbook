import { Vehicle } from './vehicle';
import { VehicleSeat } from './vehicle-seat';
import { Vector3, Object3D } from 'three';
export declare class VehicleDoor {
    seat: VehicleSeat;
    vehicle: Vehicle;
    doorObject: Object3D;
    doorVelocity: number;
    doorWorldPos: Vector3;
    lastTrailerPos: Vector3;
    lastTrailerVel: Vector3;
    rotation: number;
    achievingTargetRotation: boolean;
    physicsEnabled: boolean;
    targetRotation: number;
    rotationSpeed: number;
    lastVehicleVel: Vector3;
    lastVehiclePos: Vector3;
    private sideMultiplier;
    constructor(seat: VehicleSeat, object: Object3D);
    update(timestep: number): void;
    preStepCallback(): void;
    open(): void;
    close(): void;
    resetPhysTrailer(): void;
}
