'use strict';

// GRAPH_OT_extrapolation_type

/**
 * FCurve extrapolation types, before its first keyframe and after its last keyframe.
 * @enum {number}
 * @readonly
*/
var Extrapolation = {
	/** Keeps a constant value. */
	CONSTANT: 0,
	/** Continues as straight lines. */
	LINEAR: 1,
};

module.exports = Extrapolation;
