'use strict';

var Action = require('./Action');

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
