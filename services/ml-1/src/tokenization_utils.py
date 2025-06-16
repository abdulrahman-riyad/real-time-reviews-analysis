"""
Handles tokenization and alignment of BIO-Sentiment labels for ABSA.
"""
from transformers import AutoTokenizer, AutoConfig, DataCollatorForTokenClassification
from datasets import DatasetDict
from . import config

def get_tokenizer_and_config():
    """Loads and returns the tokenizer and model configuration using LABEL_LIST from config."""
    print(f"Loading Tokenizer and Config for {config.MODEL_NAME}...")
    try:
        # LABEL_LIST is now taken from config.py
        label2id = {label: i for i, label in enumerate(config.LABEL_LIST)}
        id2label = {i: label for i, label in enumerate(config.LABEL_LIST)}
        num_labels = len(config.LABEL_LIST)

        print(f"Using {num_labels} labels: {config.LABEL_LIST}")
        print(f"label2id map: {label2id}")


        tokenizer = AutoTokenizer.from_pretrained(config.MODEL_NAME)
        model_config = AutoConfig.from_pretrained(
            config.MODEL_NAME,
            num_labels=num_labels,
            id2label=id2label,
            label2id=label2id
        )
        print("Tokenizer and Config loaded successfully.")
        return tokenizer, model_config, label2id, id2label, num_labels
    except Exception as e:
        print(f"Error loading tokenizer/config: {e}")
        return None, None, None, None, None


def tokenize_and_align_labels(examples, tkz, lbl2id, label_all_tokens=config.LABEL_ALL_TOKENS):
    """
    Tokenizes sentences and aligns BIO-Sentiment labels based on character spans.
    Now uses the 'polarity' from the aspect data to form labels like B-ASP-POS.
    """
    if tkz is None or lbl2id is None:
        raise ValueError("Tokenizer (tkz) or Label2ID (lbl2id) map is None.")

    tokenized_inputs = tkz(
        examples["sentence"],
        truncation=True,
        is_split_into_words=False,
        max_length=config.MAX_SEQ_LENGTH,
        return_offsets_mapping=True
    )
    all_labels = []
    for i, offset_mapping in enumerate(tokenized_inputs["offset_mapping"]):
        aspects_in_doc = examples["aspects"][i] # Contains 'term', 'polarity', 'from', 'to'
        word_ids = tokenized_inputs.word_ids(batch_index=i)
        # Initialize labels: -100 for special tokens, 0 ('O') for all others
        label_ids = [-100 if word_id is None else lbl2id["O"] for word_id in word_ids]

        for aspect in aspects_in_doc:
            asp_start_char = aspect['from']
            asp_end_char = aspect['to']
            if aspect['polarity'] == 'positive':
                polarity_suffix = "POS"
            elif aspect['polarity'] == 'negative':
                polarity_suffix = "NEG"
            elif aspect['polarity'] == 'neutral':
                polarity_suffix = "NEU"
            else:
                # Should not happen if data_preprocessor worked correctly
                print(f"Warning: Unexpected polarity '{aspect['polarity']}' found for aspect '{aspect['term']}'. Defaulting to O.")
                continue # Skip this aspect if polarity is unknown

            first_token_in_span_for_this_aspect = True
            for idx, (start_char, end_char) in enumerate(offset_mapping):
                if start_char == end_char == 0: continue # Skip special token offsets

                # Check if current token overlaps with the aspect's character span
                if (start_char < asp_end_char) and (end_char > asp_start_char): # Overlap
                    if label_ids[idx] == lbl2id["O"]: # Only label if currently 'O' to avoid complex overlap handling
                        is_first_word_token_of_current_word = True
                        current_token_word_id = word_ids[idx]
                        if current_token_word_id is not None and idx > 0:
                            prev_token_word_id = word_ids[idx-1]
                            if prev_token_word_id == current_token_word_id:
                                is_first_word_token_of_current_word = False

                        # Check if it's the true beginning of the aspect span
                        if start_char >= asp_start_char and is_first_word_token_of_current_word and first_token_in_span_for_this_aspect:
                            label_ids[idx] = lbl2id[f"B-ASP-{polarity_suffix}"]
                            first_token_in_span_for_this_aspect = False # Next token in this aspect is 'I'
                        else:
                            label_ids[idx] = lbl2id[f"I-ASP-{polarity_suffix}"]

        if not label_all_tokens:
            final_aligned_labels = []
            last_word_id = None
            for idx, word_id in enumerate(word_ids):
                if word_id is None:
                    final_aligned_labels.append(-100)
                elif word_id == last_word_id:
                    final_aligned_labels.append(-100)
                else:
                    final_aligned_labels.append(label_ids[idx])
                last_word_id = word_id
            all_labels.append(final_aligned_labels)
        else:
            all_labels.append(label_ids)

    tokenized_inputs["labels"] = all_labels
    return tokenized_inputs

def map_and_split_dataset(hf_dataset, tokenizer, label2id) -> DatasetDict | None:
    """
    Applies tokenization and label alignment, then splits into train/validation/test.
    """
    # No changes to the core logic of this function needed for new labels,
    # as it just passes tokenizer and label2id to tokenize_and_align_labels.
    if hf_dataset is None or tokenizer is None or label2id is None:
        print("Error: hf_dataset, tokenizer, or label2id missing for mapping and splitting.")
        return None

    print("\nApplying tokenization and label alignment...")
    try:
        tokenized_ds = hf_dataset.map(
            tokenize_and_align_labels,
            batched=True,
            fn_kwargs={'tkz': tokenizer, 'lbl2id': label2id, 'label_all_tokens': config.LABEL_ALL_TOKENS},
            remove_columns=hf_dataset.column_names
        )
        print("Tokenization complete.")
    except Exception as e:
        print(f"Error during .map(): {e}")
        import traceback
        traceback.print_exc() # Print for debugging
        return None

    print("\nSplitting dataset...")
    try:
        train_testvalid = tokenized_ds.train_test_split(test_size=0.2, seed=config.SEED)
        test_valid = train_testvalid['test'].train_test_split(test_size=0.5, seed=config.SEED)
        dataset_splits = DatasetDict({
            'train': train_testvalid['train'],
            'validation': test_valid['train'],
            'test': test_valid['test']
        })
        print("Dataset splits created:", dataset_splits)
        return dataset_splits
    except Exception as e:
        print(f"Error splitting dataset: {e}")
        return None

if __name__ == '__main__':
    pass