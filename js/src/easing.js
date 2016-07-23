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
	return -change * Math.cos(time / duration * Math.PI_2) + change + begin;
}

function sinusoidalEaseOut(time, begin, change, duration) {
	return change * Math.sin(time / duration * Math.PI_2) + begin;
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
