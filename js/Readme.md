# Blender HTML5 Animations

Use animation curves from Blender.

## API

The entry point is the class *ActionLibrary*. Create an *ActionLibrary* with the data exported from Blender, and enjoy.

The library relies on [glMatrix](https://github.com/toji/gl-matrix) for math computations.

## Browser

Copy *blender-html5-animations.min.js* from the *dist* folder.

Copy *gl-matrix-min.js* from [glMatrix](https://github.com/toji/gl-matrix)'s *dist* folder.

```html
<script src="exported-data.js"></script>
<script src="gl-matrix-min.js"></script>
<script src="blender-html5-animations.min.js"></script>
<script>
	var myActionLibrary = new blenderHTML5Animations.ActionLibrary(exportedData);

	var value = myActionLibrary['my-action'].paths['location'].evaluate(time, blenderHTML5Animations.FCurveArray.DefaultValues.LOCATION);
</script>
```

## Node.js

	npm install --save blender-html5-animations

```js
var exportedData = require('./exported-data.json');
var blenderHTML5Animations = require('blender-html5-animations');

var myActionLibrary = new blenderHTML5Animations.ActionLibrary(exportedData);

var value = myActionLibrary['my-action'].paths['location'].evaluate(time, blenderHTML5Animations.FCurveArray.DefaultValues.LOCATION);
```
