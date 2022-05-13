export declare type VehicleAction = 'exitVehicle' | 'seat_switch' | 'view';
export declare type VehicleCarAction = VehicleAction | 'throttle' | 'reverse' | 'brake' | 'left' | 'right';
export declare type VehicleAirplaneAction = VehicleAction | 'throttle' | 'wheelBrake' | 'brake' | 'pitchUp' | 'pitchDown' | 'yawLeft' | 'yawRight' | 'rollLeft' | 'rollRight';
export declare type VehicleHelicopterAction = VehicleAction | 'ascend' | 'descend' | 'pitchUp' | 'pitchDown' | 'yawLeft' | 'yawRight' | 'rollLeft' | 'rollRight';
