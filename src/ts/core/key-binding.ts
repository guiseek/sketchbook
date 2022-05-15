export class KeyBinding {
  eventCodes: string[]
  isPressed = false
  justPressed = false
  justReleased = false

  constructor(...code: string[]) {
    this.eventCodes = code
  }
}
