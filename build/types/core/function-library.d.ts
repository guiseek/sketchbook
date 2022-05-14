import { SimulationFrame } from '../physics/spring_simulation/simulation-frame';
import { Space } from '../enums/space';
import { Side } from '../enums/side';
import * as CANNON from 'cannon';
import { Object3D, Geometry, Quaternion, Vector3, Matrix4 } from 'three';
export declare function createCapsuleGeometry(radius?: number, height?: number, N?: number): Geometry;
/**
 * Constructs a 2D matrix from first vector, replacing the Y axes with the global Y axis,
 * and applies this matrix to the second vector. Saves performance when compared to full 3D matrix application.
 * Useful for character rotation, as it only happens on the Y axis.
 * @param {Vector3} a Vector to construct 2D matrix from
 * @param {Vector3} b Vector to apply basis to
 */
export declare function appplyVectorMatrixXZ(a: Vector3, b: Vector3): Vector3;
export declare function round(value: number, decimals?: number): number;
export declare function roundVector(vector: Vector3, decimals?: number): Vector3;
/**
 * Finds an angle between two vectors
 * @param {Vector3} v1
 * @param {Vector3} v2
 */
export declare function getAngleBetweenVectors(v1: Vector3, v2: Vector3, dotTreshold?: number): number;
/**
 * Finds an angle between two vectors with a sign relative to normal vector
 */
export declare function getSignedAngleBetweenVectors(v1: Vector3, v2: Vector3, normal?: Vector3, dotTreshold?: number): number;
export declare function haveSameSigns(n1: number, n2: number): boolean;
export declare function haveDifferentSigns(n1: number, n2: number): boolean;
export declare function setDefaults(options: {}, defaults: {}): {};
export declare function getGlobalProperties(prefix?: string): any[];
export declare function spring(source: number, dest: number, velocity: number, mass: number, damping: number): SimulationFrame;
export declare function springV(source: Vector3, dest: Vector3, velocity: Vector3, mass: number, damping: number): void;
export declare function threeVector(vec: CANNON.Vec3): Vector3;
export declare function cannonVector(vec: Vector3): CANNON.Vec3;
export declare function threeQuat(quat: CANNON.Quaternion): Quaternion;
export declare function cannonQuat(quat: Quaternion): CANNON.Quaternion;
export declare function setupMeshProperties(child: any): void;
export declare function detectRelativeSide(from: Object3D, to: Object3D): Side;
export declare function easeInOutSine(x: number): number;
export declare function easeOutQuad(x: number): number;
export declare function getRight(obj: Object3D, space?: Space): Vector3;
export declare function getUp(obj: Object3D, space?: Space): Vector3;
export declare function getForward(obj: Object3D, space?: Space): Vector3;
export declare function getBack(obj: Object3D, space?: Space): Vector3;
export declare function getMatrix(obj: Object3D, space: Space): Matrix4;
export declare function countSleepyBodies(): any;
