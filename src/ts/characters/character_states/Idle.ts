import { CharacterStateBase, JumpIdle, Walk } from './_stateLibrary'
import { ICharacterState } from '../../interfaces/icharacter-state'
import { Character } from '../character'

export class Idle extends CharacterStateBase implements ICharacterState {
  constructor(character: Character) {
    super(character)

    this.character.velocitySimulator.damping = 0.6
    this.character.velocitySimulator.mass = 10

    this.character.setArcadeVelocityTarget(0)
    this.playAnimation('idle', 0.1)
  }

  update(timeStep: number) {
    super.update(timeStep)

    this.fallInAir()
  }
  onInputChange() {
    super.onInputChange()

    if (this.character.actions.jump.justPressed) {
      this.character.setState(new JumpIdle(this.character))
    }

    if (this.anyDirection()) {
      if (this.character.velocity.length() > 0.5) {
        this.character.setState(new Walk(this.character))
      } else {
        this.setAppropriateStartWalkState()
      }
    }
  }
}
