import { CharacterStateBase, Idle, JumpIdle, Walk } from './_stateLibrary'
import { ICharacterState } from '../../interfaces/icharacter-state'
import { Character } from '../character'

export class IdleRotateLeft
  extends CharacterStateBase
  implements ICharacterState
{
  constructor(character: Character) {
    super(character)

    this.character.rotationSimulator.mass = 30
    this.character.rotationSimulator.damping = 0.6

    this.character.velocitySimulator.damping = 0.6
    this.character.velocitySimulator.mass = 10

    this.character.setArcadeVelocityTarget(0)
    this.playAnimation('rotate_left', 0.1)
  }

  update(timeStep: number) {
    super.update(timeStep)

    if (this.animationEnded(timeStep)) {
      this.character.setState(new Idle(this.character))
    }

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
