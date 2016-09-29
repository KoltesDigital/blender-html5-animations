import bpy

bpy.ops.html5_animations.export('EXEC_DEFAULT',
	filepath="js/exported-animations.js",
	format='JS')
