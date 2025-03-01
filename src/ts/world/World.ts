import * as THREE from 'three'
import * as CANNON from 'cannon'
import Swal from 'sweetalert2'
import * as $ from 'jquery'

import { CameraOperator } from '../core/camera-operator'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'

import { Detector } from '../../lib/utils/Detector'
import { Stats } from '../../lib/utils/Stats'
import * as GUI from '../../lib/utils/dat.gui'
import { CannonDebugRenderer } from '../../lib/cannon/CannonDebugRenderer'
import * as _ from 'lodash'

import { InputManager } from '../core/Input-manager'
import * as Utils from '../core/function-library'
import { LoadingManager } from '../core/loading-manager'
import { InfoStack } from '../core/Info-stack'
import { UIManager } from '../core/ui-manager'
import { IWorldEntity } from '../interfaces/iworld-entity'
import { IUpdatable } from '../interfaces/iupdatable'
import { Character } from '../characters/character'
import { Path } from './path'
import { CollisionGroups } from '../enums/collision-groups'
import { BoxCollider } from '../physics/colliders/box-collider'
import { TrimeshCollider } from '../physics/colliders/trimesh-collider'
import { Vehicle } from '../vehicles/vehicle'
import { Scenario } from './scenario'
import { Sky } from './sky'
import { Ocean } from './ocean'

export class World {
  public renderer: THREE.WebGLRenderer
  public camera: THREE.PerspectiveCamera
  public composer: any
  public stats: Stats
  public graphicsWorld: THREE.Scene
  public sky: Sky
  public physicsWorld: CANNON.World
  public parallelPairs: any[]
  public physicsFrameRate: number
  public physicsFrameTime: number
  public physicsMaxPrediction: number
  public clock: THREE.Clock
  public renderDelta: number
  public logicDelta: number
  public requestDelta: number
  public sinceLastFrame: number
  public justRendered: boolean
  public params: any
  public inputManager: InputManager
  public cameraOperator: CameraOperator
  public timeScaleTarget: number = 1
  public console: InfoStack
  public cannonDebugRenderer: CannonDebugRenderer
  public scenarios: Scenario[] = []
  public characters: Character[] = []
  public vehicles: Vehicle[] = []
  public paths: Path[] = []
  public scenarioGUIFolder: any
  public updatables: IUpdatable[] = []

  private lastScenarioID: string

  constructor(worldScenePath?: any) {
    const scope = this

    // WebGL not supported
    if (!Detector.webgl) {
      Swal.fire({
        icon: 'warning',
        title: 'WebGL compatibility',
        text: "This browser doesn't seem to have the required WebGL capabilities. The application may not work correctly.",
        footer:
          '<a href="https://get.webgl.org/" target="_blank">Click here for more information</a>',
        showConfirmButton: false,
        buttonsStyling: false,
      })
    }

    // Renderer
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    this.generateHTML()

    // Auto window resize
    function onWindowResize(): void {
      scope.camera.aspect = window.innerWidth / window.innerHeight
      scope.camera.updateProjectionMatrix()
      scope.renderer.setSize(window.innerWidth, window.innerHeight)
      fxaaPass.uniforms['resolution'].value.set(
        1 / (window.innerWidth * pixelRatio),
        1 / (window.innerHeight * pixelRatio)
      )
      scope.composer.setSize(
        window.innerWidth * pixelRatio,
        window.innerHeight * pixelRatio
      )
    }
    window.addEventListener('resize', onWindowResize, false)

    // Three.js scene
    this.graphicsWorld = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      0.1,
      1010
    )

    // Passes
    let renderPass = new RenderPass(this.graphicsWorld, this.camera)
    let fxaaPass = new ShaderPass(FXAAShader)

    // FXAA
    let pixelRatio = this.renderer.getPixelRatio()
    fxaaPass.material['uniforms'].resolution.value.x =
      1 / (window.innerWidth * pixelRatio)
    fxaaPass.material['uniforms'].resolution.value.y =
      1 / (window.innerHeight * pixelRatio)

