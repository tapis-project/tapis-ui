import json
import os
import random
import sys
from argparse import ArgumentParser

def update_settings(folder_path, color, settings):
    path_colors = settings.get("folder-color.pathColors", [])
    updated = False
    for item in path_colors:
        if item["folderPath"] == folder_path:
            item["color"] = f"foldercolorizer.{color}"
            updated = True
            break
    if not updated:
        path_colors.append({"folderPath": folder_path, "color": f"foldercolorizer.{color}"})
    settings["folder-color.pathColors"] = path_colors

def add_folder_colors(base_path, recursive=False, level=1, settings=None):
    if settings is None:
        settings = {"folder-color.pathColors": []}
    colors=["Gold", "LightRed", "PureGold", "LightPink",
"LightSalmon", "LightSalmon2", "Coral", "LightMaroon", "Bronze",
"PaleTaupe", "Copper", "Buff", "MaximumYellowRed", "Tangerine", "CarrotOrange", "Ecru", "SpringGreen",
"LimeGreen", "ChartreuseGreen", "LawnGreen", "GreenYellow", "DarkGreen", "LightBlue",
"SteelBlue", "CadetBlue", "DeepSkyBlue", "DodgerBlue", "MediumSlateBlue", "SlateBlue", "DarkSlateBlue", "BlueViolet",
"Indigo", "DarkViolet", "DarkMagenta", "Purple", "DarkOrchid", "MediumOrchid", "Plum",
"Violet", "Magenta", "DeepPink", "MediumVioletRed", "PaleVioletRed", "Pink", "LightPink", "Salmon", "Tomato",
"SandyBrown", "RosyBrown", "Peru", "SaddleBrown", "Sienna", "Brown", "FireBrick", "OrangeRed",
"Tomato", "HotPink", "LightCoral",
"Azure",
"RawUmber", "LightSkyBlue",
"Lime", "SeaGreenMedium", "PurpleMedium", "Azure", "blue", "red", "green", "yellow", "orange", "pink",
"purple", "violet", "indigo", "brown", "crimson", "teal", "coral", "aquamarine", "turquoise", "firebrick",
"olive", "gold", "lime", "chocolate", "navy", "peach", "plum", "cyan", "maroon", "lavender", "ruby", "emerald"
    ]
    ## Removed - Usually because they're ugly/white
    # GrayishSilver Platinum MediumLightGray White LightGray SlateGray SlateGrayLight AntiqueWhite Ivory Seashell
    # OldLace gray NavajoWhite LavenderBlush Honeydew Beige beige FloralWhite Linen Snow GhostWhite LemonChiffon
    # Lavender gray Moccasin Alabaster Wheat silver LightBlue2 SkyBlue Bone Cornsilk PapayaWhip MistyRose
    # LightGoldenRodYellow PastelYellow LightYellow WhiteSmoke PureTan Tan SandyTan Isabelline IvoryBlack
    # Thistle AliceBlue LightSteelBlue
    if recursive:
        for root, dirs, _ in os.walk(base_path):
            if os.path.relpath(root, base_path).count(os.sep) < level:
                color = random.choice(colors)
                update_settings(root, color, settings)
    else:
        color = random.choice(colors)
        update_settings(base_path, color, settings)
    return settings

def main():
    parser = ArgumentParser(description="Add folder colors to VSCode settings.")
    parser.add_argument("folderpath", help="Path to the folder to colorize")
    parser.add_argument("--recursive", action="store_true", help="Recursively colorize subdirectories")
    parser.add_argument("--level", type=int, default=1, help="Depth of recursion")
    args = parser.parse_args()

    settings_file = "./.vscode/settings.json"
    if not os.path.exists(settings_file):
        settings = {"workbench.settings.useSplitJSON": False, "folder-color.pathColors": []}
    else:
        with open(settings_file, "r") as f:
            settings = json.load(f)

    settings = add_folder_colors(args.folderpath, args.recursive, args.level, settings)

    with open(settings_file, "w") as f:
        json.dump(settings, f, indent=2)

if __name__ == "__main__":
    main()
