'use strict';

var bezier = require('./bezier');
var easing = require('./easing');
var Keyframe = require('./Keyframe');

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
	return Math.abs(t1 - t2) <= FCurve.evaluationEpsilon;
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
