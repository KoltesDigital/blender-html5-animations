'use strict';

var FCurve = require('./FCurve');
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
