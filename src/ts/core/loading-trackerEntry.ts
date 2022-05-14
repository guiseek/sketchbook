export class LoadingTrackerEntry {
  public progress = 0
  public finished = false

  constructor(public path: string) {
    this.path = path
  }
}
