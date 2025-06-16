from transformers import AutoModelForTokenClassification, AutoTokenizer
import os
from . import config as project_config

LOCAL_MODEL_DIR = os.path.join(
    project_config.OUTPUT_DIR_BASE,
    project_config.TRAINING_RUN_SUBDIR,
    project_config.FINAL_MODEL_SUBDIR_NAME
)

# Hugging Face Hub Model
HUB_USERNAME = "AbdulrahmanMahmoud007"
DESIRED_MODEL_NAME_ON_HUB = "bert-absa-reviews-analysis"
HUB_MODEL_ID = f"{HUB_USERNAME}/{DESIRED_MODEL_NAME_ON_HUB}"

def main():
    print(f"Attempting to load model and tokenizer from local directory: '{LOCAL_MODEL_DIR}'")
    if not os.path.exists(LOCAL_MODEL_DIR):
        print(f"Error: Model directory not found at '{LOCAL_MODEL_DIR}'")
        print("Please ensure that the fine-tuning script (src/train.py) has been run successfully,")
        print(f"and that the final model was saved to the expected path.")
        print(f"Expected path is constructed from src/config.py settings:")
        print(f"  OUTPUT_DIR_BASE = \"{project_config.OUTPUT_DIR_BASE}\"")
        print(f"  TRAINING_RUN_SUBDIR = \"{project_config.TRAINING_RUN_SUBDIR}\"")
        print(f"  FINAL_MODEL_SUBDIR_NAME = \"{project_config.FINAL_MODEL_SUBDIR_NAME}\"")
        return

    try:
        print("Loading fine-tuned model for token classification...")
        model = AutoModelForTokenClassification.from_pretrained(LOCAL_MODEL_DIR)
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_DIR)
        print("Model and tokenizer loaded successfully from local directory.")

        print(f"\nAttempting to push model and tokenizer to Hugging Face Hub ID: {HUB_MODEL_ID}")

        model.push_to_hub(
            repo_id=HUB_MODEL_ID,
            commit_message="Upload fine-tuned BERT model for Aspect-Based Sentiment Analysis",
            private=False,
            create_repository=True
        )
        print("Model pushed successfully.")

        tokenizer.push_to_hub(
            repo_id=HUB_MODEL_ID,
            commit_message="Upload tokenizer for ABSA model",
            private=False,
            create_repository=True
        )
        print("Tokenizer pushed successfully.")
        print(f"\nModel and tokenizer successfully pushed to: https://huggingface.co/{HUB_MODEL_ID}")

    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()