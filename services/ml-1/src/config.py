"""
Configuration settings for the ABSA fine-tuning project.
Includes model names, paths, labeling schemes, and hyperparameters.
"""

# --- Model Configuration ---
MODEL_NAME = "bert-base-uncased"
OUTPUT_DIR_BASE = "./saved_models"
TRAINING_RUN_SUBDIR = MODEL_NAME + "-absa-sentiment-fine-tuned"
FINAL_MODEL_SUBDIR_NAME = "final_model_with_sentiment"

# --- Labeling Scheme for Aspect Extraction AND Sentiment ---
# BIO tags combined with sentiment.
_polarities = ["POS", "NEG", "NEU"]
LABEL_LIST = ["O"] + \
             [f"B-ASP-{pol}" for pol in _polarities] + \
             [f"I-ASP-{pol}" for pol in _polarities]
# Example: LABEL_LIST will be ['O', 'B-ASP-POS', 'B-ASP-NEG', 'B-ASP-NEU', 'I-ASP-POS', 'I-ASP-NEG', 'I-ASP-NEU']

# --- Data Paths ---
DEFAULT_KAGGLE_INPUT_PATH = "/kaggle/input/sem-eval-absa"
DEFAULT_LOCAL_DATA_PATH = "./data"

LAPTOP_TRAIN_FILE = "Laptop_Train_v2.csv"
RESTO_TRAIN_FILE = "Restaurants_Train_v2.csv"

# --- Training Hyperparameters ---
TRAIN_BATCH_SIZE = 16
EVAL_BATCH_SIZE = 16
NUM_EPOCHS = 3
LEARNING_RATE = 2e-5
WEIGHT_DECAY = 0.01
SAVE_STEPS_FACTOR = 1
LOGGING_STEPS = 100
MAX_SEQ_LENGTH = 512

# --- Tokenization Strategy ---
LABEL_ALL_TOKENS = False

# --- Evaluation ---
METRIC_FOR_BEST_MODEL = "f1"
GREATER_IS_BETTER = True

# --- Reproducibility ---
SEED = 42