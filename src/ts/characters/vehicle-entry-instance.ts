import { VehicleSeat } from '../vehicles/vehicle-seat'
import { Object3D, Vector3 } from 'three'
import { Character } from './character'

export class VehicleEntryInstance {
  targetSeat: VehicleSeat
  entryPoint: Object3D
  wantsToDrive = false

  constructor(public character: Character) {}

  update(timeStep?: number): void
  update(timeStep: number) {
    const entryPointWorldPos = new Vector3()
    this.entryPoint.getWorldPosition(entryPointWorldPos)
    const viewVector = new Vector3().subVectors(
      entryPointWorldPos,
      this.character.position
    )
    this.character.setOrientation(viewVector)

    const heightDifference = viewVector.y
    viewVector.y = 0
    if (
      this.character.charState.canEnterVehicles &&
      viewVector.length() < 0.2 &&
      heightDifference < 2
    ) {
      this.character.enterVehicle(this.targetSeat, this.entryPoint)
    }
  }
}
