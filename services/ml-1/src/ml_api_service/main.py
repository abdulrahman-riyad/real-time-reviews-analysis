from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
from dotenv import load_dotenv
import torch
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import os
import json
import google.generativeai as genai

# --- Configuration ---
MODEL_ID_ON_HUB = "AbdulrahmanMahmoud007/bert-absa-reviews-analysis"

# Gemma Configuration
load_dotenv()
GEMMA_API_KEY = os.getenv("GEMMA_API_KEY")
GEMMA_MODEL_NAME = "gemma-3n-e4b-it"

# --- Global Variables ---
tokenizer = None
model = None
absa_pipeline = None
device = None
gemma_llm = None

# --- Pydantic Models for Request and Response ---
class ReviewRequest(BaseModel):
    reviews: List[str] = Field(..., example=["This is a great review!", "The battery is bad."])

class Aspect(BaseModel):
    term: str
    sentiment: str
    score: float

class ReviewAspects(BaseModel):
    review_text: str
    extracted_aspects: List[Aspect]

class FinalSummary(BaseModel):  # For the LLM's output
    pros: List[str]
    cons: List[str]
    summary_paragraph: str

class AnalyzeResponse(BaseModel):
    analysis_results: List[ReviewAspects]  # From BERT
    final_summary: FinalSummary
    message: str = "Aspects, sentiments, and summary extracted successfully"

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Aspect-Based Sentiment Analysis & Summarization API",
    description="Extracts aspects/sentiments using BERT and generates summaries using Gemma.",
    version="1.3.0"
)

# --- Startup Event: Load Models and Configure API Key ---
@app.on_event("startup")
async def on_startup():
    global tokenizer, model, absa_pipeline, device, gemma_llm

    # --- Load BERT Model ---
    print(f"--- Loading BERT Aspect-Sentiment model ({MODEL_ID_ON_HUB}) from Hugging Face Hub ---")
    try:
        device_name = "cuda" if torch.cuda.is_available() else "cpu"
        device = torch.device(device_name)
        print(f"Using device for BERT: {device}")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID_ON_HUB)
        model = AutoModelForTokenClassification.from_pretrained(MODEL_ID_ON_HUB)
        model.to(device)
        model.eval()
        pipeline_device_id = 0 if device_name == "cuda" else -1
        absa_pipeline = pipeline(
            "token-classification", model=model, tokenizer=tokenizer,
            aggregation_strategy="simple", device=pipeline_device_id
        )
        print("--- BERT Aspect-Sentiment model, tokenizer, and pipeline loaded successfully from Hub! ---")
    except Exception as e:
        print(f"Error loading BERT model on startup: {e}")
        import traceback;
        traceback.print_exc()
        absa_pipeline = None

    # --- Configure Gemma Model ---
    print(f"--- Configuring Gemma model ({GEMMA_MODEL_NAME}) ---")
    if not GEMMA_API_KEY:
        print("CRITICAL ERROR: GEMMA_API_KEY environment variable not set. Summarization will be disabled.")
        gemma_llm = None
    else:
        try:
            genai.configure(api_key=GEMMA_API_KEY)
            gemma_llm = genai.GenerativeModel(GEMMA_MODEL_NAME)
            print(f"--- Gemma model ({GEMMA_MODEL_NAME}) configured successfully! ---")
        except Exception as e:
            print(f"Error configuring Gemma model: {e}")
            import traceback;
            traceback.print_exc()
            gemma_llm = None

