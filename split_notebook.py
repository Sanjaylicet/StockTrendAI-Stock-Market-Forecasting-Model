import json
import copy

# Read the original notebook
with open(r'C:\Users\sanja\Downloads\Springboard.ipynb', 'r', encoding='utf-8') as f:
    nb = json.load(f)

cells = nb['cells']
total = len(cells)
print(f'Total cells: {total}')

# Find the exact split point
# Milestone 2 starts at the cell with "# Task" containing "Evaluate the trained LSTM model"
# From analysis: that's at cell index 22
# But let's verify dynamically:

split_index = None
for i, cell in enumerate(cells):
    src = ''.join(cell['source'])
    # Milestone 2 starts at the "Check and Handle Missing Values" section
    # which comes right after a "# Task" cell for evaluation
    if cell['cell_type'] == 'markdown' and 'Check and Handle Missing Values' in src:
        split_index = i
        print(f'Found Milestone 2 start at cell {i}: {src[:100]}')
        break

if split_index is None:
    # Fallback: use the 3rd "# Task" cell as separator
    task_count = 0
    for i, cell in enumerate(cells):
        src = ''.join(cell['source'])
        if cell['cell_type'] == 'markdown' and src.strip().startswith('# Task'):
            task_count += 1
            if task_count == 3:  # Third task cell is Milestone 2
                split_index = i
                print(f'Using 3rd task cell at index {i} as split point')
                break

# But actually, looking at the structure:
# Milestone 2 should include: "# Task" (Evaluate...) + "## Check and Handle Missing Values" ...
# So we need to go back to find the "# Task" cell just before "Check and Handle Missing Values"
# Let's find the "# Task" that precedes the M2 content

for i, cell in enumerate(cells):
    src = ''.join(cell['source'])
    if cell['cell_type'] == 'markdown' and '# Task' in src and 'Evaluate' in src:
        split_index = i
        print(f'Found "Evaluate" task cell at index {i}: {src[:200]}')
        break

print(f'\nSplit index: {split_index}')
print(f'Milestone 1 cells: 0 to {split_index - 1} ({split_index} cells)')
print(f'Milestone 2 cells: {split_index} to {total - 1} ({total - split_index} cells)')

# Create Milestone 1 notebook (cells 0 to split_index-1)
m1_nb = copy.deepcopy(nb)
m1_nb['cells'] = cells[:split_index]

# Add a title cell at beginning for Milestone 1
m1_title = {
    "cell_type": "markdown",
    "metadata": {},
    "source": ["# Milestone 1\n", "## LSTM Stock Price Prediction - Data Preparation, Model Building & Training\n", "\n",
               "This notebook covers:\n",
               "- Data preparation and scaling\n",
               "- Training dataset creation\n",
               "- LSTM model construction\n",
               "- Model training\n"]
}

# Create Milestone 2 notebook (cells from split_index onwards)
m2_nb = copy.deepcopy(nb)
m2_nb['cells'] = cells[split_index:]

# Add a title cell at beginning for Milestone 2  
m2_title = {
    "cell_type": "markdown",
    "metadata": {},
    "source": ["# Milestone 2\n", "## LSTM Stock Price Prediction - Evaluation, Missing Values & Outliers\n", "\n",
               "This notebook covers:\n",
               "- Filling missing values\n",
               "- Handling outliers\n",
               "- Model evaluation (actual vs predicted prices)\n",
               "- Discussion of improvements\n",
               "\n",
               "> **Note:** Milestone 2 builds on Milestone 1. The model (`model`), scaler (`scaler`),\n",
               "> and training data (`X_train`, `y_train`) must be available from Milestone 1.\n",
               "> Run Milestone 1 first, or recreate those objects at the start of this notebook.\n"]
}

