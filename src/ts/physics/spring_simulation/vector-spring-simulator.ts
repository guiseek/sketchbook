import { SimulatorBase } from './simulator-base'
import { SimulationFrameVector } from './simulation-frame-vector'
import { springV } from '../../core/function-library'
import { Vector3 } from 'three'

export class VectorSpringSimulator extends SimulatorBase {
  position: Vector3
  velocity: Vector3
  target: Vector3
  cache: SimulationFrameVector[]

  constructor(fps: number, mass: number, damping: number) {
    // Construct base
    super(fps, mass, damping)

    this.init()
  }

  init() {
    this.position = new Vector3()
    this.velocity = new Vector3()
    this.target = new Vector3()

    // Initialize cache by pushing two frames
    this.cache = []
    for (let i = 0; i < 2; i++) {
      this.cache.push(new SimulationFrameVector(new Vector3(), new Vector3()))
    }
  }

  /**
   * Advances the simulation by given time step
   * @param {number} timeStep
   */
  simulate(timeStep: number) {
    // Generate new frames
    this.generateFrames(timeStep)

    // Return interpolation
    this.position.lerpVectors(
      this.cache[0].position,
      this.cache[1].position,
      this.offset / this.frameTime
    )
    this.velocity.lerpVectors(
      this.cache[0].velocity,
      this.cache[1].velocity,
      this.offset / this.frameTime
    )
  }

  /**
   * Gets another simulation frame
   */
  getFrame(isLastFrame: boolean): SimulationFrameVector {
    // Deep clone data from previous frame
    let newSpring = new SimulationFrameVector(
      this.lastFrame().position.clone(),
      this.lastFrame().velocity.clone()
    )

    // Calculate new Spring
    springV(
      newSpring.position,
      this.target,
      newSpring.velocity,
      this.mass,
      this.damping
    )

    // Return new Spring
    return newSpring
  }
}
