"""
Main script to orchestrate the ABSA model fine-tuning process.
Loads data, preprocesses, configures training, trains, evaluates, and saves the model.
"""
import torch
from transformers import (
    AutoModelForTokenClassification,
    TrainingArguments,
    Trainer,
    DataCollatorForTokenClassification
)
import os
from . import config as project_config
from .data_loader import load_and_combine_datasets
from .data_preprocessor import clean_and_standardize_data, aggregate_data_for_hf
from .tokenization_utils import get_tokenizer_and_config, map_and_split_dataset
from .evaluation_utils import compute_absa_metrics

def run_training(data_base_path: str, model_output_base_dir: str):
    """
    Executes the full fine-tuning pipeline.

    Args:
        data_base_path (str): Path to the directory containing raw CSV data.
        model_output_base_dir (str): Base directory where fine-tuned models and results
                                     will be saved.
    """
    print("--- Starting ABSA Model Fine-Tuning Pipeline ---")

    # --- Step 1: Load Data ---
    df_combined = load_and_combine_datasets(data_base_path)
    if df_combined is None:
        print("Halting pipeline due to data loading failure.")
        return

    # --- Step 2: Clean and Standardize Data ---
    df_cleaned = clean_and_standardize_data(df_combined)
    if df_cleaned is None:
        print("Halting pipeline due to data cleaning failure.")
        return

    # --- Step 3: Aggregate Aspects & Convert to HF Dataset ---
    hf_dataset_aggregated = aggregate_data_for_hf(df_cleaned)
    if hf_dataset_aggregated is None:
        print("Halting pipeline due to data aggregation failure.")
        return

    # --- Step 4: Tokenization, Label Alignment, Data Splits ---
    print("\n--- Running Step 4 (from train.py) ---")
    tokenizer, model_config, label2id, id2label, num_labels_from_config = get_tokenizer_and_config()
    if not all([tokenizer, model_config, label2id, id2label, num_labels_from_config is not None]):
        print("Halting pipeline due to tokenizer/config loading failure.")
        return

    dataset_splits = map_and_split_dataset(hf_dataset_aggregated, tokenizer, label2id)
    if dataset_splits is None:
        print("Halting pipeline due to tokenization/splitting failure.")
        return

    data_collator = DataCollatorForTokenClassification(tokenizer=tokenizer)
    print("Data Collator for Token Classification initialized.")

    # --- Step 5: Metrics ---
    print("\n--- Step 5 (from train.py): compute_metrics function is ready ---")

    # --- Step 6: Configure Training Arguments ---
    print("\n--- Step 6 (from train.py): Configuring Training Arguments ---")
    model_run_output_dir = os.path.join(model_output_base_dir, project_config.MODEL_NAME + "-absa-sentiment-fine-tuned")
    os.makedirs(model_run_output_dir, exist_ok=True)
    print(f"Model outputs will be saved to: {model_run_output_dir}")

    save_steps_approx = len(dataset_splits['train']) // project_config.TRAIN_BATCH_SIZE
    if save_steps_approx == 0: save_steps_approx = 1

    training_args = TrainingArguments(
        output_dir=model_run_output_dir,
        num_train_epochs=project_config.NUM_EPOCHS,
        learning_rate=project_config.LEARNING_RATE,
        per_device_train_batch_size=project_config.TRAIN_BATCH_SIZE,
        per_device_eval_batch_size=project_config.EVAL_BATCH_SIZE,
        weight_decay=project_config.WEIGHT_DECAY,
        report_to="none",
        logging_steps=project_config.LOGGING_STEPS,
        save_steps=save_steps_approx,
        save_total_limit=2,
        load_best_model_at_end=False,
    )
    print("TrainingArguments configured.")

    # --- Step 7: Instantiate the Trainer ---
    print("\n--- Step 7 (from train.py): Instantiating Trainer ---")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")

    try:
        model = AutoModelForTokenClassification.from_pretrained(project_config.MODEL_NAME, config=model_config)
        model.to(device)
        print(f"Model '{project_config.MODEL_NAME}' loaded with {num_labels_from_config} labels and moved to {device}")

        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=dataset_splits["train"],
            eval_dataset=dataset_splits["validation"],
            tokenizer=tokenizer,
            data_collator=data_collator,
            compute_metrics=lambda p: compute_absa_metrics(p, id2label)
        )
        print("Trainer instantiated successfully.")
    except Exception as e:
        print(f"Error during model loading or Trainer instantiation: {e}")
        import traceback
        traceback.print_exc()
        return

    # --- Step 8: Start Fine-Tuning ---
    print("\n--- Step 8 (from train.py): Starting Fine-Tuning ---")
    try:
        print("Starting training...")
        train_result = trainer.train()
        print("Training finished!")

        metrics = train_result.metrics
        trainer.log_metrics("train", metrics)
        trainer.save_metrics("train", metrics)
        trainer.save_state()
        print("Final training metrics logged and saved.")
        print(metrics)
    except Exception as e:
        print(f"An error occurred during training: {e}")
        import traceback
        traceback.print_exc()
        return

    # --- Step 9: Evaluation ---
    print("\n--- Step 9 (from train.py): Evaluation ---")
    print("Evaluating on the validation set...")
    try:
        eval_results = trainer.evaluate(eval_dataset=dataset_splits['validation'])
        trainer.log_metrics("eval_validation", eval_results)
        trainer.save_metrics("eval_validation", eval_results)
        print("Validation Set Evaluation Results:")
        print(eval_results)
    except Exception as e:
        print(f"An error occurred during validation set evaluation: {e}")

    if 'test' in dataset_splits:
        print("\nEvaluating on the test set...")
        try:
            test_results = trainer.evaluate(eval_dataset=dataset_splits['test'])
            trainer.log_metrics("eval_test", test_results)
            trainer.save_metrics("eval_test", test_results)
            print("Test Set Evaluation Results:")
            renamed_test_results = {f"test_{k.replace('eval_', '')}": v for k, v in test_results.items()}
            print(renamed_test_results)
        except Exception as e:
            print(f"An error occurred during test set evaluation: {e}")

    # --- Step 10: Saving Final Model ---
    print("\n--- Step 10 (from train.py): Saving Final Model ---")
    final_save_path = os.path.join(model_run_output_dir, "final_model_with_sentiment")
    os.makedirs(final_save_path, exist_ok=True)
    print(f"Saving the fine-tuned model and tokenizer to: {final_save_path}")
    try:
        trainer.save_model(final_save_path)
        if tokenizer:
             tokenizer.save_pretrained(final_save_path)
        print("Final model and tokenizer saved successfully.")
    except Exception as e:
        print(f"Error saving final model/tokenizer: {e}")

    print("\n--- ABSA Model Fine-Tuning Pipeline Complete ---")


if __name__ == '__main__':
    print("Running main training script ...")
    if not os.path.exists(project_config.DEFAULT_LOCAL_DATA_PATH):
        os.makedirs(project_config.DEFAULT_LOCAL_DATA_PATH)
        print(f"Created directory: {project_config.DEFAULT_LOCAL_DATA_PATH}")
        print(f"Please place {project_config.LAPTOP_TRAIN_FILE} and {project_config.RESTO_TRAIN_FILE} there.")

    output_base = project_config.OUTPUT_DIR_BASE
    if not os.path.exists(output_base):
        os.makedirs(output_base)
        print(f"Created directory: {output_base}")
        
    run_training(
        data_base_path=project_config.DEFAULT_LOCAL_DATA_PATH,
        model_output_base_dir=output_base
    )