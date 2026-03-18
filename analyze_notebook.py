import json
import copy

# Read the original notebook
with open(r'C:\Users\sanja\Downloads\Springboard.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

cells = nb['cells']
print(f'Total cells: {len(cells)}')

# Print all cells for inspection
for i, cell in enumerate(cells):
    ct = cell['cell_type']
    src = ''.join(cell['source']).replace('\n', ' ')
    print(f'Cell {i:2d} [{ct:8s}]: {src[:120]}')

print('\n--- TASK CELLS ---')
for i, cell in enumerate(cells):
    src = ''.join(cell['source'])
    if cell['cell_type'] == 'markdown' and '# Task' in src:
        print(f'TASK at cell {i}:')
        print(src[:300])
        print('---')

print('\n--- MILESTONE 2 MARKERS ---')
m2_keywords = ['Check and Handle Missing Values', 'Filling missing values', 
               'Handling Outliers', 'outlier', 'Evaluate the trained LSTM',
               'Evaluation of results', 'improvements']
for i, cell in enumerate(cells):
    src = ''.join(cell['source'])
    for k in m2_keywords:
        if k.lower() in src.lower():
            print(f'Cell {i} [{cell["cell_type"]}]: {src[:120].replace(chr(10), " ")}')
            break
