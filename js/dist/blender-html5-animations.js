/**
 * Blender HTML5 Animations 1.0.2
 * Copyright 2016 Jonathan Giroux
 * MIT licence
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("window"));
	else if(typeof define === 'function' && define.amd)
		define(["window"], factory);
	else if(typeof exports === 'object')
		exports["blenderHTML5Animations"] = factory(require("window"));
	else
		root["blenderHTML5Animations"] = factory(root["window"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports.Action = __webpack_require__(1);
	module.exports.ActionLibrary = __webpack_require__(9);
	module.exports.FCurve = __webpack_require__(4);
	module.exports.FCurveArray = __webpack_require__(3);
	module.exports.Keyframe = __webpack_require__(7);
	module.exports.Marker = __webpack_require__(8);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var glMatrixLib = __webpack_require__(2);

	var glMatrix = glMatrixLib.glMatrix;
	var mat4 = glMatrixLib.mat4;
	var vec3 = glMatrixLib.vec3;

	var FCurveArray = __webpack_require__(3);
	var Marker = __webpack_require__(8);

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

	// POSE_OT_rotation_mode_set

	/**
	 * Object rotation modes.
	 * @enum {number}
	 * @readonly
	*/
	Action.RotationMode = {
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
	 * @param {Action.RotationMode} rotationMode Rotation mode
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
			case Action.RotationMode.QUATERNION:
				[paths.rotation_quaternion, paths.delta_rotation_quaternion].forEach(function(path) {
					if (path) {
						mat4.fromQuat(qmat, path.evaluate(time, FCurveArray.DefaultValues.ROTATION_QUATERNION));
						mat4.multiply(out, out, qmat);
					}
				});
				break;

			case Action.RotationMode.EULER_XYZ:
				computeEulerAngles();
				mat4.rotateZ(out, out, angles[2]);
				mat4.rotateY(out, out, angles[1]);
				mat4.rotateX(out, out, angles[0]);
				break;

			case Action.RotationMode.EULER_XZY:
				computeEulerAngles();
				mat4.rotateY(out, out, angles[1]);
				mat4.rotateZ(out, out, angles[2]);
				mat4.rotateX(out, out, angles[0]);
				break;

			case Action.RotationMode.EULER_YXZ:
				computeEulerAngles();
				mat4.rotateZ(out, out, angles[2]);
				mat4.rotateX(out, out, angles[0]);
				mat4.rotateY(out, out, angles[1]);
				break;

			case Action.RotationMode.EULER_YZX:
				computeEulerAngles();
				mat4.rotateX(out, out, angles[0]);
				mat4.rotateZ(out, out, angles[2]);
				mat4.rotateY(out, out, angles[1]);
				break;

			case Action.RotationMode.EULER_ZXY:
				computeEulerAngles();
				mat4.rotateY(out, out, angles[1]);
				mat4.rotateX(out, out, angles[0]);
				mat4.rotateZ(out, out, angles[2]);
				break;

			case Action.RotationMode.EULER_ZYX:
				computeEulerAngles();
				mat4.rotateX(out, out, angles[0]);
				mat4.rotateY(out, out, angles[1]);
				mat4.rotateZ(out, out, angles[2]);
				break;

			case Action.RotationMode.AXIS_ANGLE:
				// no delta
				if (paths.rotation_axis) {
					var vec = paths.rotation_axis.evaluate(time, FCurveArray.DefaultValues.ROTATION);
					mat4.rotate(out, out, vec[3], vec);
				}
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
	 * @param {Action.RotationMode} rotationMode Rotation mode
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
	 * @param {Action.RotationMode} rotationMode Rotation mode
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


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var FCurve = __webpack_require__(4);
	/**
	 * Provides a value when a FCurve does not exist.
	 * @callback FCurveArray~DefaultValues
	 * @param {number} index Array index
	 * @param {number} time Evaluation time
	 * @return {number} Value
	 */

	/**
	 * @class A FCurveArray is an array of FCurves.
	 * @param data Data from Blender.
	 */
	function FCurveArray(data) {
		var array = data.map(function(data) {
			return data && new FCurve(data);
		});

		/**
		 * Evaluates the array.
		 * @method FCurveArray~evaluate
		 * @param {number} time Evaluation time.
		 * @param {FCurveArray~DefaultValues} defaultValues In case a FCurve does not exist.
		 * @return {number[]}
		 */
		array.evaluate = function(time, defaultValues) {
			return array.map(function(fcurve, index) {
				return fcurve ? fcurve.evaluate(time) : defaultValues(index, time);
			});
		};

		return array;
	}

	/**
	 * Built-in DefaultValues functions.
	 * @enum {FCurveArray~DefaultValues}
	 * @readonly
	*/
	FCurveArray.DefaultValues = {
		/** Returns 0. */
		LOCATION: function() {
			return 0;
		},
		/** Returns 0. */
		ROTATION: function() {
			return 0;
		},
		/** Returns 0 for XYZ and 1 for W. */
		ROTATION_QUATERNION: function(index) {
			return (index === 3 ? 1 : 0);
		},
		/** Returns 1. */
		SCALE: function() {
			return 1;
		},
	};

	module.exports = FCurveArray;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var bezier = __webpack_require__(5);
	var easing = __webpack_require__(6);
	var Keyframe = __webpack_require__(7);

	/**
	 * @class A FCurveArray is an array of FCurves.
	 * @param data Data from Blender.
	 */
	function FCurve(data) {
		/**
		 * Keyframes.
		 * @member {Keyframe[]}
		 */
		this.keyframes = data[0].map(function(data) {
			return new Keyframe(data);
		});

		/**
		 * Extrapolation type.
		 * @member {FCurve.Extrapolation}
		 */
		this.extrapolation = data[1];
	}

	// GRAPH_OT_extrapolation_type

	/**
	 * FCurve extrapolation types, before its first keyframe and after its last keyframe.
	 * @enum {number}
	 * @readonly
	*/
	FCurve.Extrapolation = {
		/** Keeps a constant value. */
		CONSTANT: 0,
		/** Continues as straight lines. */
		LINEAR: 1,
	};

	/**
	 * When evaluation time differs less than epsilon from a keyframe, snaps to that keyframe.
	 * @type {number}
	 */
	FCurve.evaluationTimeEpsilon = 0.0001;

	function areTimesAlmostEqual(t1, t2) {
		return Math.abs(t1 - t2) <= FCurve.evaluationTimeEpsilon;
	}

	/**
	 * Evaluates the curve.
	 * @param {number} time Evaluation time.
	 * @return {number} Value.
	 */
	FCurve.prototype.evaluate = function(time) {
		var leftIndex = 0;
		var leftKeyframe = this.keyframes[leftIndex];

		if (areTimesAlmostEqual(time, leftKeyframe.time))
		{
			return leftKeyframe.value;
		}

		if (time <= leftKeyframe.time) {
			switch (this.extrapolation) {
				case FCurve.Extrapolation.LINEAR:
					return leftKeyframe.value + (leftKeyframe.leftValue - leftKeyframe.value) * (time - leftKeyframe.time) / (leftKeyframe.leftTime - leftKeyframe.time);
				default:
					return leftKeyframe.value;
			}
		}

		var rightIndex = this.keyframes.length - 1;
		var rightKeyframe = this.keyframes[rightIndex];

		if (areTimesAlmostEqual(time, rightKeyframe.time))
		{
			return rightKeyframe.value;
		}

		if (time >= rightKeyframe.time) {
			switch (this.extrapolation) {
				case FCurve.Extrapolation.LINEAR:
					return rightKeyframe.value + (rightKeyframe.rightValue - rightKeyframe.value) * (time - rightKeyframe.time) / (rightKeyframe.rightTime - rightKeyframe.time);
				default:
					return rightKeyframe.value;
			}
		}

		while (rightIndex - leftIndex > 1) {
			var index = ((leftIndex + rightIndex) / 2) | 0;
			if (this.keyframes[index].time >= time)
				rightIndex = index;
			else
				leftIndex = index;
		}

		leftKeyframe = this.keyframes[leftIndex];
		if (areTimesAlmostEqual(time, leftKeyframe.time))
		{
			return leftKeyframe.value;
		}

		rightKeyframe = this.keyframes[rightIndex];
		if (areTimesAlmostEqual(time, rightKeyframe.time))
		{
			return rightKeyframe.value;
		}

		var relTime = time - leftKeyframe.time;
		var begin = leftKeyframe.value;
		var duration = rightKeyframe.time - leftKeyframe.time;
		var change = rightKeyframe.value - leftKeyframe.value;

		switch (leftKeyframe.interpolation) {
			case Keyframe.Interpolation.BACK:
				switch (leftKeyframe.easing) {
					case Keyframe.Easing.IN:
						return easing.backEaseIn(relTime, begin, change, duration, leftKeyframe.overshoot);
					case Keyframe.Easing.IN_OUT:
						return easing.backEaseInOut(relTime, begin, change, duration, leftKeyframe.overshoot);
					default:
						return easing.backEaseOut(relTime, begin, change, duration, leftKeyframe.overshoot);
				}
				break;

			case Keyframe.Interpolation.BEZIER:
				return bezier(time, leftKeyframe, rightKeyframe);

			case Keyframe.Interpolation.BOUNCE:
				switch (leftKeyframe.easing) {
					case Keyframe.Easing.IN:
						return easing.bounceEaseIn(relTime, begin, change, duration);
					case Keyframe.Easing.IN_OUT:
						return easing.bounceEaseInOut(relTime, begin, change, duration);
					default:
						return easing.bounceEaseOut(relTime, begin, change, duration);
				}
				break;

			case Keyframe.Interpolation.CIRCULAR:
				switch (leftKeyframe.easing) {
					case Keyframe.Easing.OUT:
						return easing.circularEaseOut(relTime, begin, change, duration);
					case Keyframe.Easing.IN_OUT:
						return easing.circularEaseInOut(relTime, begin, change, duration);
					default:
						return easing.circularEaseIn(relTime, begin, change, duration);
				}
				break;

			case Keyframe.Interpolation.CUBIC:
				switch (leftKeyframe.easing) {
					case Keyframe.Easing.OUT:
						return easing.cubicEaseOut(relTime, begin, change, duration);
					case Keyframe.Easing.IN_OUT:
						return easing.cubicEaseInOut(relTime, begin, change, duration);
					default:
						return easing.cubicEaseIn(relTime, begin, change, duration);
				}
				break;

			case Keyframe.Interpolation.ELASTIC:
				switch (leftKeyframe.easing) {
					case Keyframe.Easing.IN:
						return easing.elasticEaseIn(relTime, begin, change, duration);
					case Keyframe.Easing.IN_OUT:
						return easing.elasticEaseInOut(relTime, begin, change, duration);
					default:
						return easing.elasticEaseOut(relTime, begin, change, duration, leftKeyframe.amplitude, leftKeyframe.period);
				}
				break;

			case Keyframe.Interpolation.EXPONENTIAL:
				switch (leftKeyframe.easing) {
					case Keyframe.Easing.OUT:
						return easing.exponentialEaseOut(relTime, begin, change, duration);
					case Keyframe.Keyframe.Easing.IN_OUT:
						return easing.exponentialEaseInOut(relTime, begin, change, duration);
					default:
						return easing.exponentialEaseIn(relTime, begin, change, duration);
				}
				break;

			case Keyframe.Interpolation.LINEAR:
				return easing.linear(relTime, begin, change, duration);

			case Keyframe.Interpolation.QUADRATIC:
				switch (leftKeyframe.easing) {
					case Keyframe.Easing.OUT:
						return easing.quadraticEaseOut(relTime, begin, change, duration);
					case Keyframe.Easing.IN_OUT:
						return easing.quadraticEaseInOut(relTime, begin, change, duration);
					default:
						return easing.quadraticEaseIn(relTime, begin, change, duration);
				}
				break;

			case Keyframe.Interpolation.QUARTIC:
				switch (leftKeyframe.easing) {
					case Keyframe.Easing.OUT:
						return easing.quarticEaseOut(relTime, begin, change, duration);
					case Keyframe.Easing.IN_OUT:
						return easing.quarticEaseInOut(relTime, begin, change, duration);
					default:
						return easing.quarticEaseIn(relTime, begin, change, duration);
				}
				break;

			case Keyframe.Interpolation.QUINTIC:
				switch (leftKeyframe.easing) {
					case Keyframe.Easing.OUT:
						return easing.quinticEaseOut(relTime, begin, change, duration);
					case Keyframe.Easing.IN_OUT:
						return easing.quinticEaseInOut(relTime, begin, change, duration);
					default:
						return easing.quinticEaseIn(relTime, begin, change, duration);
				}
				break;

			case Keyframe.Interpolation.SINUSOIDAL:
				switch (leftKeyframe.easing) {
					case Keyframe.Easing.OUT:
						return easing.sinusoidalEaseOut(relTime, begin, change, duration);
					case Keyframe.Easing.IN_OUT:
						return easing.sinusoidalEaseInOut(relTime, begin, change, duration);
					default:
						return easing.sinusoidalEaseIn(relTime, begin, change, duration);
				}
				break;

			default:
				return begin;
		}
	};

	module.exports = FCurve;


/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	function bezierInterpolation(A, B, C, D, t) {
		var T = 1 - t;
		return T*T*T*A + 3*T*T*t*B + 3*T*t*t*C + t*t*t*D;
	}

	function bezier(time, leftKeyframe, rightKeyframe) {
		var aT = leftKeyframe.time;
		var aV = leftKeyframe.value;
		var bT = leftKeyframe.rightTime;
		var bV = leftKeyframe.rightValue;
		var cT = rightKeyframe.leftTime;
		var cV = rightKeyframe.leftValue;
		var dT = rightKeyframe.time;
		var dV = rightKeyframe.value;

		var leftDeltaTime = bT - aT;
		var rightDeltaTime = dT - cT;
		var duration = dT - aT;

		if (leftDeltaTime + rightDeltaTime > duration) {
			var leftDeltaValue = bV - aV;
			var rightDeltaValue = dV - cV;

			var factor = duration / (leftDeltaTime + rightDeltaTime);

			bT = aT + factor * leftDeltaTime;
			bV = aV + factor * leftDeltaValue;

			cT = dT - factor * rightDeltaTime;
			cV = dV - factor * rightDeltaValue;
		}

		var uLeft = 0, uRight = 1;
		var u, T;
		do {
			u = (uLeft + uRight) / 2;
			T = bezierInterpolation(aT, bT, cT, dT, u);
			if (T > time)
				uRight = u;
			else
				uLeft = u;
		} while (Math.abs(T - time) > 0.01);

		return bezierInterpolation(aV, bV, cV, dV, u);
	}

	module.exports = bezier;


/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	// easing.c

	function backEaseIn(time, begin, change, duration, overshoot) {
		time /= duration;
		return change * time * time * ((overshoot + 1) * time - overshoot) + begin;
	}

	function backEaseOut(time, begin, change, duration, overshoot) {
		time = time / duration - 1;
		return change * (time * time * ((overshoot + 1) * time + overshoot) + 1) + begin;
	}

	function backEaseInOut(time, begin, change, duration, overshoot) {
		overshoot *= 1.525;
		if ((time /= duration / 2) < 1) {
			return change / 2 * (time * time * ((overshoot + 1) * time - overshoot)) + begin;
		}
		time -= 2.0;
		return change / 2 * (time * time * ((overshoot + 1) * time + overshoot) + 2) + begin;
	}

	function bounceEaseOut(time, begin, change, duration) {
		time /= duration;
		if (time < (1 / 2.75)) {
			return change * (7.5625 * time * time) + begin;
		}
		else if (time < (2 / 2.75)) {
			time -= (1.5 / 2.75);
			return change * ((7.5625 * time) * time + 0.75) + begin;
		}
		else if (time < (2.5 / 2.75)) {
			time -= (2.25 / 2.75);
			return change * ((7.5625 * time) * time + 0.9375) + begin;
		}
		else {
			time -= (2.625 / 2.75);
			return change * ((7.5625 * time) * time + 0.984375) + begin;
		}
	}

	function bounceEaseIn(time, begin, change, duration) {
		return change - bounceEaseOut(duration - time, 0, change, duration) + begin;
	}

	function bounceEaseInOut(time, begin, change, duration) {
		if (time < duration / 2)
			return bounceEaseIn(time * 2, 0, change, duration) * 0.5 + begin;
		else
			return bounceEaseOut(time * 2 - duration, 0, change, duration) * 0.5 + change * 0.5 + begin;
	}

	function circularEaseIn(time, begin, change, duration) {
		time /= duration;
		return -change * (Math.sqrt(1 - time * time) - 1) + begin;
	}

	function circularEaseOut(time, begin, change, duration) {
		time = time / duration - 1;
		return change * Math.sqrt(1 - time * time) + begin;
	}

	function circularEaseInOut(time, begin, change, duration) {
		if ((time /= duration / 2) < 1.0)
			return -change / 2 * (Math.sqrt(1 - time * time) - 1) + begin;
		time -= 2.0;
		return change / 2 * (Math.sqrt(1 - time * time) + 1) + begin;
	}

	function cubicEaseIn(time, begin, change, duration) {
		time /= duration;
		return change * time * time * time + begin;
	}

	function cubicEaseOut(time, begin, change, duration) {
		time = time / duration - 1;
		return change * (time * time * time + 1) + begin;
	}

	function cubicEaseInOut(time, begin, change, duration) {
		if ((time /= duration / 2) < 1.0)
			return change / 2 * time * time * time + begin;
		time -= 2.0;
		return change / 2 * (time * time * time + 2) + begin;
	}

	function elasticBlend(time, change, duration, amplitude, s, f) {
		if (change) {
			var t = Math.abs(s);
			if (amplitude) {
				f *= amplitude / Math.abs(change);
			}
			else {
				f = 0;
			}

			var td = Math.abs(time * duration);
			if (td < t) {
				var l = td / t;
				f = (f * l) + (1 - l);
			}
		}

		return f;
	}

	function elasticEaseIn(time, begin, change, duration, amplitude, period) {
		var s;
		var f = 1.0;

		if (time <= 0.0)
			return begin;
		if ((time /= duration) >= 1.0)
			return begin + change;
		time -= 1.0;
		if (!period)
			period = duration * 0.3;
		if (!amplitude || amplitude < Math.abs(change)) {
			s = period / 4;
			f = elasticBlend(time, change, duration, amplitude, s, f);
			amplitude = change;
		}
		else
			s = period / (2 * Math.PI) * Math.asin(change / amplitude);

		return (-f * (amplitude * Math.pow(2, 10 * time) * Math.sin((time * duration - s) * (2 * Math.PI) / period))) + begin;
	}

	function elasticEaseOut(time, begin, change, duration, amplitude, period) {
		var s;
		var f = 1;

		if (time <= 0)
			return begin;
		if ((time /= duration) >= 1.0)
			return begin + change;
		time = -time;
		if (!period)
			period = duration * 0.3;
		if (!amplitude || amplitude < Math.abs(change)) {
			s = period / 4;
			f = elasticBlend(time, change, duration, amplitude, s, f);
			amplitude = change;
		} else
			s = period / (2 * Math.PI) * Math.asin(change / amplitude);

		return (f * (amplitude * Math.pow(2, 10 * time) * Math.sin((time * duration - s) * (2 * Math.PI) / period))) + change + begin;
	}

	function elasticEaseInOut(time, begin, change, duration, amplitude, period) {
		var s;
		var f = 1.0;

		if (time <= 0.0)
			return begin;
		if ((time /= duration / 2) >= 2.0)
			return begin + change;
		time -= 1.0;
		if (!period)
			period = duration * (0.3 * 1.5);
		if (!amplitude || amplitude < Math.abs(change)) {
			s = period / 4;
			f = elasticBlend(time, change, duration, amplitude, s, f);
			amplitude = change;
		}
		else
			s = period / (2 * Math.PI) * Math.asin(change / amplitude);

		if (time < 0.0) {
			f *= -0.5;
			return  (f * (amplitude * Math.pow(2, 10 * time) * Math.sin((time * duration - s) * (2 * Math.PI) / period))) + begin;
		}
		else {
			time = -time;
			f *= 0.5;
			return (f * (amplitude * Math.pow(2, 10 * time) * Math.sin((time * duration - s) * (2 * Math.PI) / period))) + change + begin;
		}
	}

	function exponentialEaseIn(time, begin, change, duration) {
		return (time <= 0.0) ? begin : change * Math.pow(2, 10 * (time / duration - 1)) + begin;
	}

	function exponentialEaseOut(time, begin, change, duration) {
		return (time >= duration) ? begin + change : change * (-Math.pow(2, -10 * time / duration) + 1) + begin;
	}

	function exponentialEaseInOut(time, begin, change, duration) {
		if (time <= 0.0)
			return begin;
		if (time >= duration)
			return begin + change;
		if ((time /= duration / 2) < 1)
			return change / 2 * Math.pow(2, 10 * (time - 1)) + begin;
		time -= 1.0;
		return change / 2 * (-Math.pow(2, -10 * time) + 2) + begin;
	}

	function linear(time, begin, change, duration) {
		return change * time / duration + begin;
	}

	function quadraticEaseIn(time, begin, change, duration) {
		time /= duration;
		return change * time * time + begin;
	}

	function quadraticEaseOut(time, begin, change, duration) {
		time /= duration;
		return -change * time * (time - 2) + begin;
	}

	function quadraticEaseInOut(time, begin, change, duration) {
		if ((time /= duration / 2) < 1.0)
			return change / 2 * time * time + begin;
		time -= 1.0;
		return -change / 2 * (time * (time - 2) - 1) + begin;
	}


	function quarticEaseIn(time, begin, change, duration) {
		time /= duration;
		return change * time * time * time * time + begin;
	}

	function quarticEaseOut(time, begin, change, duration) {
		time = time / duration - 1;
		return -change * (time * time * time * time - 1) + begin;
	}

	function quarticEaseInOut(time, begin, change, duration) {
		if ((time /= duration / 2) < 1.0)
			return change / 2 * time * time * time * time + begin;
		time -= 2.0;
		return -change / 2 * ( time * time * time * time - 2) + begin;
	}

	function quinticEaseIn(time, begin, change, duration) {
		time /= duration;
		return change * time * time * time * time * time + begin;
	}

	function quinticEaseOut(time, begin, change, duration) {
		time = time / duration - 1;
		return change * (time * time * time * time * time + 1) + begin;
	}

	function quinticEaseInOut(time, begin, change, duration) {
		if ((time /= duration / 2) < 1.0)
			return change / 2 * time * time * time * time * time + begin;
		time -= 2.0;
		return change / 2 * (time * time * time * time * time + 2) + begin;
	}

	function sinusoidalEaseIn(time, begin, change, duration) {
		return -change * Math.cos(time / duration * Math.PI / 2) + change + begin;
	}

	function sinusoidalEaseOut(time, begin, change, duration) {
		return change * Math.sin(time / duration * Math.PI / 2) + begin;
	}

	function sinusoidalEaseInOut(time, begin, change, duration) {
		return -change / 2 * (Math.cos(Math.PI * time / duration) - 1) + begin;
	}

	module.exports.backEaseIn = backEaseIn;
	module.exports.backEaseOut = backEaseOut;
	module.exports.backEaseInOut = backEaseInOut;
	module.exports.bounceEaseOut = bounceEaseOut;
	module.exports.bounceEaseIn = bounceEaseIn;
	module.exports.bounceEaseInOut = bounceEaseInOut;
	module.exports.circularEaseIn = circularEaseIn;
	module.exports.circularEaseOut = circularEaseOut;
	module.exports.circularEaseInOut = circularEaseInOut;
	module.exports.cubicEaseIn = cubicEaseIn;
	module.exports.cubicEaseOut = cubicEaseOut;
	module.exports.cubicEaseInOut = cubicEaseInOut;
	module.exports.elasticEaseIn = elasticEaseIn;
	module.exports.elasticEaseOut = elasticEaseOut;
	module.exports.elasticEaseInOut = elasticEaseInOut;
	module.exports.exponentialEaseIn = exponentialEaseIn;
	module.exports.exponentialEaseOut = exponentialEaseOut;
	module.exports.exponentialEaseInOut = exponentialEaseInOut;
	module.exports.linear = linear;
	module.exports.quadraticEaseIn = quadraticEaseIn;
	module.exports.quadraticEaseOut = quadraticEaseOut;
	module.exports.quadraticEaseInOut = quadraticEaseInOut;
	module.exports.quarticEaseIn = quarticEaseIn;
	module.exports.quarticEaseOut = quarticEaseOut;
	module.exports.quarticEaseInOut = quarticEaseInOut;
	module.exports.quinticEaseIn = quinticEaseIn;
	module.exports.quinticEaseOut = quinticEaseOut;
	module.exports.quinticEaseInOut = quinticEaseInOut;
	module.exports.sinusoidalEaseIn = sinusoidalEaseIn;
	module.exports.sinusoidalEaseOut = sinusoidalEaseOut;
	module.exports.sinusoidalEaseInOut = sinusoidalEaseInOut;


/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @class A Keyframe is a value in time with control handles.
	 * @param data Data from Blender.
	 */
	function Keyframe(data) {
		/**
		 * Time.
		 * @member {number}
		 */
		this.time = data[0];

		/**
		 * Value.
		 * @member {number}
		 */
		this.value = data[1];

		/**
		 * Left handle's time.
		 * @member {number}
		 */
		this.leftTime = data[2];

		/**
		 * Left handle's value.
		 * @member {number}
		 */
		this.leftValue = data[3];

		/**
		 * Right handle's time.
		 * @member {number}
		 */
		this.rightTime = data[4];

		/**
		 * Right handle's value.
		 * @member {number}
		 */
		this.rightValue = data[5];

		/**
		 * Interpolation type.
		 * @member {Keyframe.Interpolation}
		 */
		this.interpolation = data[6];

		/**
		 * Easing type.
		 * @member {Keyframe.Easing}
		 */
		this.easing = data[7];

		/**
		 * Overshoot (for back interpolation).
		 * @member {number}
		 */
		this.overshoot = data[8];

		/**
		 * Amplitude (for elastic interpolation).
		 * @member {number}
		 */
		this.amplitude = data[8];

		/**
		 * Period (for elastic interpolation).
		 * @member {number}
		 */
		this.period = data[9];
	}

	// GRAPH_OT_easing_type

	/**
	 * FCurve easing types.
	 * @enum {number}
	 * @readonly
	*/
	Keyframe.Easing = {
		/** Automatic easing. */
		AUTO: 0,
		/** Starts slow. */
		IN: 1,
		/** Ends slow. */
		OUT: 2,
		/** Starts and ends slow. */
		IN_OUT: 3,
	};

	// GRAPH_OT_interpolation_type

	/**
	 * FCurve interpolation types, between two keyframes.
	 * @enum {number}
	 * @readonly
	*/
	Keyframe.Interpolation = {
		/** No interpolation, value gets held. */
		CONSTANT: 0,
		/** Straight-line interpolation. */
		LINEAR: 1,
		/** Smooth interpolation. */
		BEZIER: 2,
		/** Cubic easing with overshoot and settle. */
		BACK: 3,
		/** Exponentially decaying parabolic bounce. */
		BOUNCE: 4,
		/** Circular easing. */
		CIRCULAR: 5,
		/** Cubic easing. */
		CUBIC: 6,
		/** Exponentially decaying sine wave. */
		ELASTIC: 7,
		/** Exponential easing. */
		EXPONENTIAL: 8,
		/** Quadratic easing. */
		QUADRATIC: 9,
		/** Quartic easing. */
		QUARTIC: 10,
		/** Quintic easing. */
		QUINTIC: 11,
		/** Sinusoidal easing. */
		SINUSOIDAL: 12,
	};

	module.exports = Keyframe;


/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @class A Marker is a generic information in time.
	 * @param data Data from Blender
	 */
	function Marker(data) {
		/**
		 * Time.
		 * @member {number}
		 */
		this.time = data[0];

		/**
		 * Name.
		 * @member {string}
		 */
		this.name = data[1];
	}

	module.exports = Marker;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Action = __webpack_require__(1);

	/**
	 * @class An ActionLibrary is an object of Actions.
	 * @param data Data from Blender.
	 */
	function ActionLibrary(data) {
		for (var actionName in data) {
			this[actionName] = new Action(data[actionName]);
		}
	}

	module.exports = ActionLibrary;


/***/ }
/******/ ])
});
;