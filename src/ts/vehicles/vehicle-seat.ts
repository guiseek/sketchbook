import { IControllable } from '../interfaces/icontrollable'
import { Character } from '../characters/character'
import { SeatType } from '../enums/seat-type'
import { VehicleDoor } from './vehicle-door'
import { Object3D } from 'three'

export class VehicleSeat {
  vehicle: IControllable
  seatPointObject: Object3D

  // String of names of connected seats
  connectedSeatsString: string
  // Actual seatPoint objects, need to be identified
  // by parsing connectedSeatsString *after* all seats are imported
  connectedSeats: VehicleSeat[] = []

  type: SeatType
  entryPoints: Object3D[] = []
  door: VehicleDoor

  occupiedBy: Character = null

  constructor(vehicle: IControllable, object: THREE.Object3D, gltf: any) {
    this.vehicle = vehicle
    this.seatPointObject = object

    if (
      object.hasOwnProperty('userData') &&
      object.userData.hasOwnProperty('data')
    ) {
      if (object.userData.hasOwnProperty('door_object')) {
        this.door = new VehicleDoor(
          this,
          gltf.scene.getObjectByName(object.userData.door_object)
        )
      }

      if (object.userData.hasOwnProperty('entry_points')) {
        const entry_points = (object.userData.entry_points as string).split(';')
        for (const entry_point of entry_points) {
          if (entry_point.length > 0) {
            this.entryPoints.push(gltf.scene.getObjectByName(entry_point))
          }
        }
      } else {
        console.error(
          'Seat object ' + object + ' has no entry point reference property.'
        )
      }

      if (object.userData.hasOwnProperty('seat_type')) {
        this.type = object.userData.seat_type
      } else {
        console.error('Seat object ' + object + ' has no seat type property.')
      }

      if (object.userData.hasOwnProperty('connected_seats')) {
        this.connectedSeatsString = object.userData.connected_seats
      }
    }
  }

  update(timeStep: number) {
    if (this.door !== undefined) {
      this.door.update(timeStep)
    }
  }
}
