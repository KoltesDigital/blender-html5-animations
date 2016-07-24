(function() {
	'use strict';

	if (typeof actions === 'undefined') {
		document.getElementById('build-missing').style.display = 'block';
		return;
	}

	var objectElement = document.getElementById('object');
	objectElement.style.display = 'block';

	var myActions = new blenderHTML5Animations.ActionLibrary(actions);
	var myAction = myActions['my-action'];
	var myActionTime = myAction.startTime;

	function markerCallback(marker) {
		var element = document.createElement('div');
		document.body.appendChild(element);
		element.textContent = marker.name;

		setTimeout(function() {
			element.remove();
		}, 500);
	}

	var startTime = Date.now();
	var lastTime = 0;

	function render() {
		requestAnimationFrame(render);

		var time = (Date.now() - startTime) / 1000;
		var dt = Math.min(time - lastTime, 0.1);
		lastTime = time;

		var newActionTime = myActionTime + dt;
		while (newActionTime >= myAction.endTime) {
			myAction.forEachMarker(myActionTime, myAction.endTime, markerCallback);
			myActionTime = 0;

			newActionTime -= (myAction.endTime - myAction.startTime);
		}

		myAction.forEachMarker(myActionTime, newActionTime, markerCallback);

		myActionTime = newActionTime;

		myAction.setElementTransform(objectElement, myActionTime, blenderHTML5Animations.RotationMode.EULER_XYZ);
	}

	requestAnimationFrame(render);
})();
