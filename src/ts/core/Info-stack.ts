import { IWorldEntity } from '../interfaces/iworld-entity'
import { InfoStackMessage } from './Info-stack-message'
import { EntityType } from '../enums/entity-type'
import { World } from '../world/World'

export class InfoStack implements IWorldEntity {
  updateOrder = 3
  entityType: EntityType = EntityType.System

  messages: InfoStackMessage[] = []
  entranceAnimation = 'animate__slideInLeft'
  exitAnimation = 'animate__backOutDown'

  messageDuration = 3

  addMessage(text: string) {
    let messageElement = document.createElement('div')
    messageElement.classList.add(
      'console-message',
      'animate__animated',
      this.entranceAnimation
    )
    messageElement.style.setProperty('--animate-duration', '0.3s')
    let textElement = document.createTextNode(text)
    messageElement.appendChild(textElement)
    document.getElementById('console').prepend(messageElement)
    this.messages.push(new InfoStackMessage(this, messageElement))
  }

  update(timeStep: number) {
    for (const message of this.messages) {
      message.update(timeStep)
    }
  }

  addToWorld(world: World) {}

  removeFromWorld(world: World) {}
}
