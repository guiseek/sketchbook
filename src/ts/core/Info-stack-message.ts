import { InfoStack } from './Info-stack'

export class InfoStackMessage {
  domElement: HTMLElement

  private customConsole: InfoStack
  private elapsedTime = 0
  private removalTriggered = false

  constructor(console: InfoStack, domElement: HTMLElement) {
    this.customConsole = console
    this.domElement = domElement
  }

  update(timeStep: number) {
    this.elapsedTime += timeStep

    if (
      this.elapsedTime > this.customConsole.messageDuration &&
      !this.removalTriggered
    ) {
      this.triggerRemoval()
    }
  }

  private triggerRemoval() {
    this.removalTriggered = true
    this.domElement.classList.remove(this.customConsole.entranceAnimation)
    this.domElement.classList.add(this.customConsole.exitAnimation)
    this.domElement.style.setProperty('--animate-duration', '1s')

    this.domElement.addEventListener('animationend', () => {
      this.domElement.parentNode.removeChild(this.domElement)
    })
  }
}
