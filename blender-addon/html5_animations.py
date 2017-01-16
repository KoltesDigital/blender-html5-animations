# Blender HTML5 Animations
# Copyright 2016 Jonathan Giroux
# MIT License

bl_info = {
    "name": "HTML5 Animations",
    "author": "Jonathan Giroux",
    "version": (1, 0, 1),
    "blender": (2, 70, 0),
    "location": "File > Export > HTML5 Animations",
    "description": "Export animation curves as CSS, JS, or JSON.",
    "warning": "",
    "wiki_url": "http://wiki.blender.org/index.php/Extensions:2.6/Py/Scripts/System/HTML5_Animations",
    "category": "Import-Export",
}

import bpy
import json

from bpy.props import (
    BoolProperty,
    EnumProperty,
    StringProperty,
)
from bpy.types import Operator
from bpy_extras.io_utils import (
    ExportHelper,
    orientation_helper_factory,
)


Easings = bpy.types.GRAPH_OT_easing_type.bl_rna.properties['type'].enum_items
Extrapolations = bpy.types.GRAPH_OT_extrapolation_type.bl_rna.properties['type'].enum_items
Interpolations = bpy.types.GRAPH_OT_interpolation_type.bl_rna.properties['type'].enum_items


CoordinateSystemChangeDataPaths = {
    'location',
    'delta_location',
    'rotation_axis',
    'rotation_euler',
    'delta_rotation_euler',
    'rotation_quaternion',
    'delta_rotation_quaternion',
}

CoordinateSystemChangeAxisIndex = {
    'X': (0, 1),
    '-X': (0, -1),
    'Y': (1, 1),
    '-Y': (1, -1),
    'Z': (2, 1),
    '-Z': (2, -1),
}

def export_json(time_coefficient, coordinate_system_mapping):
    actions_obj = {}

    for action in bpy.data.actions:
        fcurves_obj = {}
        for fcurve in action.fcurves:
            if fcurve.data_path not in fcurves_obj:
                fcurves_obj[fcurve.data_path] = []
            fcurves_arr = fcurves_obj[fcurve.data_path]

            array_index = fcurve.array_index
            value_coefficient = 1
            if coordinate_system_mapping is not None:
                array_index, value_coefficient = coordinate_system_mapping(array_index)

            # Fill missing array indexes
            while len(fcurves_arr) <= array_index:
                fcurves_arr.append(0)

            keyframes_arr = []
            for keyframe_point in fcurve.keyframe_points:
                keyframe_arr = [
                    keyframe_point.co[0] * time_coefficient,
                    keyframe_point.co[1] * value_coefficient,
                    keyframe_point.handle_left[0] * time_coefficient,
                    keyframe_point.handle_left[1] * value_coefficient,
                    keyframe_point.handle_right[0] * time_coefficient,
                    keyframe_point.handle_right[1] * value_coefficient,
                    Interpolations[keyframe_point.interpolation].value,
                ]

                if keyframe_point.interpolation not in {'BEZIER', 'CONSTANT', 'LINEAR'}:
                    keyframe_arr.append(Easings[keyframe_point.easing].value)

                    if keyframe_point.interpolation == 'BACK':
                        keyframe_arr.append(keyframe_point.back)

                    if keyframe_point.interpolation == 'ELASTIC':
                        keyframe_arr.append(keyframe_point.amplitude)
                        keyframe_arr.append(keyframe_point.period)

                keyframes_arr.append(keyframe_arr)

            fcurve_obj = [
                keyframes_arr,
                Extrapolations[fcurve.extrapolation].value,
            ]

            fcurves_arr[array_index] = fcurve_obj

        markers_arr = []
        for marker in action.pose_markers:
            marker_arr = [
                marker.frame * time_coefficient,
                marker.name,
            ]
            markers_arr.append(marker_arr)

        action_arr = [
            fcurves_obj,
        ]

        if len(markers_arr) > 0:
            action_arr.append(markers_arr)

        actions_obj[action.name] = action_arr

    return actions_obj


HTML5AnimationsOrientationHelper = orientation_helper_factory("HTML5AnimationsOrientationHelper", axis_forward='-Z', axis_up='Y')


