export type VehicleAction = 'exitVehicle' | 'seat_switch' | 'view'

export type VehicleCarAction =
  | VehicleAction
  | 'throttle'
  | 'reverse'
  | 'brake'
  | 'left'
  | 'right'

export type VehicleAirplaneAction =
  | VehicleAction
  | 'throttle'
  | 'wheelBrake'
  | 'brake'
  | 'pitchUp'
  | 'pitchDown'
  | 'yawLeft'
  | 'yawRight'
  | 'rollLeft'
  | 'rollRight'

export type VehicleHelicopterAction =
  | VehicleAction
  | 'ascend'
  | 'descend'
  | 'pitchUp'
  | 'pitchDown'
  | 'yawLeft'
  | 'yawRight'
  | 'rollLeft'
  | 'rollRight'
