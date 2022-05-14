import { query } from '../utils/query'

export class UIManager {
  public static setUserInterfaceVisible(value: boolean) {
    query('#ui-container').style.display = value ? 'block' : 'none'
  }

  public static setLoadingScreenVisible(value: boolean) {
    query('#loading-screen').style.display = value ? 'flex' : 'none'
  }

  public static setFPSVisible(value: boolean) {
    query('#statsBox').style.display = value ? 'block' : 'none'
    query('#dat-gui-container').style.top = value ? '48px' : '0px'
  }
}
