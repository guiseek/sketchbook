import { IWorldEntity } from '../interfaces/iworld-entity'
import { InfoStackMessage } from './Info-stack-message'
import { EntityType } from '../enums/entity-type'
import { World } from '../world/World'

export class InfoStack implements IWorldEntity {
  public updateOrder = 3
  public entityType: EntityType = EntityType.System

  public messages: InfoStackMessage[] = []
  public entranceAnimation = 'animate__slideInLeft'
  public exitAnimation = 'animate__backOutDown'

  public messageDuration = 3

  public addMessage(text: string) {
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

  public update(timeStep: number) {
    for (const message of this.messages) {
      message.update(timeStep)
    }
  }

  public addToWorld(world: World) {}

  public removeFromWorld(world: World) {}
}
