import * as THREE from 'three';
import * as CANNON from 'cannon';
import { Vehicle } from './vehicle';
import { IControllable } from '../interfaces/icontrollable';
import { IWorldEntity } from '../interfaces/iworld-entity';
import { KeyBinding } from '../core/key-binding';
import { EntityType } from '../enums/entity-type';
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
