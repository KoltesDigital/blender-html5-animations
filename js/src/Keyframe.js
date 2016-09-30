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
