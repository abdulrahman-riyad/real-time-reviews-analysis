"""
Configuration settings for the ABSA fine-tuning project.
Includes model names, paths, labeling schemes, and hyperparameters.
"""

# --- Model Configuration ---
MODEL_NAME = "bert-base-uncased"
OUTPUT_DIR_BASE = "./saved_models" # Specific model output directory will be created by TrainingArguments

# --- Labeling Scheme for Aspect Extraction ---
LABEL_LIST = ["O", "B-ASP", "I-ASP"] # Outside, Beginning-Aspect, Inside-Aspect

# --- Data Paths ---
DEFAULT_KAGGLE_INPUT_PATH = "/kaggle/input/sem-eval-absa"
DEFAULT_LOCAL_DATA_PATH = "./data"

LAPTOP_TRAIN_FILE = "Laptop_Train_v2.csv"
RESTO_TRAIN_FILE = "Restaurants_Train_v2.csv"

# --- Training Hyperparameters ---
TRAIN_BATCH_SIZE = 16
EVAL_BATCH_SIZE = 16
NUM_EPOCHS = 3
LEARNING_RATE = 2e-5  # Standard fine-tuning rate for BERT
WEIGHT_DECAY = 0.01
SAVE_STEPS_FACTOR = 1
LOGGING_STEPS = 100
MAX_SEQ_LENGTH = 512

# --- Tokenization Strategy ---
LABEL_ALL_TOKENS = False # If True, labels all subword tokens. If False, only first subword.

# --- Evaluation ---
METRIC_FOR_BEST_MODEL = "f1"
GREATER_IS_BETTER = True

# --- Reproducibility ---
SEED = 42