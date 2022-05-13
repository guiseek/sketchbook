import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Vehicle } from './Vehicle';
import { IControllable } from '../interfaces/IControllable';
import { IWorldEntity } from '../interfaces/IWorldEntity';
import { KeyBinding } from '../core/KeyBinding';
import { EntityType } from '../enums/EntityType';
import { VehicleHelicopterAction } from '../types/vehicle-action';
export declare class Helicopter extends Vehicle implements IControllable, IWorldEntity {
    actions: Record<VehicleHelicopterAction, KeyBinding>;
    entityType: EntityType;
    rotors: THREE.Object3D[];
    private enginePower;
    constructor(gltf: any);
    noDirectionPressed(): boolean;
    update(timeStep: number): void;
    onInputChange(): void;
    physicsPreStep(body: CANNON.Body, heli: Helicopter): void;
    readHelicopterData(gltf: any): void;
    inputReceiverInit(): void;
}
