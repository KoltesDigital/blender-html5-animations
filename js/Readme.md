# Blender HTML5 Animations

Use animation curves from Blender.

## API

The entry point is the class *ActionLibrary*. Create an *ActionLibrary* with the data exported from Blender, and enjoy.

## Browser

Copy *blender-html5-animations.min.js* in the *dist* folder.

```html
<script src="exported-data.js"></script>
<script src="blender-html5-animations.min.js"></script>
<script>
	var myActionLibrary = new ActionLibrary(exportedData);

	var value = myActionLibrary['my-action'].paths['location'].evaluate(time, FCurveArray.DefaultValues.LOCATION);
</script>
```

## Node.js

	npm install --save blender-html5-animations

```js
var exportedData = require('./exported-data.json');
var blenderHTML5Animations = require('blender-html5-animations');

var myActionLibrary = new blenderHTML5Animations.ActionLibrary(eexportedData);

var value = myActionLibrary['my-action'].paths['location'].evaluate(time, blenderHTML5Animations.FCurveArray.DefaultValues.LOCATION);
```
