# Blender HTML5 Animations
# Copyright 2016 Jonathan Giroux
# MIT License

bl_info = {
    "name": "HTML5 Animations",
    "author": "Jonathan Giroux",
    "version": (0, 1, 0),
    "blender": (2, 70, 0),
    "location": "File > Export > HTML5 Animations",
    "description": "Export animation curves as CSS, JS, or JSON.",
    "warning": "",
    "wiki_url": "http://wiki.blender.org/index.php/Extensions:2.6/Py/Scripts/System/Addon_Registry",
    "category": "Import-Export",
}

import bpy
import json

from bpy.props import StringProperty, BoolProperty, EnumProperty
from bpy.types import Operator
from bpy_extras.io_utils import ExportHelper


Easing = bpy.types.GRAPH_OT_easing_type.bl_rna.properties['type'].enum_items
Extrapolation = bpy.types.GRAPH_OT_extrapolation_type.bl_rna.properties['type'].enum_items
Interpolation = bpy.types.GRAPH_OT_interpolation_type.bl_rna.properties['type'].enum_items
RotationModes = bpy.types.POSE_OT_rotation_mode_set.bl_rna.properties['type'].enum_items


def export_json():
    actions = []
    return {
        "actions": actions
    }


class Export(Operator, ExportHelper):
    """Export animation curves as CSS, JS, or JSON."""
    bl_idname = "html5_animations.export"
    bl_label = "Export HTML5 Animations"

    filename_ext = ".js"

    filter_glob = StringProperty(
        default="*.css;*.js;*.json",
        options={'HIDDEN'},
        maxlen=255,
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

        if self.format == 'CSS':
            self.report({'ERROR'}, "Not implemented")

        else:
            if self.js_json_pretty_formatting:
                indent = '  '
                separators = (', ', ': ')
            else:
                indent = None
                separators = (',', ':')

            obj = export_json()

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
