"""
Defines the metric computation function for evaluating the ABSA model,
now handling richer BIO-Sentiment tags.
"""
import numpy as np

try:
    from seqeval.metrics import classification_report
    SEQEVAL_AVAILABLE = True
except ImportError:
    print("Warning: seqeval library not found. Metrics calculation will be basic (zeros).")
    SEQEVAL_AVAILABLE = False
    def classification_report(y_true, y_pred, output_dict=True, zero_division=0): return {}


def compute_absa_metrics(eval_pred, id2label_map):
    """
    Computes precision, recall, F1 for token classification using seqeval.
    Now expects id2label_map for the richer BIO-Sentiment tags.
    """
    predictions_logits, true_label_ids = eval_pred
    predicted_label_ids = np.argmax(predictions_logits, axis=2)

    actual_predictions_str = []
    actual_labels_str = []

    for preds_for_sentence, labels_for_sentence in zip(predicted_label_ids, true_label_ids):
        temp_preds = []
        temp_labels = []
        for pred_id, label_id in zip(preds_for_sentence, labels_for_sentence):
            if label_id != -100:
                if label_id in id2label_map and pred_id in id2label_map:
                     temp_labels.append(id2label_map[label_id])
                     temp_preds.append(id2label_map[pred_id])
        if temp_labels:
            actual_predictions_str.append(temp_preds)
            actual_labels_str.append(temp_labels)

    if not actual_labels_str or not SEQEVAL_AVAILABLE:
        # Return metrics for all expected entity types
        all_results = {"precision": 0.0, "recall": 0.0, "f1": 0.0}
        for pol in ["POS", "NEG", "NEU"]:
            all_results[f"f1_ASP-{pol}"] = 0.0
        return all_results

    results = {}
    try:
        report = classification_report(
            actual_labels_str, actual_predictions_str,
            output_dict=True, zero_division=0
        )
        micro_avg_report = report.get("micro avg", {}) # Overall token-level performance
        results["precision"] = micro_avg_report.get("precision", 0.0)
        results["recall"] = micro_avg_report.get("recall", 0.0)
        results["f1"] = micro_avg_report.get("f1-score", 0.0)

        # Extract F1 for each aspect-sentiment type
        for pol in ["POS", "NEG", "NEU"]:
            entity_type = f"ASP-{pol}"
            entity_report = report.get(entity_type, {})
            results[f"f1_{entity_type}"] = entity_report.get("f1-score", 0.0)

    except Exception as e:
        print(f"Error calculating classification_report: {e}")
        results = {"precision": 0.0, "recall": 0.0, "f1": 0.0}
        for pol in ["POS", "NEG", "NEU"]: results[f"f1_ASP-{pol}"] = 0.0
    return results

if __name__ == '__main__':
    pass