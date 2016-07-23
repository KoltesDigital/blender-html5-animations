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
