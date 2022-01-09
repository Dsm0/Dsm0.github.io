#!/bin/bash

# scrot_viewer/gen_scrot_json.py assets/selectedScrots > scrot_viewer/scrot_paths.js
cd scrot_viewer
./gen_scrot_json.py ../assets/selectedScrots > scrot_paths.js
git add scrot_paths.js
cd ..