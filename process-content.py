#!/usr/bin/env python
import sys
import os
import json
import io
from lxml.html import soupparser
from PIL import Image

if len(sys.argv) != 2:
    print("usage: ./process-content.py pregen/<CONTENT_DIRECTORY>")
    exit(1)

pregenContentPath = sys.argv[1]
if not os.path.isdir(pregenContentPath):
    print("error: %s is not a content directory" % pregenContentPath)
    print("usage: ./process-content pregen/<CONTENT_DIRECTORY>")
    exit(1)

metadataPath = os.path.join(pregenContentPath, "metadata.json")
if not os.path.isfile(metadataPath):
    print("error: %s does not have a metadata.json file" % pregenContentPath)
    exit(1)

def hyphensToCamelcase(s):
    return "".join(map(lambda p: p.capitalize(), s.strip(os.path.sep).split("-")))

def areasToTypescript(areas):
    typescript = "[\n"
    areaLines = []
    for area in areas:
        areaLines.append("        { name: \"%s\", shape: \"%s\", coords: \"%s\" }" % (area["name"], area["shape"], area["coords"]))
    typescript += ",\n".join(areaLines)

    typescript += "\n    ]\n"
    return typescript

contentName = pregenContentPath.split("pregen" + os.path.sep)[-1].strip(os.path.sep)

imageDir = "public/static/images"
contentImgPath = os.path.join(imageDir, "%s.jpg" % contentName)
thumbnailImgPath = os.path.join(imageDir, "%s_thumbnail.jpg" % contentName)
if not os.path.isfile(contentImgPath):
    print("error: %s content file does not exist" % contentImgPath)
    exit(1)

# create the thumbnail
im = Image.open(contentImgPath)
im.thumbnail((300, 168))
im.save(thumbnailImgPath, "JPEG")

# TODO: add other image-checking errors like resolution and file size maximum



with open(metadataPath) as f:
    metadata = json.load(f)

    className = hyphensToCamelcase(contentName)

    areas = []
    for areaPath in os.listdir(pregenContentPath):
        if areaPath.endswith(".areas"):    
            areaName = os.path.splitext(areaPath)[0]
            print("found areas file: " + areaPath)
            print("name: " + areaName)
            with open(os.path.join(pregenContentPath, areaPath)) as a:
                # super hacky way to parse HTML
                contents = u"<areas>\n" + a.read() + "</areas>\n"
                tree = soupparser.parse(io.StringIO(contents))
                areasRoot = [ child for child in tree.getroot() ][0]
                for child in areasRoot:
                    areas.append({
                        "name" : areaName,
                        "shape" : child.attrib["shape"],
                        "coords" : child.attrib["coords"]
                    })
                
    print(areas)

    typescript = """
import Metadata from '../Metadata'

export default {
    "title": "%s",
    "subpath": "%s",
    "creator": "%s",
    "creatorLink": "%s",
    "areas": %s
} as Metadata;
""" % (metadata["title"], contentName, metadata["creator"], metadata["creator-link"], areasToTypescript(areas))

    print(typescript)

    processedPath = "src/autogenerated"

    typescriptPath = os.path.join(processedPath, "%s.ts" % className)
    with open(typescriptPath, "w") as o:
        o.write(typescript)

        print("*** ADD THIS LINE TO 'src/MetadataStore.ts' ***\n")
        print("import %s from './autogenerated/%s';" % (className, className))

