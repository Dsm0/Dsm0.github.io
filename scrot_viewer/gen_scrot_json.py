#!/usr/bin/env python

# taken from https://unix.stackexchange.com/a/164612

import os
import errno

def path_hierarchy(path):
    hierarchy = {
        'type': 'folder',
        'name': os.path.basename(path),
        'path': path,
    }

    try:
        hierarchy['children'] = [
            path_hierarchy(os.path.join(path, contents))
            for contents in [
                p for p in os.listdir(path) if p != ".DS_Store"]
        ]
    except OSError as e:
        if e.errno != errno.ENOTDIR:
            raise
        hierarchy['type'] = 'file'

    return hierarchy

if __name__ == '__main__':
    import json
    import sys

    try:
        directory = sys.argv[1]
    except IndexError:
        directory = "."

    print("scrot_paths = ") 

    print(json.dumps(path_hierarchy(directory), indent=2, sort_keys=True))