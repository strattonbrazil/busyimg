#!/usr/bin/env python
import sys
from lxml.html import soupparser
import collections
import io

print("paste areas below to convert to files in current directory...\n")

areasHTML = sys.stdin.read()

fileToAreas = collections.defaultdict(list)

for line in areasHTML.split("\n"):
    line = line.strip()

    if line.startswith("<area"):
        contents = contents = u"<areas>\n" + line + "</areas>\n"
        tree = soupparser.parse(io.StringIO(contents))
        areasRoot = [ child for child in tree.getroot() ][0]
        for child in areasRoot:
            fileToAreas[child.attrib["alt"]].append(line)

for fileKey, areas in fileToAreas.iteritems():
    fileName = "%s.areas" % fileKey

    print("creating file: %s" % fileName)

    with open(fileName, "w") as areasFile:
        areasFile.write("\n".join(areas))
