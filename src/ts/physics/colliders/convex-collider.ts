import { ICollider } from '../../interfaces/icollider'
import * as Utils from '../../core/function-library'
import { Geometry, Object3D, Vector3 } from 'three'
import * as CANNON from 'cannon'

export class ConvexCollider implements ICollider {
  mesh: any
  options: any
  body: CANNON.Body
  debugModel: any

  constructor(mesh: Object3D, options: any) {
    this.mesh = mesh.clone()

    const defaults = {
      mass: 0,
      position: mesh.position,
      friction: 0.3,
    }
    options = Utils.setDefaults(options, defaults)
    this.options = options

    const mat = new CANNON.Material('convMat')
    mat.friction = options.friction
    // mat.restitution = 0.7;

    if (this.mesh.geometry.isBufferGeometry) {
      this.mesh.geometry = new Geometry().fromBufferGeometry(this.mesh.geometry)
    }

    const cannonPoints = this.mesh.geometry.vertices.map((v: Vector3) => {
      return new CANNON.Vec3(v.x, v.y, v.z)
    })

    const cannonFaces = this.mesh.geometry.faces.map((f: any) => {
      return [f.a, f.b, f.c]
    })

    const shape = new CANNON.ConvexPolyhedron(cannonPoints, cannonFaces)
    // shape.material = mat;

    // Add phys sphere
    const physBox = new CANNON.Body({
      mass: options.mass,
      position: options.position,
      shape,
    })

    physBox.material = mat

    this.body = physBox
  }
}
