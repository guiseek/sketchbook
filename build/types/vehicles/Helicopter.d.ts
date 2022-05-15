import { Object3D } from 'three';
import { VehicleHelicopterAction } from '../types/vehicle-action';
import { IControllable } from '../interfaces/icontrollable';
import { IWorldEntity } from '../interfaces/iworld-entity';
import { EntityType } from '../enums/entity-type';
import { KeyBinding } from '../core/key-binding';
import { Vehicle } from './vehicle';
import * as CANNON from 'cannon';
export declare class Helicopter extends Vehicle implements IControllable, IWorldEntity {
    actions: Record<VehicleHelicopterAction, KeyBinding>;
    entityType: EntityType;
    rotors: Object3D[];
    private enginePower;
    constructor(gltf: any);
    noDirectionPressed(): boolean;
    update(timeStep: number): void;
    onInputChange(): void;
    physicsPreStep(body: CANNON.Body, heli: Helicopter): void;
    readHelicopterData(gltf: any): void;
    inputReceiverInit(): void;
}
