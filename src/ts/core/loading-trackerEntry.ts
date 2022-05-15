export class LoadingTrackerEntry {
  progress = 0
  finished = false

  constructor(public path: string) {
    this.path = path
  }
}
