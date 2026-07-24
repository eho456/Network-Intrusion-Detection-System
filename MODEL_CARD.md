# Model Card — Network Intrusion Detection System

## Model Information

### Description
Machine learning pipeline for binary network intrusion detection trained on the UNSW-NB15 dataset. The system detects network flows as normal or attack traffic using a Random Forest classifier. XGBoost and IsolationForest were trained for comparison.

### Model Dependencies
Random Forest model depends on cikit-learn 1.x
XGBoost model depends on xgboost 2.x 
IsolationForest model implemented via scikit-learn ensemble module
Same feature engineering pipeline for all 3 

## Inputs and Outputs

### Inputs
Structured network flow records with connection-level statistics:
- Numeric features: duration, packet counts, byte counts, load, jitter, TTL values, TCP window sizes, round-trip time, connection counts
- Categorical features: protocol, service, connection state (one-hot encoded)
- Engineered features: byte asymmetry ratio, packet asymmetry ratio, bytes per packet

### Outputs
- Binary label: 0 (normal traffic) or 1 (attack traffic)
- Probability score between 0.0 and 1.0 representing attack confidence (Random Forest and XGBoost only)


## Model Data

### Training Dataset
UNSW-NB15: captures network flow from a hybrid honeypot environment at the Australian Centre for Cyber Security (ACSC), University of New South Wales.

- Training set: ~175,000 flow records
- Test set: ~82,000 flow records  
- Features: 42 original + 3 engineered = 45 total after encoding
- Attack rate: ~46%
- Data capture period: 2015
- Source: research.unsw.edu.au/projects/unsw-nb15-dataset

### Training Data Processing
1. Removed ID column
2. Filled missing values with 0
3. One-hot encoded categorical columns: proto, service, state
4. Aligned train and test column sets for unseen categories
5. Engineered three behavioral features
6. Replaced infinite values produced by ratio features with 0
7. Removed duplicate rows


## Architecture

Three models trained and evaluated:

| Model | Type | Class Imbalance Handling |
|-------|------|--------------------------|
| Random Forest | Supervised, ensemble | class_weight='balanced' |
| XGBoost | Supervised, boosted trees | scale_pos_weight |
| IsolationForest | Unsupervised, anomaly detection | contamination=0.15 |

**Selected production model: Random Forest**  
Highest recall (97.18%) and ROC-AUC (98.42%)

### Feature Engineering
Three features engineered for attacker behavioral patterns:

| Feature | Formula | Security Rationale | Importance Rank |
|---------|---------|-------------------|-----------------|
| byte_ratio | sbytes / (dbytes + 1) | Asymmetric traffic | #4 of 60+ |
| pkt_ratio | spkts / (dpkts + 1) | Unusual packet flow pattern | #5 of 60+ |
| bytes_per_pkt | (sbytes+dbytes) / (spkts+dpkts+1) | Small scanning packets vs large data transfers | #9 of 60+ |

## Evaluation

### Approach
Models evaluated on UNSW-NB15 test set (~82,000 flows) not seen during 
training. Primary evaluation metric is **recall** since detecting as many attacks as possible is more important then minimizing false alarms for intrusion detection system.

Cross-validation performed on Random Forest to verify consistent performance over overfitting

### Results

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC |
|-------|----------|-----------|--------|----|---------|
| Random Forest | 90.01% | 86.37% | 97.18% | 91.46% | 98.42% |
| XGBoost | 89.20% | 85.54% | 96.73% | 90.79% | 98.16% |
| IsolationForest (unsupervised) | 44.54% | 48.74% | 13.95% | 21.69% | 64.73% |

### Confusion Matrix Summary (Random Forest)
- True Positives (attacks correctly caught): 44,055
- True Negatives (normal correctly identified): ~30,000
- False Positives (false alarms): 6,951
- False Negatives (missed attacks): 1,277

---

## Intended Usage and Limitations

### Intended Use
Educational demonstration of an end-to-end ML-based network intrusion detection pipeline. Intended to showcase feature engineering, multi-model comparison, and trained classifier deployment.

Not intended for production security deployment without retraining on environment-specific traffic data.

### Known Limitations

**Class imbalance gap:** UNSW-NB15 has a ~46% attack rate while real networks have much lower attack rates (1–5%). At lower attack rates, the false positive rate increase reducing precision

**Blind spot with encrypted traffic:** The model operates on connection-level flow statistics and cannot inspect TLS/HTTPS traffic 

**Dataset Age:** UNSW-NB15 was captured in 2015, so newer attack techniques are not represented

**Environment:** Trained on traffic from a single controlled honeypot environment.

**No sequential modeling:** Each flow is classified independently so the model does not capture attack patterns with multiple stages


## Risks and Mitigations

**Risk:** Misinterpretation fo a real network  
**Mitigation:** Model card explicitly states intention as educational/portfolio 

**Risk:** High false positive rate in low-attack-rate environments  
**Mitigation:** Limitation is documented, and the prediction threshold can be adjusted (predict_proba()) to balance output recall/precision

**Risk:** Model trained on 2015 training data  
**Mitigation:** Limitation is documented, retraining on current traffic data recommended before real-world use
