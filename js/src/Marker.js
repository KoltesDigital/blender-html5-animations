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
