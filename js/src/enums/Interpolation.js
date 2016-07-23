'use strict';

// GRAPH_OT_interpolation_type

/**
 * FCurve interpolation types, between two keyframes.
 * @enum {number}
 * @readonly
*/
var Interpolation = {
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

module.exports = Interpolation;
