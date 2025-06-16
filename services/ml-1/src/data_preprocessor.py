"""
Handles cleaning, standardization, and aggregation of the dataset.
"""
import pandas as pd
from datasets import Dataset

def clean_and_standardize_data(df_input: pd.DataFrame) -> pd.DataFrame | None:
    """
    Cleans the combined DataFrame: standardizes column names, handles NaNs,
    converts types, and strips text. Maps 'conflict' polarity to 'neutral'.

    Args:
        df_input (pd.DataFrame): The combined DataFrame from data_loader.

    Returns:
        pd.DataFrame | None: The cleaned DataFrame, or None if input is invalid.
    """
    if df_input is None or df_input.empty:
        print("Error: Input DataFrame for cleaning is None or empty.")
        return None

    print("\n--- Step 2: Initial Data Cleaning, Standardization, and Type Conversion ---")
    df_cleaned = df_input.copy()

    print("\nStandardizing column names...")
    df_cleaned.columns = df_cleaned.columns.str.lower().str.replace(' ', '_', regex=False)
    print("New column names:", df_cleaned.columns.tolist())

    essential_cols = ['aspect_term', 'polarity', 'from', 'to', 'sentence']
    missing_essential = [col for col in essential_cols if col not in df_cleaned.columns]
    if missing_essential:
        print(f"Error: Essential columns missing after standardization: {missing_essential}")
        return None

    print(f"\nRows before dropping NaNs in essential columns: {len(df_cleaned)}")
    df_cleaned.dropna(subset=essential_cols, inplace=True)
    print(f"Rows after dropping NaNs: {len(df_cleaned)}")
    if df_cleaned.empty:
        print("DataFrame became empty after dropping NaNs. Check input data.")
        return None

    if 'from' in df_cleaned.columns and 'to' in df_cleaned.columns:
        print("\nConverting 'from' and 'to' columns to integer type...")
        try:
            df_cleaned['from'] = pd.to_numeric(df_cleaned['from'], errors='coerce').fillna(-1).astype(int)
            df_cleaned['to'] = pd.to_numeric(df_cleaned['to'], errors='coerce').fillna(-1).astype(int)
            print("'from' and 'to' columns successfully converted to int.")
        except Exception as e:
            print(f"Error converting 'from'/'to' to int: {e}. Returning partially processed DataFrame.")
            return df_cleaned
    else:
        print("Error: 'from' or 'to' columns not found for type conversion.")
        return None

    if 'sentence' in df_cleaned.columns and 'aspect_term' in df_cleaned.columns:
        print("\nApplying strip() to 'sentence' and 'aspect_term' columns...")
        df_cleaned['sentence'] = df_cleaned['sentence'].astype(str).str.strip()
        df_cleaned['aspect_term'] = df_cleaned['aspect_term'].astype(str).str.strip()
    else:
        print("Error: 'sentence' or 'aspect_term' columns not found for stripping.")
        return None

    if 'polarity' in df_cleaned.columns:
        print("\nOriginal unique polarity values found:")
        print(df_cleaned['polarity'].unique())

        # Map 'conflict' to 'neutral'
        df_cleaned['polarity'] = df_cleaned['polarity'].replace('conflict', 'neutral')
        print("\nUnique polarity values after mapping 'conflict' to 'neutral':")
        print(df_cleaned['polarity'].unique())

        # Filter for expected polarities after mapping
        expected_polarities = ['positive', 'negative', 'neutral']
        original_len = len(df_cleaned)
        df_cleaned = df_cleaned[df_cleaned['polarity'].isin(expected_polarities)]
        if len(df_cleaned) < original_len:
            print(f"Filtered out {original_len - len(df_cleaned)} rows with unexpected polarities.")
    else:
        print("Warning: 'polarity' column not found.")


    print("\nCleaned DataFrame Info:")
    df_cleaned.info()
    print("\nCleaned DataFrame Head (Cleaned):")
    print(df_cleaned.head())
    print("\n--- Initial Cleaning, Standardization, and Type Conversion Complete ---")
    return df_cleaned

def _aggregate_aspects_per_sentence_helper(group: pd.DataFrame) -> pd.Series | None:
    """Helper function to aggregate aspects for a single sentence group."""
    # No changes needed here, it already carries 'polarity'
    required_cols = ['sentence', 'aspect_term', 'polarity', 'from', 'to', 'domain', 'id']
    if not all(col in group.columns for col in required_cols):
         print(f"Warning: Skipping group due to missing columns. Group keys: {group.name}")
         return None

    aspect_list = []
    for _, row in group.iterrows():
        aspect_list.append({
            'term': row['aspect_term'],
            'polarity': row['polarity'],
            'from': row['from'],
            'to': row['to']
        })
    return pd.Series({
        'original_id': group['id'].iloc[0],
        'sentence': group['sentence'].iloc[0],
        'aspects': aspect_list,
        'domain': group['domain'].iloc[0]
    })

def aggregate_data_for_hf(df_cleaned: pd.DataFrame) -> Dataset | None:
    """
    Aggregates aspect data per unique sentence and converts to Hugging Face Dataset.
    """
    if df_cleaned is None or df_cleaned.empty:
        print("Error: Input DataFrame for aggregation is None or empty.")
        return None

    print("\n--- Step 3: Aggregate Aspects per Sentence using Unique ID ---")
    if 'id' in df_cleaned.columns and 'domain' in df_cleaned.columns:
        print("\nCreating unique sentence identifier (domain_id)...")
        df_cleaned['unique_id'] = df_cleaned['domain'] + '_' + df_cleaned['id'].astype(str)
        print(f"Unique IDs created: {df_cleaned['unique_id'].nunique()}")
    else:
        print("Error: Cannot create unique_id. 'id' or 'domain' column missing.")
        return None

    print("\nGrouping by 'unique_id' and aggregating aspects...")
    if 'unique_id' in df_cleaned.columns and df_cleaned['unique_id'].notna().all():
        aggregated_data_series = df_cleaned.groupby('unique_id').apply(
            lambda g: _aggregate_aspects_per_sentence_helper(g)
        )
        aggregated_data_series = aggregated_data_series.dropna()
        if aggregated_data_series.empty:
            print("Error: Aggregation resulted in an empty dataset.")
            return None
        aggregated_df = aggregated_data_series.reset_index()
        print(f"Number of unique sentences after aggregation: {len(aggregated_df)}")
    else:
        print("Error: 'unique_id' column not found or contains NaNs. Cannot group.")
        return None

    if aggregated_df.empty:
        print("Error: Aggregated DataFrame is empty.")
        return None

    print("\nConverting aggregated DataFrame to Hugging Face Dataset...")
    columns_to_keep = ['unique_id', 'sentence', 'aspects', 'domain']
    if not all(col in aggregated_df.columns for col in columns_to_keep):
        print(f"Error: Not all 'columns_to_keep' are present in aggregated_df. Available: {aggregated_df.columns.tolist()}")
        return None
    hf_dataset = Dataset.from_pandas(aggregated_df[columns_to_keep])

    print("\nHugging Face Dataset Info:")
    print(hf_dataset)
    print("\nSample record from Hugging Face Dataset:")
    if len(hf_dataset) > 0:
        print(hf_dataset[0])
    else:
        print("hf_dataset is empty.")

    print("\n--- Aggregation (Revised) Complete ---")
    return hf_dataset

if __name__ == '__main__':
    pass