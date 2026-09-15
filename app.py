import os
import sys
import runpy

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BSR_DIR = os.path.join(CURRENT_DIR, 'BSR')

if BSR_DIR not in sys.path:
    sys.path.insert(0, BSR_DIR)

os.chdir(BSR_DIR)

if __name__ == '__main__':
    runpy.run_path(os.path.join(BSR_DIR, 'app.py'), run_name='__main__')
