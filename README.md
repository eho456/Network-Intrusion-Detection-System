# Network-Intrusion-Detection-System


Engineered features (byte_ratio, pkt_ratio, bytes_per_pkt, is_zero_dur, jit_ratio) were initially evaluated through log-scale distribution analysis. While byte_ratio, pkt_ratio, and bytes_per_pkt showed meaningful differences between attack and normal traffic, is_zero_dur and jit_ratio exhibited nearly identical distributions across classes. These two features were therefore removed before model training to reduce unnecessary complexity.