# Add setup code cell for M2 that recreates Milestone 1 objects
m2_setup = {
    "cell_type": "code",
    "execution_count": None,
    "metadata": {},
    "outputs": [],
    "source": [
        "# ============================================================\n",
        "# Milestone 2 Setup - Recreate objects from Milestone 1\n",
        "# ============================================================\n",
        "# If you are running this notebook independently (not after Milestone 1),\n",
        "# run the following code to rebuild the required objects.\n",
        "# If Milestone 1 was already executed in the same session, you can skip this.\n",
        "\n",
        "import pandas as pd\n",
        "import numpy as np\n",
        "from sklearn.preprocessing import MinMaxScaler\n",
        "import tensorflow as tf\n",
        "from tensorflow.keras.models import Sequential\n",
        "from tensorflow.keras.layers import LSTM, Dense, Dropout\n",
        "\n",
        "# Recreate the dummy DataFrame (use your actual data source here)\n",
        "dates = pd.date_range(start='2023-01-01', periods=100)\n",
        "np.random.seed(42)  # for reproducibility\n",
        "close_prices_dummy = np.random.rand(100) * 100 + 100\n",
        "df = pd.DataFrame({'Date': dates, 'Close': close_prices_dummy})\n",
        "\n",
        "# Scale data\n",
        "close_prices = df['Close'].values.reshape(-1, 1)\n",
        "scaler = MinMaxScaler(feature_range=(0, 1))\n",
        "scaled_data = scaler.fit_transform(close_prices)\n",
        "\n",
        "# Create training dataset\n",
        "X_train, y_train = [], []\n",
        "prediction_window = 60\n",
        "for i in range(prediction_window, len(scaled_data)):\n",
        "    X_train.append(scaled_data[i-prediction_window:i, 0])\n",
        "    y_train.append(scaled_data[i, 0])\n",
        "X_train, y_train = np.array(X_train), np.array(y_train)\n",
        "X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))\n",
        "\n",
        "# Build and train LSTM model\n",
        "model = Sequential()\n",
        "model.add(LSTM(units=50, return_sequences=True, input_shape=(X_train.shape[1], 1)))\n",
        "model.add(Dropout(0.2))\n",
        "model.add(LSTM(units=50, return_sequences=False))\n",
        "model.add(Dropout(0.2))\n",
        "model.add(Dense(units=25))\n",
        "model.add(Dense(units=1))\n",
        "model.compile(optimizer='adam', loss='mean_squared_error')\n",
        "model.fit(X_train, y_train, epochs=100, batch_size=32, verbose=0)\n",
        "print('Setup complete: df, scaler, X_train, y_train, model are ready.')\n"
    ]
}

# Insert title cells at the beginning
m1_nb['cells'].insert(0, m1_title)
m2_nb['cells'].insert(0, m2_setup)
m2_nb['cells'].insert(0, m2_title)

# Save the two notebooks to the Downloads folder
m1_path = r'C:\Users\sanja\Downloads\Springboard_Milestone1.ipynb'
m2_path = r'C:\Users\sanja\Downloads\Springboard_Milestone2.ipynb'

with open(m1_path, 'w', encoding='utf-8') as f:
    json.dump(m1_nb, f, indent=2, ensure_ascii=False)

with open(m2_path, 'w', encoding='utf-8') as f:
    json.dump(m2_nb, f, indent=2, ensure_ascii=False)

print(f'\nSuccessfully created:')
print(f'  Milestone 1: {m1_path} ({len(m1_nb["cells"])} cells)')
print(f'  Milestone 2: {m2_path} ({len(m2_nb["cells"])} cells)')
print('\nMilestone 1 cell summary:')
for i, cell in enumerate(m1_nb['cells']):
    src = ''.join(cell['source']).replace('\n', ' ')[:80]
    print(f'  Cell {i:2d} [{cell["cell_type"]:8s}]: {src}')
print('\nMilestone 2 cell summary:')
for i, cell in enumerate(m2_nb['cells']):
    src = ''.join(cell['source']).replace('\n', ' ')[:80]
    print(f'  Cell {i:2d} [{cell["cell_type"]:8s}]: {src}')
