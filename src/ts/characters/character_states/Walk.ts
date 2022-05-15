import { Character } from '../character'
import {
  CharacterStateBase,
  JumpRunning,
  EndWalk,
  Sprint,
  Idle,
} from './_stateLibrary'

export class Walk extends CharacterStateBase {
  constructor(character: Character) {
    super(character)

    this.canEnterVehicles = true
    this.character.setArcadeVelocityTarget(0.8)
    this.playAnimation('run', 0.1)
  }

  update(timeStep: number) {
    super.update(timeStep)

    this.character.setCameraRelativeOrientationTarget()

    this.fallInAir()
  }

  onInputChange() {
    super.onInputChange()

    if (this.noDirection()) {
      this.character.setState(new EndWalk(this.character))
    }

    if (this.character.actions.run.isPressed) {
      this.character.setState(new Sprint(this.character))
    }

    if (this.character.actions.run.justPressed) {
      this.character.setState(new Sprint(this.character))
    }

    if (this.character.actions.jump.justPressed) {
      this.character.setState(new JumpRunning(this.character))
    }

    if (this.noDirection()) {
      if (this.character.velocity.length() > 1) {
        this.character.setState(new EndWalk(this.character))
      } else {
        this.character.setState(new Idle(this.character))
      }
    }
  }
}
