#!/usr/bin/env python
import sys
import os
import json
import io
from lxml.html import soupparser
from PIL import Image

MAX_THUMB_WIDTH = 300
MAX_THUMB_HEIGHT = 168

if len(sys.argv) < 2 or len(sys.argv) > 3:
    print("error: wrong number of arguments arguments")
    print("usage: ./create-thumbnail.py <image name> [optional crop setting]")
    exit(1)

imageFileName = sys.argv[1]
if sys.argv[1] == sys.argv[-1]:
    cropSetting = None
else:
    try:
        cropSetting = float(sys.argv[-1])
    except:
        print("crop setting must be a float between 0 and 1")
        exit(1)
    if cropSetting <= 0 or cropSetting > 1:
        print("error: crop setting out of range")
        print("crop setting must be a float between 0 and 1")
        exit(1)

imageDir = "public/static/images"
imagePath = os.path.join(imageDir, "%s.jpg" % imageFileName)

imageFile = sys.argv[1]
try:
    im = Image.open(imagePath)
except IOError:
    print("error: %s is not an image file" % imageFile)
    exit(1)

if cropSetting is not None: # crop to aspect ratio .crop((left, top, right, bottom))
    imAspect = im.width/im.height
    thumbnailAspect = MAX_THUMB_WIDTH/MAX_THUMB_HEIGHT
    if imAspect > thumbnailAspect: # wider than it should be
        trim = im.width - (im.height / thumbnailAspect)
        im = im.crop((trim/2,0,im.width-(trim/2),0))
    else: # taller than it should be
        trim = im.height - (im.width / thumbnailAspect)
        im = im.crop((0,trim/2,im.width,im.height-(trim/2)))

if cropSetting is not None and cropSetting != 1.0: #crop smaller to zoom in thumbnail
    heightTrim = im.height - (im.height * cropSetting)
    widthTrim = im.width - (im.width * cropSetting)
    im = im.crop((widthTrim/2,heightTrim/2,im.width-(widthTrim/2),im.height-(heightTrim/2)))

im.thumbnail((MAX_THUMB_WIDTH, MAX_THUMB_HEIGHT))
im.putalpha(1)
bg = Image.new("RGBA", (MAX_THUMB_WIDTH, MAX_THUMB_HEIGHT))
if im.width == MAX_THUMB_WIDTH: # wider than taller (bars top and bottom)
    bg.alpha_composite(im, (0, int(0.5 * (bg.height - im.height))))
else: # taller than wider (bars on sides)
    bg.alpha_composite(im, (int(0.5 * (bg.width - im.width)), 0))
thumbnailImgPath = os.path.join(imageDir, "%s_thumbnail.jpg" % imageFileName)
bg.convert("RGB").save(thumbnailImgPath, "JPEG")

    