# --- Call Gemma for Summarization ---
async def get_summary_from_gemma(aspect_sentiment_data: List[ReviewAspects],
                                  top_n_pros: int = 5,
                                  top_n_cons: int = 5) -> FinalSummary:
    global gemma_llm
    if gemma_llm is None:
        return FinalSummary(pros=[], cons=[],
                            summary_paragraph="LLM Summarizer (Gemma) not available or not configured.")

    if not aspect_sentiment_data:
        return FinalSummary(pros=[], cons=[], summary_paragraph="No aspects found to summarize.")

    # 1. Aggregate aspects
    aggregated_sentiments = {}
    for review_data in aspect_sentiment_data:
        for aspect in review_data.extracted_aspects:
            term = aspect.term
            sentiment = aspect.sentiment
            if term not in aggregated_sentiments:
                aggregated_sentiments[term] = {"positive": 0, "negative": 0, "neutral": 0, "unknown": 0}
            if sentiment in aggregated_sentiments[term]:
                aggregated_sentiments[term][sentiment] += 1
            else:
                aggregated_sentiments[term]["unknown"] += 1

    prompt_data_lines = ["Aggregated Aspect Sentiments from customer reviews:"]
    for term, counts in aggregated_sentiments.items():
        prompt_data_lines.append(
            f"- Aspect: '{term}', Positive mentions: {counts['positive']}, Negative mentions: {counts['negative']}, Neutral mentions: {counts['neutral']}"
        )
    prompt_data_str = "\n".join(prompt_data_lines)

    # 2. Construct Prompt for Gemma
    prompt = f"""
Based on the following aggregated aspect sentiment data from customer reviews:

{prompt_data_str}

Please perform the following tasks:
1. Identify and list the top {top_n_pros} most significant "Pros" (primarily positive aspects, consider frequency).
2. Identify and list the top {top_n_cons} most significant "Cons" (primarily negative aspects, consider frequency).
3. Write a concise and brief overall summary paragraph based on these pros and cons.

Your response MUST be a single, valid JSON object with the following keys:
- "pros": A list of strings, where each string describes a pro (include aspect and positive frequency if relevant).
- "cons": A list of strings, where each string describes a con (include aspect and negative frequency if relevant).
- "summary_paragraph": A string containing the overall summary.

Example of desired JSON output:
{{
  "pros": ["Battery life is highly praised (25 positive mentions).", "The price offers great value (30 positive mentions)."],
  "cons": ["Screen quality is a common concern (15 negative mentions).", "Customer service issues were reported (10 negative mentions)."],
  "summary_paragraph": "Overall, customers appreciate the excellent battery life and value, though some had concerns regarding screen quality and customer service."
}}

JSON Response:
"""
    print(f"\n--- Sending prompt to Gemma ({GEMMA_MODEL_NAME}) ---")

    try:
        generation_config = genai.types.GenerationConfig(
            temperature=0.2,
        )

        # Generate content
        response = await gemma_llm.generate_content_async(
            prompt,
            generation_config=generation_config
        )

        generated_text = response.text
        if generated_text.strip().startswith("```json"):
            generated_text = generated_text.strip()[7:]
        if generated_text.strip().endswith("```"):
            generated_text = generated_text.strip()[:-3]

        parsed_summary_data = json.loads(generated_text.strip())
        print("--- Received and parsed JSON response from Gemma ---")

        return FinalSummary(**parsed_summary_data)

    except Exception as e:
        print(f"Error during Gemma interaction or parsing: {e}")
        if hasattr(e, 'response') and hasattr(e.response, 'prompt_feedback'):
            print(f"Gemma Prompt Feedback: {e.response.prompt_feedback}")
            error_detail = f"LLM generation issue: {e.response.prompt_feedback}"
        else:
            error_detail = str(e)
        import traceback;
        traceback.print_exc()
        return FinalSummary(pros=[], cons=[], summary_paragraph=f"Error generating summary via LLM: {error_detail}")

# --- API Endpoint ---
@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_reviews(request_data: ReviewRequest):
    global absa_pipeline
    if absa_pipeline is None:
        raise HTTPException(status_code=503, detail="BERT ABSA Model not loaded or unavailable.")
    if not request_data.reviews:
        raise HTTPException(status_code=400, detail="No reviews provided.")

    print(f"Received {len(request_data.reviews)} reviews for BERT analysis.")
    bert_results_list: List[ReviewAspects] = []
    try:
        for review_text in request_data.reviews:
            if not review_text.strip():
                bert_results_list.append(ReviewAspects(review_text=review_text, extracted_aspects=[]))
                continue
            pipeline_output = absa_pipeline(review_text)
            current_review_aspects: List[Aspect] = []
            for entity in pipeline_output:
                entity_group = entity.get('entity_group')
                term = entity['word'].strip()
                score = round(entity['score'], 4)
                sentiment_str = "unknown"
                if entity_group and entity_group.startswith("ASP-"):
                    sentiment_code = entity_group.split("-", 1)[1]
                    if sentiment_code == "POS":
                        sentiment_str = "positive"
                    elif sentiment_code == "NEG":
                        sentiment_str = "negative"
                    elif sentiment_code == "NEU":
                        sentiment_str = "neutral"
                    current_review_aspects.append(Aspect(term=term, sentiment=sentiment_str, score=score))
            bert_results_list.append(ReviewAspects(review_text=review_text, extracted_aspects=current_review_aspects))
        print("BERT analysis complete.")

        final_summary_obj = await get_summary_from_gemma(bert_results_list)

        return AnalyzeResponse(
            analysis_results=bert_results_list,
            final_summary=final_summary_obj,
            message="Aspects, sentiments (BERT) and summary (Gemma) extracted successfully"
        )
    except Exception as e:
        print(f"Error during /analyze endpoint: {e}")
        import traceback;
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"An error occurred during analysis: {str(e)}")

# --- Health Check Endpoint ---
@app.get("/health")
async def health_check():
    return {"status": "ok", "bert_model_loaded": absa_pipeline is not None,
            "gemma_model_configured": gemma_llm is not None}

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server (BERT + Gemma) using Uvicorn...")
    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=True)