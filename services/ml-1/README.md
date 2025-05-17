# Aspect-Based Product Review Analysis - Fine-Tuning

This project fine-tunes a BERT-based model (`bert-base-uncased`) for Aspect Extraction, a sub-task of Aspect-Based Sentiment Analysis (ABSA). The goal is to identify specific product features mentioned in customer reviews.

## Project Structure

```text
absa_fine_tuning_project/
├── data/                             # Input CSV datasets
│   ├── Laptop_Train_v2.csv
│   └── Restaurants_Train_v2.csv
├── src/                              # Source code
│   ├── __init__.py
│   ├── config.py                     # Configuration
│   ├── data_loader.py                # Step 1
│   ├── data_preprocessor.py          # Steps 2, 3
│   ├── tokenization_utils.py         # Step 4
│   ├── evaluation_utils.py           # Step 5
│   └── train.py                      # Main training script (Steps 6-10)
├── absa_pbl.ipynb                    # Original Kaggle notebook
├── saved_models/                     # Output for fine-tuned models
├── PBL_proj.pdf                      # PDF documentation
├── README.md                         
└── requirements.txt                  # Dependencies
```

## Setup

1.  **Create a Virtual Environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Data:**
    *   Create a `data/` directory in the project root.
    *   Download the SemEval ABSA dataset files (`Laptop_Train_v2.csv`, `Restaurants_Train_v2.csv`) and place them into the `data/` directory. You can get them from your Kaggle dataset: `abdulrahmanriyad/sem-eval-absa`.

4.  **Output Directory:**
    *   Create a `saved_models/` directory in the project root. The fine-tuned models and results will be saved here.

## Running the Training

Execute the main training script from the project root directory:

```bash
python -m src.train 