"""
Defines the metric computation function for evaluating the ABSA model.
"""
import numpy as np

try:
    from seqeval.metrics import classification_report

    SEQEVAL_AVAILABLE = True
except ImportError:
    print("Warning: seqeval library not found. Metrics calculation will be basic (zeros).")
    SEQEVAL_AVAILABLE = False


    def classification_report(y_true, y_pred, output_dict=True, zero_division=0):
        return {}

def compute_absa_metrics(eval_pred, id2label_map):
    """
    Computes precision, recall, F1 for token classification using seqeval.
    Args:
        eval_pred: An EvalPrediction object (tuple) containing predictions (logits)
                   and true label_ids.
        id2label_map: Dictionary mapping numerical label IDs to string labels.
    Returns:
        A dictionary with evaluation metrics.
    """
    predictions_logits, true_label_ids = eval_pred
    predicted_label_ids = np.argmax(predictions_logits, axis=2)

    actual_predictions = []
    actual_labels = []

    for preds_for_sentence, labels_for_sentence in zip(predicted_label_ids, true_label_ids):
        temp_preds = []
        temp_labels = []
        for pred_id, label_id in zip(preds_for_sentence, labels_for_sentence):
            if label_id != -100:  # Only consider non-ignored labels
                if label_id in id2label_map and pred_id in id2label_map:
                    temp_labels.append(id2label_map[label_id])
                    temp_preds.append(id2label_map[pred_id])
        if temp_labels:
            actual_predictions.append(temp_preds)
            actual_labels.append(temp_labels)

    if not actual_labels or not SEQEVAL_AVAILABLE:
        return {"precision": 0.0, "recall": 0.0, "f1": 0.0, "f1_ASP": 0.0}

    results = {}
    try:
        report = classification_report(
            actual_labels, actual_predictions,
            output_dict=True, zero_division=0
        )
        # Using .get() for safe dictionary access
        micro_avg_report = report.get("micro avg", {})
        results["precision"] = micro_avg_report.get("precision", 0.0)
        results["recall"] = micro_avg_report.get("recall", 0.0)
        results["f1"] = micro_avg_report.get("f1-score", 0.0)

        asp_report = report.get("ASP", {})  # 'ASP' is derived by seqeval from B-ASP, I-ASP
        results["f1_ASP"] = asp_report.get("f1-score", 0.0)

    except Exception as e:
        print(f"Error calculating classification_report: {e}")
        results = {"precision": 0.0, "recall": 0.0, "f1": 0.0, "f1_ASP": 0.0}
    return results

if __name__ == '__main__':
    pass