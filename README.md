# Network-Intrusion-Detection-System

## Model

Evaluated on UNSW-NB15 test set from ... with recall as the primary metric.

| Model | Recall | F1 | ROC-AUC |
|-------|--------|----|---------|
| Random Forest | 97.18% | 91.46% | 98.42% |
| XGBoost | 96.73% | 90.79% | 98.16% |
| IsolationForest (unsupervised) | 13.95% | 21.69% | 64.73% |

Chosen model: Random Forest
    - Highest recall and F1

Engineered features (byte_ratio, pkt_ratio, bytes_per_pkt, is_zero_dur, jit_ratio) were initially evaluated through log-scale distribution analysis. byte_ratio, pkt_ratio, and bytes_per_pkt showed meaningful differences between attack and normal traffic. is_zero_dur and jit_ratio exhibited nearly identical distributions across classes, and were removed before model training to reduce unnecessary complexity.