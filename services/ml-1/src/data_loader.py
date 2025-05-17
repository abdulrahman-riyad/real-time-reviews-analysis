"""
Handles loading and combining of the raw SemEval ABSA datasets.
"""
import pandas as pd
import os
from . import config

def load_and_combine_datasets(data_path_base: str) -> pd.DataFrame | None:
    """
    Loads laptop and restaurant training CSVs, adds a domain column,
    and concatenates them.

    Args:
        data_path_base (str): The base directory containing the dataset CSV files.

    Returns:
        pd.DataFrame | None: A combined pandas DataFrame with all training instances,
                             or None if loading fails.
    """
    laptop_train_path = os.path.join(data_path_base, config.LAPTOP_TRAIN_FILE)
    resto_train_path = os.path.join(data_path_base, config.RESTO_TRAIN_FILE)

    print("--- Step 1: Loading Data using pd.read_csv ---")
    all_dfs_loaded = True
    df_laptop = None
    df_resto = None

    try:
        print(f"Attempting to load: {laptop_train_path}")
        df_laptop = pd.read_csv(laptop_train_path, encoding='ISO-8859-1', on_bad_lines='skip')
        print(f"Loaded {len(df_laptop)} laptop records.")
    except FileNotFoundError:
        print(f"Error: Laptop file not found at {laptop_train_path}")
        all_dfs_loaded = False
    except Exception as e:
        print(f"An error occurred loading laptop data: {e}")
        all_dfs_loaded = False

    try:
        print(f"\nAttempting to load: {resto_train_path}")
        df_resto = pd.read_csv(resto_train_path, encoding='ISO-8859-1', on_bad_lines='skip')
        print(f"Loaded {len(df_resto)} restaurant records.")
    except FileNotFoundError:
        print(f"Error: Restaurant file not found at {resto_train_path}")
        all_dfs_loaded = False
    except Exception as e:
        print(f"An error occurred loading restaurant data: {e}")
        all_dfs_loaded = False

    if not all_dfs_loaded or df_laptop is None or df_resto is None:
        print("\nData loading failed for one or both files. Please review errors above.")
        return None

    print("\nCombining datasets...")
    df_laptop['domain'] = 'laptop'
    df_resto['domain'] = 'restaurant'
    df_combined_train = pd.concat([df_laptop, df_resto], ignore_index=True)

    print(f"\nTotal combined training instances: {len(df_combined_train)}")
    print("Combined DataFrame Info:")
    df_combined_train.info()
    print("\nCombined DataFrame Head:")
    print(df_combined_train.head())

    print("\n--- Dataset Loading Complete ---")
    return df_combined_train

if __name__ == '__main__':
    pass