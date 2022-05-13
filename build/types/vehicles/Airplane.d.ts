import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { KeyBinding } from '../core/KeyBinding';
import { EntityType } from '../enums/EntityType';
import { VehicleAirplaneAction } from '../types/vehicle-action';
export declare class Airplane extends Vehicle implements IControllable, IWorldEntity {
    actions: Record<VehicleAirplaneAction, KeyBinding>;
    entityType: EntityType;
    rotor: THREE.Object3D;
    leftAileron: THREE.Object3D;
    rightAileron: THREE.Object3D;
    elevators: THREE.Object3D[];
    rudder: THREE.Object3D;
    private steeringSimulator;
    private aileronSimulator;
    private elevatorSimulator;
    private rudderSimulator;
    private enginePower;
    private lastDrag;
    constructor(gltf: any);
    noDirectionPressed(): boolean;
    update(timeStep: number): void;
    physicsPreStep(body: CANNON.Body, plane: Airplane): void;
    onInputChange(): void;
    readAirplaneData(gltf: any): void;
    inputReceiverInit(): void;
}
