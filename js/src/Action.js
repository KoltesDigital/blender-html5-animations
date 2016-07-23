'use strict';

var glMatrix = require('glMatrix');
var mat4 = require('mat4');
var vec3 = require('vec3');

var FCurveArray = require('./FCurveArray');
var Marker = require('./Marker');
var RotationMode = require('./enums/RotationMode');

/**
 * @class An Action describes a keyframed animation.
 * @param data Data from Blender.
 */
function Action(data) {
	var self = this;

	/**
	 * Time of the first keyframe.
	 * @member {number}
	 */
	this.startTime = +Infinity;
	/**
	 * Time of the last keyframe.
	 * @member {number}
	 */
	this.endTime = -Infinity;

	function timeUpdater(fcurve) {
		if (fcurve) {
			self.startTime = Math.min(self.startTime, fcurve.keyframes[0].time);
			self.endTime = Math.max(self.endTime, fcurve.keyframes[fcurve.keyframes.length - 1].time);
		}
	}

	/**
	 * FCurves grouped by data path.
	 * @member {FCurveArray[]}
	 */
	this.paths = {};
	for (var groupName in data[0]) {
		var path = new FCurveArray(data[0][groupName]);
		this.paths[groupName] = path;

		path.forEach(timeUpdater);
	}

	/**
	 * Pose markers.
	 * @member {Marker[]}
	 */
	this.markers = data.length > 1 ? data[1].map(function(data) {
		return new Marker(data);
	}) : [];
}

/**
 * Calls a function for each marker in a time range.
 * @param {number} startTime Included start time
 * @param {number} endTime Excluded end time
 * @param {function} callback Callback
 */
Action.prototype.forEachMarker = function(startTime, endTime, callback) {
	return this.markers.forEach(function(marker, index) {
		if (marker.time >= startTime && marker.time < endTime)
			return callback(marker, index);
	});
};

var qmat = new glMatrix.ARRAY_TYPE(16);

/**
 * Computes the local to world matrix.
 * @param {mat4} out Receiving matrix
 * @param {number} time Evaluation time
 * @param {number} rotationMode Rotation mode
 */
Action.prototype.toWorld = function(out, time, rotationMode) {
	mat4.identity(out);

	var paths = this.paths;
	var angles;

	function computeEulerAngles() {
		angles = vec3.fromValues(0, 0, 0);
		[paths.rotation_euler, paths.delta_rotation_euler].forEach(function(path) {
			if (path)
				vec3.add(angles, angles, path.evaluate(time, FCurveArray.DefaultValues.ROTATION));
		});
	}

	var location = vec3.fromValues(0, 0, 0);
	[paths.location, paths.delta_location].forEach(function(path) {
		if (path)
			vec3.add(location, location, path.evaluate(time, FCurveArray.DefaultValues.LOCATION));
	});
	mat4.translate(out, out, location);

	switch (rotationMode) {
		case RotationMode.EULER_XYZ:
			computeEulerAngles();
			mat4.rotateZ(out, out, angles[2]);
			mat4.rotateY(out, out, angles[1]);
			mat4.rotateX(out, out, angles[0]);
			break;

		case RotationMode.EULER_XZY:
			computeEulerAngles();
			mat4.rotateY(out, out, angles[1]);
			mat4.rotateZ(out, out, angles[2]);
			mat4.rotateX(out, out, angles[0]);
			break;

		case RotationMode.EULER_YXZ:
			computeEulerAngles();
			mat4.rotateZ(out, out, angles[2]);
			mat4.rotateX(out, out, angles[0]);
			mat4.rotateY(out, out, angles[1]);
			break;

		case RotationMode.EULER_YZX:
			computeEulerAngles();
			mat4.rotateX(out, out, angles[0]);
			mat4.rotateZ(out, out, angles[2]);
			mat4.rotateY(out, out, angles[1]);
			break;

		case RotationMode.EULER_ZXY:
			computeEulerAngles();
			mat4.rotateY(out, out, angles[1]);
			mat4.rotateX(out, out, angles[0]);
			mat4.rotateZ(out, out, angles[2]);
			break;

		case RotationMode.EULER_ZYX:
			computeEulerAngles();
			mat4.rotateX(out, out, angles[0]);
			mat4.rotateY(out, out, angles[1]);
			mat4.rotateZ(out, out, angles[2]);
			break;

		case RotationMode.AXIS_ANGLE:
			// no delta
			if (paths.rotation_axis) {
				var vec = paths.rotation_axis.evaluate(time, FCurveArray.DefaultValues.ROTATION);
				mat4.rotate(out, out, vec[3], vec);
			}
			break;

		case RotationMode.QUATERNION:
			[paths.rotation_quaternion, paths.delta_rotation_quaternion].forEach(function(path) {
				if (path) {
					mat4.fromQuat(qmat, path.evaluate(time, FCurveArray.DefaultValues.ROTATION_QUATERNION));
					mat4.multiply(out, out, qmat);
				}
			});
			break;
	}

	var scale = vec3.fromValues(1, 1, 1);
	[paths.scale, paths.delta_scale].forEach(function(path) {
		if (path)
			vec3.multiply(scale, scale, path.evaluate(time, FCurveArray.DefaultValues.SCALE));
	});
	mat4.scale(out, out, scale);

	return out;
};

/**
 * Computes the world to local matrix.
 * @param {mat4} out Receiving matrix
 * @param {number} time Evaluation time
 * @param {number} rotationMode Rotation mode
 */
Action.prototype.toLocal = function(out, time, rotationMode) {
	this.toWorld(out, time, rotationMode);
	mat4.invert(out, out);
	return out;
};

/**
 * Applies a CSS3 Transform.
 * @param {element} element Receiving element
 * @param {number} time Evaluation time
 * @param {number} rotationMode Rotation mode
 */
Action.prototype.setElementTransform = function(element, time, rotationMode) {
	var mat = new glMatrix.ARRAY_TYPE(16);
	this.toWorld(mat, time, rotationMode);

	var transform = 'matrix3d(' + mat.join(',') + ')';

	['transform', 'mozTransform', 'oTransform', 'webkitTransform'].forEach(function(property) {
		element.style[property] = transform;
	});
};

module.exports = Action;
