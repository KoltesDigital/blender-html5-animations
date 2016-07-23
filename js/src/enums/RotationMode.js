'use strict';

// POSE_OT_rotation_mode_set

/**
 * Object rotation modes.
 * @enum {number}
 * @readonly
*/
var RotationMode = {
	/** Reads from rotation_quaternion and delta_rotation_quaternion paths. */
	QUATERNION: 0,
	/** Reads from rotation_euler and delta_rotation_euler paths. */
	EULER_XYZ: 1,
	/** Reads from rotation_euler and delta_rotation_euler paths. */
	EULER_YXZ: 3,
	/** Reads from rotation_euler and delta_rotation_euler paths. */
	EULER_XZY: 2,
	/** Reads from rotation_euler and delta_rotation_euler paths. */
	EULER_ZXY: 5,
	/** Reads from rotation_euler and delta_rotation_euler paths. */
	EULER_YZX: 4,
	/** Reads from rotation_euler and delta_rotation_euler paths. */
	EULER_ZYX: 6,
	/** Reads from rotation_axis path. */
	AXIS_ANGLE: -1,
};

module.exports = RotationMode;
