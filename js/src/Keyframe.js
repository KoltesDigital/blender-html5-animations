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
	 * @member {Interpolation}
	 */
	this.interpolation = data[6];

	/**
	 * Easing type.
	 * @member {Easing}
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

module.exports = Keyframe;
