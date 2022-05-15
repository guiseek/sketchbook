import { ICollider } from '../../interfaces/icollider'
import * as Utils from '../../core/function-library'
import * as CANNON from 'cannon'
import { Mesh } from 'three'

export class SphereCollider implements ICollider {
  options: any
  body: CANNON.Body
  debugModel: Mesh

  constructor(options: any) {
    const defaults = {
      mass: 0,
      position: new CANNON.Vec3(),
      radius: 0.3,
      friction: 0.3,
    }
    options = Utils.setDefaults(options, defaults)
    this.options = options

    const mat = new CANNON.Material('sphereMat')
    mat.friction = options.friction

    const shape = new CANNON.Sphere(options.radius)
    // shape.material = mat;

    // Add phys sphere
    const physSphere = new CANNON.Body({
      mass: options.mass,
      position: options.position,
      shape,
    })
    physSphere.material = mat

    this.body = physSphere
  }
}
