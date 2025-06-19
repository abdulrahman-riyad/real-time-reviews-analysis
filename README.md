# Real-Time Customer Reviews Analysis
Analyzes customer product reviews (scraped in real-time) using Aspect-Based Sentiment Analysis (ABSA) to extract and summarize product pros and cons based on specific features.

# Table of Content
1. [Architecture](#architecture)
2. [Aspect-Based Sentiment Analysis (ABSA)](#aspect-based-sentiment-analysis-absa)
3. [ML Pipeline Overview](#ml-pipeline-overview)
4. [Technology and Frameworks](#technology-and-frameworks)
5. [Model Performance](#model-performance)
6. [API Deployment](#api-deployment)
7. [Contributors](#contributors)
8. [Future Considerations](#future-considerations)

## Architecture
This project is aimed to provide a microservice to summarize the reviews of the customers for a specific product to extract some aspects that reflect their overall satisfaction about the product, representing it back to the user in a user-friendly small paragraph form. Currently it only designed for Amazon market and we are aiming to expand this project beyond this scope, check the [future considerations](#future-considerations) for more information.

For achieving this, we have implemented a 3-tiered application consisting of:
* Chrome Extension popup
* NodeJS Backend
* Fine-tuned BERT model cluster

These three tiers are stand-alone tiers communicating according to the following architecture.

<div align="center">
    <img src="public/architecture.png" width="70%">
</div>

The `background.js` injects runtime messages for later trigger using the extension when loading an Amazon product page. When a user requests a summary, extension triggers `chrome.tabs.onMessage` api to request the reviews innerHTML. The reviews is sent to the backend, cleaned and proceed by the fine-tuned BERT model for sentiment analysis. The model respond back to the backend with the following json format:

```json
{
    "analysis_results": [
        {
            "review_text": "...",
            "aspects_extracted": [
                {
                    "aspect": "battery life",
                    "sentiment": "positive",
                    "confidence": 0.89
                }
            ]
        }
    ],
    "final_summary": {
        "pros": ["Excellent battery life", "Great display quality"],
        "cons": ["Poor customer service", "Expensive price"]
    },
    "summary_paragraph": "..."
}
```

The `summary_paragraph` is sent back to the front-end which triggers `chrome.runtime.onMessage(Modal)`, passing the paragraph to the content-scripts for injecting a modal in the webpage consisting the summary.

Here is a demo of the results:
![Demo results](public/demo%20results.png)

## Aspect-Based Sentiment Analysis (ABSA)
Our ABSA system performs **joint aspect extraction and sentiment classification** in a single model, identifying specific product features mentioned in reviews and determining whether customers feel positive, negative, or neutral about each aspect.

### Key Features:
- **Joint Learning**: Single BERT model performs both aspect detection and sentiment analysis
- **BIO-Sentiment Tagging**: Uses a 7-class labeling scheme (B-ASP-POS, I-ASP-POS, B-ASP-NEG, I-ASP-NEG, B-ASP-NEU, I-ASP-NEU, O)
- **Domain Flexibility**: Trained on both laptop and restaurant review datasets for better generalization
- **Real-time Processing**: Optimized for fast inference via REST API

## ML Pipeline Overview

### 1. Data Preparation
- **Datasets**: SemEval-2014 Task 4 (Laptops & Restaurants)  
- **Processing**: Combined datasets, standardized labels, aggregated multiple aspects per sentence
- **Output**: Clean dataset with aspect terms, character offsets, and sentiment polarities

### 2. Model Architecture
- **Base Model**: `bert-base-uncased` from Hugging Face
- **Task**: Token classification with custom 7-class output layer
- **Tokenization**: Subword tokenization with label alignment to handle BERT's wordpiece tokens

### 3. Training Configuration
```python
# Key hyperparameters
num_train_epochs = 3
learning_rate = 2e-5
batch_size = 16
weight_decay = 0.01
```

### 4. Data Splits
- **Training**: 80%
- **Validation**: 10% 
- **Testing**: 10%

## Model Performance

| Metric | Validation Set | Test Set |
|--------|---------------|----------|
| **Overall F1-Score** | 0.5943 | 0.6166 |
| **Precision** | 0.5665 | 0.5904 |
| **Recall** | 0.6250 | 0.6453 |
| **Loss** | 0.2009 | 0.1801 |

### Performance by Sentiment:
- **Positive Aspects F1**: 0.70
- **Negative Aspects F1**: 0.63  
- **Neutral Aspects F1**: 0.39

The model shows strong performance on positive and negative sentiment detection, with room for improvement on neutral aspects.

## API Deployment

### Model Hosting
- **Model Hub**: [huggingface.co/AbdulrahmanMahmoud007/bert-absa-reviews-analysis](https://huggingface.co/AbdulrahmanMahmoud007/bert-absa-reviews-analysis)
- **API Service**: FastAPI application containerized with Docker
- **Deployment**: Hugging Face Spaces for scalable inference

### API Endpoint
- **URL**: `https://abdulrahmanmahmoud007-absa-fastapi-service.hf.space/analyze`
- **Method**: POST
- **Input**: JSON array of review strings
- **Output**: Structured aspect-sentiment analysis results

### Example API Usage:
```python
import requests

response = requests.post(
    "https://abdulrahmanmahmoud007-absa-fastapi-service.hf.space/analyze",
    json={"reviews": ["The battery life is amazing but the screen is too small"]}
)
```

## Technology and Frameworks

### Frontend
* Vue.js
* Chrome APIs

### Backend
* Node.js/Express
* Cheerio
* Vercel Deployment

### Machine Learning
* **Deep Learning**: PyTorch, Hugging Face Transformers
* **Model**: BERT (bert-base-uncased) fine-tuned for token classification
* **Data Processing**: Pandas, NumPy, Hugging Face Datasets
* **Evaluation**: Seqeval for sequence labeling metrics
* **Deployment**: FastAPI, Docker, Hugging Face Spaces
* **Model Versioning**: Hugging Face Hub with Git LFS

### Development Tools
* **Environment**: Python 3.11, Kaggle Notebooks → Local Development
* **Training**: Hugging Face Trainer API with custom metrics
* **Containerization**: Docker for API service deployment

## Contributors
- [Abanoub Aziz](https://github.com/abanoub-samy-farhan) — Backend, Chrome Extension, Deployment
- [Abdallah Adel](https://github.com/abdallahade1) — Machine Learning
- [Abdelrahman Riyad](https://github.com/abdulrahman-riyad) — Data & Machine Learning (Data Acquisition, Model Development & Deployment)
- [Shahd Ammar](https://github.com/ShahdAmmar) — Machine Learning
- [Yasmeen Sameh](https://github.com/Yasmeen55098) — Machine Learning

We worked collaboratively to build and refine this project.

## Future Considerations

### Short-term Improvements
- **Enhanced Summarization**: Integrate LLM (e.g., Gemini API) for better natural language summaries
- **Neutral Sentiment**: Improve model performance on neutral aspects through data augmentation
- **Domain Expansion**: Fine-tune on additional product categories beyond laptops and restaurants

### Long-term Vision
We are aiming to expand the scope of this project beyond scraping specific domains to be a stand-alone reusable microservice with necessary configurations and APIs for businesses to use in their systems, providing a more native summary component in their E-commerce website.
