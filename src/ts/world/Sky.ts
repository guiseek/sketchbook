import { SkyShader } from '../../lib/shaders/SkyShader'
import { IUpdatable } from '../interfaces/iupdatable'
import { default as CSM } from 'three-csm'
import { World } from './World'
import {
  SphereBufferGeometry,
  HemisphereLight,
  ShaderMaterial,
  UniformsUtils,
  BackSide,
  Object3D,
  Vector3,
  Mesh,
} from 'three'

export class Sky extends Object3D implements IUpdatable {
  updateOrder = 5

  sunPosition = new Vector3()
  csm: CSM

  set theta(value: number) {
    this._theta = value
    this.refreshSunPosition()
  }

  set phi(value: number) {
    this._phi = value
    this.refreshSunPosition()
    this.refreshHemiIntensity()
  }

  private _phi = 50
  private _theta = 145

  private hemiLight: HemisphereLight
  private maxHemiIntensity = 0.9
  private minHemiIntensity = 0.3

  private skyMesh: Mesh
  private skyMaterial: ShaderMaterial

  constructor(private world: World) {
    super()

    // Sky material
    this.skyMaterial = new ShaderMaterial({
      uniforms: UniformsUtils.clone(SkyShader.uniforms),
      fragmentShader: SkyShader.fragmentShader,
      vertexShader: SkyShader.vertexShader,
      side: BackSide,
    })

    // Mesh
    this.skyMesh = new Mesh(
      new SphereBufferGeometry(1000, 24, 12),
      this.skyMaterial
    )
    this.attach(this.skyMesh)

    // Ambient light
    this.hemiLight = new HemisphereLight(0xffffff, 0xffffff, 1.0)
    this.refreshHemiIntensity()
    this.hemiLight.color.setHSL(0.59, 0.4, 0.6)
    this.hemiLight.groundColor.setHSL(0.095, 0.2, 0.75)
    this.hemiLight.position.set(0, 50, 0)
    this.world.graphicsWorld.add(this.hemiLight)

    // CSM
    // New version
    // let splitsCallback = (amount, near, far, target) =>
    // {
    // 	for (let i = amount - 1; i >= 0; i--)
    // 	{
    // 		target.push(Math.pow(1 / 3, i));
    // 	}
    // };

    // Legacy
    const splitsCallback = (amount: number, near: number, far: number) => {
      let arr = []

      for (let i = amount - 1; i >= 0; i--) {
        arr.push(Math.pow(1 / 4, i))
      }

      return arr
    }

    this.csm = new CSM({
      fov: 80,
      far: 250, // maxFar
      lightIntensity: 2.5,
      cascades: 3,
      shadowMapSize: 2048,
      camera: world.camera,
      parent: world.graphicsWorld,
      mode: 'custom',
      customSplitsCallback: splitsCallback,
    })
    this.csm.fade = true

    this.refreshSunPosition()

    world.graphicsWorld.add(this)
    world.registerUpdatable(this)
  }

  update(timeScale: number) {
    this.position.copy(this.world.camera.position)
    this.refreshSunPosition()

    this.csm.update(this.world.camera.matrix)
    this.csm.lightDirection = new Vector3(
      -this.sunPosition.x,
      -this.sunPosition.y,
      -this.sunPosition.z
    ).normalize()
  }

  refreshSunPosition() {
    const sunDistance = 10

    this.sunPosition.x =
      sunDistance *
      Math.sin((this._theta * Math.PI) / 180) *
      Math.cos((this._phi * Math.PI) / 180)
    this.sunPosition.y = sunDistance * Math.sin((this._phi * Math.PI) / 180)
    this.sunPosition.z =
      sunDistance *
      Math.cos((this._theta * Math.PI) / 180) *
      Math.cos((this._phi * Math.PI) / 180)

    this.skyMaterial.uniforms.sunPosition.value.copy(this.sunPosition)
    this.skyMaterial.uniforms.cameraPos.value.copy(this.world.camera.position)
  }

  refreshHemiIntensity() {
    this.hemiLight.intensity =
      this.minHemiIntensity +
      Math.pow(1 - Math.abs(this._phi - 90) / 90, 0.25) *
        (this.maxHemiIntensity - this.minHemiIntensity)
  }
}
