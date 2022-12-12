#!/usr/bin/env python 

import os
import sys
import shutil

current_dir = os.getcwd()

print("Working in '%s' directory ..." % current_dir)

directories = [ name for name in os.listdir(current_dir) if os.path.isdir(os.path.join(current_dir, name)) ]

for filename in os.listdir(current_dir):
    for directory in directories:
        if filename == f"{directory}.session":
            session_file_path = os.path.join(current_dir, filename)
            dest_file_path = os.path.join(current_dir, directory)

            copy_dest = shutil.move(src=session_file_path, dst=dest_file_path)

            print(copy_dest)

print("- Done!")
sys.exit(0)
