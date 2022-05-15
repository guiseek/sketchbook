import { threeToCannon } from '../../../lib/utils/three-to-cannon'
import { ICollider } from '../../interfaces/icollider'
import * as Utils from '../../core/function-library'
import { Object3D } from 'three'
import * as CANNON from 'cannon'

export class TrimeshCollider implements ICollider {
  mesh: any
  options: any
  body: CANNON.Body
  debugModel: any

  constructor(mesh: Object3D, options: any) {
    this.mesh = mesh.clone()

    const defaults = {
      mass: 0,
      position: mesh.position,
      rotation: mesh.quaternion,
      friction: 0.3,
    }
    options = Utils.setDefaults(options, defaults)
    this.options = options

    const mat = new CANNON.Material('triMat')
    mat.friction = options.friction
    // mat.restitution = 0.7;

    const shape = threeToCannon(this.mesh, { type: threeToCannon.Type.MESH })
    // shape['material'] = mat;

    // Add phys sphere
    const physBox = new CANNON.Body({
      mass: options.mass,
      position: options.position,
      quaternion: options.rotation,
      shape: shape,
    })

    physBox.material = mat

    this.body = physBox
  }
}
