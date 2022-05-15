import { ShaderMaterial, UniformsUtils, Vector3 } from 'three'
import { WaterShader } from '../../lib/shaders/WaterShader'
import { IUpdatable } from '../interfaces/iupdatable'
import { World } from './World'

export class Ocean implements IUpdatable {
  updateOrder = 10
  material: ShaderMaterial

  constructor(object: any, private world: World) {
    this.world = world

    let uniforms = UniformsUtils.clone(WaterShader.uniforms)
    uniforms.iResolution.value.x = window.innerWidth
    uniforms.iResolution.value.y = window.innerHeight

    this.material = new ShaderMaterial({
      uniforms: uniforms,
      fragmentShader: WaterShader.fragmentShader,
      vertexShader: WaterShader.vertexShader,
    })

    object.material = this.material
    object.material.transparent = true
  }

  update(timeStep: number): void {
    this.material.uniforms.cameraPos.value.copy(this.world.camera.position)
    this.material.uniforms.lightDir.value.copy(
      new Vector3().copy(this.world.sky.sunPosition).normalize()
    )
    this.material.uniforms.iGlobalTime.value += timeStep
  }
}