class Export(Operator, ExportHelper, HTML5AnimationsOrientationHelper):
    """Export animation curves as CSS, JS, or JSON."""
    bl_idname = "html5_animations.export"
    bl_label = "Export HTML5 Animations"

    filename_ext = ".js"

    filter_glob = StringProperty(
        default="*.css;*.js;*.json",
        options={'HIDDEN'},
        maxlen=255,
    )

    change_coordinate_system = BoolProperty(
        name="Change coordinate system",
        description="Affected data paths: location, rotation_axis, rotation_euler, rotation_quaternion, scale + delta_",
        default=False,
    )

    format = EnumProperty(
        name="Format",
        items=(
            ('CSS', "CSS", ""),
            ('JS', "JS", ""),
            ('JSON', "JSON", "")
        ),
        default='JS',
    )

    css_vendor_prefixes = EnumProperty(
        name="Vendor Prefixes",
        options={'ENUM_FLAG'},
        items=(
            ('NONE', "", ""),
            ('MOZ', "-moz-", ""),
            ('O', "-o-", ""),
            ('WEBKIT', "-webkit-", ""),
        ),
        default={'NONE'},
    )

    css_animation_prefix = StringProperty(
        name="Prefix",
        description="Animation name prefix.",
        default="",
    )

    js_json_pretty_formatting = BoolProperty(
        name="Pretty Formatting",
        description="If true, format with indents and line breaks.",
        default=False,
    )

    js_variable_name = StringProperty(
        name="Variable Name",
        description="It can be a complex path, e.g. 'foo.bar' (provided that foo is an object).",
        default="actions",
    )

    def draw(self, context):
        layout = self.layout

        layout.prop(self, "change_coordinate_system")
        if self.change_coordinate_system:
            layout.prop(self, "axis_forward")
            layout.prop(self, "axis_up")

        layout.separator()

        layout.prop(self, 'format', expand=True)

        if self.format == 'CSS':
            self.filename_ext = ".css"
            layout.prop(self, 'css_vendor_prefixes')
            layout.prop(self, 'css_animation_prefix')

        elif self.format == 'JS':
            self.filename_ext = ".js"
            layout.prop(self, 'js_json_pretty_formatting')
            layout.prop(self, 'js_variable_name')

        elif self.format == 'JSON':
            self.filename_ext = ".json"
            layout.prop(self, 'js_json_pretty_formatting')

    def execute(self, context):
        if not self.filepath:
            raise Exception("filepath not set")

        coordinate_system_mapping = None
        if self.change_coordinate_system:
            forward_index, forward_coefficient = CoordinateSystemChangeAxisIndex[self.axis_forward]
            up_index, up_coefficient = CoordinateSystemChangeAxisIndex[self.axis_up]
            if forward_index == up_index:
                raise Exception("Wrong coordinate system change")
            right_index = 3 - forward_index - up_index
            right_coefficient = 1 if (forward_index < up_index) == (forward_coefficient == up_coefficient) else -1

            def coordinate_system_mapping(array_index):
                if array_index == 0:
                    return (right_index, right_coefficient)
                if array_index == 1:
                    return (forward_index, forward_coefficient)
                if array_index == 2:
                    return (up_index, up_coefficient)
                return (array_index, 1)

        time_coefficient = context.scene.render.fps_base / context.scene.render.fps

        if self.format == 'CSS':
            raise Exception("Not implemented")

        else:
            if self.js_json_pretty_formatting:
                indent = '  '
                separators = (', ', ': ')
            else:
                indent = None
                separators = (',', ':')

            obj = export_json(time_coefficient, coordinate_system_mapping)

            if self.format == 'JS':
                with open(self.filepath, 'w', encoding='utf-8') as f:
                    f.write(self.js_variable_name + '=')
                    json.dump(obj, f, indent=indent, separators=separators)
                    f.write(';\n')
                return {'FINISHED'}

            elif self.format == 'JSON':
                with open(self.filepath, 'w', encoding='utf-8') as f:
                    json.dump(obj, f, indent=indent, separators=separators)
                return {'FINISHED'}


def menu_export(self, context):
    self.layout.operator(Export.bl_idname, text="HTML5 Animations (.css, .js, .json)")


def register():
    bpy.utils.register_module(__name__)
    bpy.types.INFO_MT_file_export.append(menu_export)


def unregister():
    bpy.utils.unregister_module(__name__)
    bpy.types.INFO_MT_file_export.remove(menu_export)


if __name__ == "__main__":
    register()
