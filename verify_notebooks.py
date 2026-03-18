import os
import json

m1 = r'C:\Users\sanja\Downloads\Springboard_Milestone1.ipynb'
m2 = r'C:\Users\sanja\Downloads\Springboard_Milestone2.ipynb'

for path in [m1, m2]:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            nb = json.load(f)
        cells = nb['cells']
        print(f'{os.path.basename(path)}: {len(cells)} cells')
        for i, cell in enumerate(cells):
            src = ''.join(cell['source']).replace('\n', ' ')[:80]
            print(f'  Cell {i:2d} [{cell["cell_type"]:8s}]: {src}')
        print()
    else:
        print(f'NOT FOUND: {path}')