    // Composer
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(renderPass)
    this.composer.addPass(fxaaPass)

    // Physics
    this.physicsWorld = new CANNON.World()
    this.physicsWorld.gravity.set(0, -9.81, 0)
    this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld)
    this.physicsWorld.solver.iterations = 10
    this.physicsWorld.allowSleep = true

    this.parallelPairs = []
    this.physicsFrameRate = 60
    this.physicsFrameTime = 1 / this.physicsFrameRate
    this.physicsMaxPrediction = this.physicsFrameRate

    // RenderLoop
    this.clock = new THREE.Clock()
    this.renderDelta = 0
    this.logicDelta = 0
    this.sinceLastFrame = 0
    this.justRendered = false

    // Stats (FPS, Frame time, Memory)
    this.stats = Stats()
    // Create right panel GUI
    this.createParamsGUI(scope)

    // Initialization
    this.inputManager = new InputManager(this, this.renderer.domElement)
    this.cameraOperator = new CameraOperator(
      this,
      this.camera,
      this.params.Mouse_Sensitivity
    )
    this.sky = new Sky(this)

    // Load scene if path is supplied
    if (worldScenePath !== undefined) {
      let loadingManager = new LoadingManager(this)
      loadingManager.onFinishedCallback = () => {
        this.update(1, 1)
        this.setTimeScale(1)

        Swal.fire({
          title: 'Bem vindo ao Borba Gato!',
          text: 'Sinta-se à vontade para explorar o bairro e usar os veículos disponíveis. Existem também várias turmas de outras ruas prontas para diversão no painel direito.',
          footer:
          `
          <svg role="img" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path></svg>
          <a href="https://github.com/guiseek/sketchbook" target="_blank">GitHub</a>
          `,
          confirmButtonText: 'Blz!',
          buttonsStyling: false,
          onClose: () => {
            UIManager.setUserInterfaceVisible(true)
          },
        })
      }
      loadingManager.loadGLTF(worldScenePath, (gltf) => {
        this.loadScene(loadingManager, gltf)
      })
    } else {
      UIManager.setUserInterfaceVisible(true)
      UIManager.setLoadingScreenVisible(false)
      Swal.fire({
        icon: 'success',
        title: 'Eaí BG!',
        text: 'O centro esportivo está vazio e foi inicializado com sucesso. Aprecie a quadrinha.',
        buttonsStyling: false,
      })
    }

    this.render(this)
  }

  // Update
  // Handles all logic updates.
  public update(timeStep: number, unscaledTimeStep: number): void {
    this.updatePhysics(timeStep)

    // Update registred objects
    this.updatables.forEach((entity) => {
      entity.update(timeStep, unscaledTimeStep)
    })

    // Lerp time scale
    this.params.Time_Scale = THREE.MathUtils.lerp(
      this.params.Time_Scale,
      this.timeScaleTarget,
      0.2
    )

    // Physics debug
    if (this.params.Debug_Physics) this.cannonDebugRenderer.update()
  }

  public updatePhysics(timeStep: number): void {
    // Step the physics world
    this.physicsWorld.step(this.physicsFrameTime, timeStep)

    this.characters.forEach((char) => {
      if (this.isOutOfBounds(char.characterCapsule.body.position)) {
        this.outOfBoundsRespawn(char.characterCapsule.body)
      }
    })

    this.vehicles.forEach((vehicle) => {
      if (this.isOutOfBounds(vehicle.rayCastVehicle.chassisBody.position)) {
        let worldPos = new THREE.Vector3()
        vehicle.spawnPoint.getWorldPosition(worldPos)
        worldPos.y += 1
        this.outOfBoundsRespawn(
          vehicle.rayCastVehicle.chassisBody,
          Utils.cannonVector(worldPos)
        )
      }
    })
  }

  public isOutOfBounds(position: CANNON.Vec3): boolean {
    let inside =
      position.x > -211.882 &&
      position.x < 211.882 &&
      position.z > -169.098 &&
      position.z < 153.232 &&
      position.y > 0.107
    let belowSeaLevel = position.y < 14.989

    return !inside && belowSeaLevel
  }

  public outOfBoundsRespawn(body: CANNON.Body, position?: CANNON.Vec3): void {
    let newPos = position || new CANNON.Vec3(0, 16, 0)
    let newQuat = new CANNON.Quaternion(0, 0, 0, 1)

    body.position.copy(newPos)
    body.interpolatedPosition.copy(newPos)
    body.quaternion.copy(newQuat)
    body.interpolatedQuaternion.copy(newQuat)
    body.velocity.setZero()
    body.angularVelocity.setZero()
  }

  /**
   * Rendering loop.
   * Implements fps limiter and frame-skipping
   * Calls world's "update" function before rendering.
   * @param {World} world
   */
  public render(world: World): void {
    this.requestDelta = this.clock.getDelta()

    requestAnimationFrame(() => {
      world.render(world)
    })

    // Getting timeStep
    let unscaledTimeStep =
      this.requestDelta + this.renderDelta + this.logicDelta
    let timeStep = unscaledTimeStep * this.params.Time_Scale
    timeStep = Math.min(timeStep, 1 / 30) // min 30 fps

    // Logic
    world.update(timeStep, unscaledTimeStep)

    // Measuring logic time
    this.logicDelta = this.clock.getDelta()

    // Frame limiting
    let interval = 1 / 60
    this.sinceLastFrame +=
      this.requestDelta + this.renderDelta + this.logicDelta
    this.sinceLastFrame %= interval

    // Stats end
    this.stats.end()
    this.stats.begin()

    // Actual rendering with a FXAA ON/OFF switch
    if (this.params.FXAA) this.composer.render()
    else this.renderer.render(this.graphicsWorld, this.camera)

    // Measuring render time
    this.renderDelta = this.clock.getDelta()
  }

  public setTimeScale(value: number): void {
    this.params.Time_Scale = value
    this.timeScaleTarget = value
  }

  public add(worldEntity: IWorldEntity): void {
    worldEntity.addToWorld(this)
    this.registerUpdatable(worldEntity)
  }

  public registerUpdatable(registree: IUpdatable): void {
    this.updatables.push(registree)
    this.updatables.sort((a, b) => (a.updateOrder > b.updateOrder ? 1 : -1))
  }

  public remove(worldEntity: IWorldEntity): void {
    worldEntity.removeFromWorld(this)
    this.unregisterUpdatable(worldEntity)
  }

  public unregisterUpdatable(registree: IUpdatable): void {
    _.pull(this.updatables, registree)
  }

  public loadScene(loadingManager: LoadingManager, gltf: any): void {
    gltf.scene.traverse((child) => {
      if (child.hasOwnProperty('userData')) {
        if (child.type === 'Mesh') {
          Utils.setupMeshProperties(child)
          this.sky.csm.setupMaterial(child.material)

          if (child.material.name === 'ocean') {
            this.registerUpdatable(new Ocean(child, this))
          }
        }

        if (child.userData.hasOwnProperty('data')) {
          if (child.userData.data === 'physics') {
            if (child.userData.hasOwnProperty('type')) {
              // Convex doesn't work! Stick to boxes!
              if (child.userData.type === 'box') {
                let phys = new BoxCollider({
                  size: new THREE.Vector3(
                    child.scale.x,
                    child.scale.y,
                    child.scale.z
                  ),
                })
                phys.body.position.copy(Utils.cannonVector(child.position))
                phys.body.quaternion.copy(Utils.cannonQuat(child.quaternion))
                phys.body.computeAABB()

                phys.body.shapes.forEach((shape) => {
                  shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders
                })

                this.physicsWorld.addBody(phys.body)
              } else if (child.userData.type === 'trimesh') {
                let phys = new TrimeshCollider(child, {})
                this.physicsWorld.addBody(phys.body)
              }

              child.visible = false
            }
          }

          if (child.userData.data === 'path') {
            this.paths.push(new Path(child))
          }

          if (child.userData.data === 'scenario') {
            this.scenarios.push(new Scenario(child, this))
          }
        }
      }
    })

    this.graphicsWorld.add(gltf.scene)

    // Launch default scenario
    let defaultScenarioID: string
    for (const scenario of this.scenarios) {
      if (scenario.default) {
        defaultScenarioID = scenario.id
        break
      }
    }
    if (defaultScenarioID !== undefined)
      this.launchScenario(defaultScenarioID, loadingManager)
  }

  public launchScenario(
    scenarioID: string,
    loadingManager?: LoadingManager
  ): void {
    this.lastScenarioID = scenarioID

    this.clearEntities()

    // Launch default scenario
    if (!loadingManager) loadingManager = new LoadingManager(this)
    for (const scenario of this.scenarios) {
      if (scenario.id === scenarioID || scenario.spawnAlways) {
        scenario.launch(loadingManager, this)
      }
    }
  }

  public restartScenario(): void {
    if (this.lastScenarioID !== undefined) {
      document.exitPointerLock()
      this.launchScenario(this.lastScenarioID)
    } else {
      console.warn("Can't restart scenario. Last scenarioID is undefined.")
    }
  }

  public clearEntities(): void {
    for (let i = 0; i < this.characters.length; i++) {
      this.remove(this.characters[i])
      i--
    }

    for (let i = 0; i < this.vehicles.length; i++) {
      this.remove(this.vehicles[i])
      i--
    }
  }

  public scrollTheTimeScale(scrollAmount: number): void {
    // Changing time scale with scroll wheel
    const timeScaleBottomLimit = 0.003
    const timeScaleChangeSpeed = 1.3

    if (scrollAmount > 0) {
      this.timeScaleTarget /= timeScaleChangeSpeed
      if (this.timeScaleTarget < timeScaleBottomLimit) this.timeScaleTarget = 0
    } else {
      this.timeScaleTarget *= timeScaleChangeSpeed
      if (this.timeScaleTarget < timeScaleBottomLimit)
        this.timeScaleTarget = timeScaleBottomLimit
      this.timeScaleTarget = Math.min(this.timeScaleTarget, 1)
    }
  }

  public updateControls(controls: any): void {
    let html = ''
    html += '<h2 class="controls-title">Controls:</h2>'

    controls.forEach((row) => {
      html += '<div class="ctrl-row">'
      row.keys.forEach((key) => {
        if (key === '+' || key === 'and' || key === 'or' || key === '&')
          html += '&nbsp;' + key + '&nbsp;'
        else html += '<span class="ctrl-key">' + key + '</span>'
      })

      html += '<span class="ctrl-desc">' + row.desc + '</span></div>'
    })

    document.getElementById('controls').innerHTML = html
  }

  private generateHTML(): void {
    // Fonts
    $('head').append(
      '<link href="https://fonts.googleapis.com/css2?family=Alfa+Slab+One&display=swap" rel="stylesheet">'
    )
    $('head').append(
      '<link href="https://fonts.googleapis.com/css2?family=Solway:wght@400;500;700&display=swap" rel="stylesheet">'
    )
    $('head').append(
      '<link href="https://fonts.googleapis.com/css2?family=Cutive+Mono&display=swap" rel="stylesheet">'
    )

    // Loader
    $(`	<div id="loading-screen">
				<div id="loading-screen-background"></div>
				<h1 id="main-title" class="sb-font">Crazy Baldhead</h1>
				<div class="cubeWrap">
					<div class="cube">
						<div class="faces1"></div>
						<div class="faces2"></div>     
					</div> 
				</div> 
				<div id="loading-text">Loading...</div>
			</div>
		`).appendTo('body')

    // UI
    $(`	<div id="ui-container" style="display: none;">
				<div class="github-corner">
					<a href="https://github.com/guiseek/sketchbook" target="_blank" title="Fork me on GitHub">
						<svg viewbox="0 0 100 100" fill="currentColor">
							<title>Fork me on GitHub</title>
							<path d="M0 0v100h100V0H0zm60 70.2h.2c1 2.7.3 4.7 0 5.2 1.4 1.4 2 3 2 5.2 0 7.4-4.4 9-8.7 9.5.7.7 1.3 2
							1.3 3.7V99c0 .5 1.4 1 1.4 1H44s1.2-.5 1.2-1v-3.8c-3.5 1.4-5.2-.8-5.2-.8-1.5-2-3-2-3-2-2-.5-.2-1-.2-1
							2-.7 3.5.8 3.5.8 2 1.7 4 1 5 .3.2-1.2.7-2 1.2-2.4-4.3-.4-8.8-2-8.8-9.4 0-2 .7-4 2-5.2-.2-.5-1-2.5.2-5
							0 0 1.5-.6 5.2 1.8 1.5-.4 3.2-.6 4.8-.6 1.6 0 3.3.2 4.8.7 2.8-2 4.4-2 5-2z" fill="#fff"></path>
						</svg>
					</a>
				</div>
				<div class="left-panel">
					<div id="controls" class="panel-segment flex-bottom"></div>
				</div>
			</div>
		`).appendTo('body')

    // Canvas
    document.body.appendChild(this.renderer.domElement)
    this.renderer.domElement.id = 'canvas'
  }

  private createParamsGUI(scope: World): void {
    this.params = {
      Pointer_Lock: true,
      Mouse_Sensitivity: 0.3,
      Time_Scale: 1,
      Shadows: true,
      FXAA: true,
      Debug_Physics: false,
      Debug_FPS: false,
      Sun_Elevation: 50,
      Sun_Rotation: 145,
    }

    const gui = new GUI.GUI()

    // Scenario
    this.scenarioGUIFolder = gui.addFolder('Cenários')
    this.scenarioGUIFolder.open()

    // World
    let worldFolder = gui.addFolder('World')
    worldFolder
      .add(this.params, 'Time_Scale', 0, 1)
      .listen()
      .onChange((value) => {
        scope.timeScaleTarget = value
      })
    worldFolder
      .add(this.params, 'Sun_Elevation', 0, 180)
      .listen()
      .onChange((value) => {
        scope.sky.phi = value
      })
    worldFolder
      .add(this.params, 'Sun_Rotation', 0, 360)
      .listen()
      .onChange((value) => {
        scope.sky.theta = value
      })

    // Input
    let settingsFolder = gui.addFolder('Configurações')
    settingsFolder.add(this.params, 'FXAA')
    settingsFolder.add(this.params, 'Shadows').onChange((enabled) => {
      if (enabled) {
        this.sky.csm.lights.forEach((light) => {
          light.castShadow = true
        })
      } else {
        this.sky.csm.lights.forEach((light) => {
          light.castShadow = false
        })
      }
    })
    settingsFolder.add(this.params, 'Pointer_Lock').onChange((enabled) => {
      scope.inputManager.setPointerLock(enabled)
    })
    settingsFolder
      .add(this.params, 'Mouse_Sensitivity', 0, 1)
      .onChange((value) => {
        scope.cameraOperator.setSensitivity(value, value * 0.8)
      })
    settingsFolder.add(this.params, 'Debug_Physics').onChange((enabled) => {
      if (enabled) {
        this.cannonDebugRenderer = new CannonDebugRenderer(
          this.graphicsWorld,
          this.physicsWorld
        )
      } else {
        this.cannonDebugRenderer.clearMeshes()
        this.cannonDebugRenderer = undefined
      }

      scope.characters.forEach((char) => {
        char.raycastBox.visible = enabled
      })
    })
    settingsFolder.add(this.params, 'Debug_FPS').onChange((enabled) => {
      UIManager.setFPSVisible(enabled)
    })

    gui.open()
  }
}
