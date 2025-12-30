#!/usr/bin/env python
# ==========================================
# 🎓 CampusPath AI Prediction Script (UM Jember)
# ==========================================
# Membaca JSON input dari PHP (via stdin)
# Mengembalikan top-3 rekomendasi jurusan
# ==========================================

import sys, json, os, traceback
import numpy as np
import joblib

# === Path dasar (otomatis menyesuaikan lokasi file) ===
BASE_DIR = os.path.dirname(__file__) or '.'
MODEL_DIR = os.path.join(BASE_DIR, 'model')

KNN_FILE = os.path.join(MODEL_DIR, 'CampusPath_KNN_Model.pkl')
ENC_FILE = os.path.join(MODEL_DIR, 'CampusPath_LabelEncoder.pkl')
SCL_FILE = os.path.join(MODEL_DIR, 'CampusPath_Scaler.pkl')

# === Fungsi utama ===
def main():
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw)
    except Exception as e:
        print(json.dumps({
            "error": "Gagal membaca input JSON",
            "debug": str(e)
        }))
        return

    # Urutkan fitur sesuai 30 pertanyaan (p1 - p30)
    try:
        features = [float(payload.get(f"p{i}", 0)) for i in range(1, 31)]
        X_input = np.array([features], dtype=float)
    except Exception as e:
        print(json.dumps({
            "error": "Format input tidak valid",
            "debug": str(e)
        }))
        return

    # === Load model, encoder, dan scaler ===
    try:
        knn = joblib.load(KNN_FILE)
        encoder = joblib.load(ENC_FILE)
        scaler = joblib.load(SCL_FILE)
    except Exception as e:
        print(json.dumps({
            "error": "Gagal memuat model/encoder/scaler",
            "debug": str(e)
        }))
        return

    # === Normalisasi input seperti saat training ===
    try:
        X_scaled = scaler.transform(X_input)
    except Exception as e:
        X_scaled = X_input  # fallback jika scaler tidak ada
        debug_note = f"Scaler gagal digunakan: {e}"
    else:
        debug_note = "Scaler OK"

    # === Prediksi jurusan dengan KNN ===
    try:
        if hasattr(knn, "predict_proba"):
            probs = knn.predict_proba(X_scaled)[0]
            classes = knn.classes_

            # Decode label kembali ke nama jurusan
            labels = encoder.inverse_transform(classes)

            # Urutkan berdasarkan probabilitas tertinggi
            top3_idx = np.argsort(probs)[::-1][:3]
            top3 = [[str(labels[i]), float(probs[i])] for i in top3_idx]

            print(json.dumps({
                "top3": top3,
                "debug": debug_note + " + predict_proba OK"
            }))
            return
        else:
            # Jika tidak ada predict_proba, pakai tetangga terdekat
            pred = knn.predict(X_scaled)[0]
            jurusan = encoder.inverse_transform([pred])[0]
            top3 = [[jurusan, 1.0]]
            print(json.dumps({
                "top3": top3,
                "debug": debug_note + " + predict tanpa prob"
            }))
            return

    except Exception as e:
        print(json.dumps({
            "error": "Prediksi gagal",
            "debug": str(e)
        }))
        return


if __name__ == "__main__":
    main()
