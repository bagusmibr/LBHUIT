import csv
import json
import os
import urllib.request
from collections import defaultdict

# =========================================================================
# KONFIGURASI SCRIPT (STANDALONE VERSION)
# =========================================================================
USE_ONLINE_CSV = False 
CSV_ONLINE_URL = "MASUKKAN_LINK_PUBLISH_TO_WEB_CSV_URL_DISINI"
CSV_FILE_PATH = "Rapor_KPI.csv"
JSON_OUTPUT_PATH = "data/kpi.json"
# =========================================================================

def get_kpi_data():
    lines = []
    if USE_ONLINE_CSV:
        print("Mengunduh data secara otomatis dari Google Sheets...")
        try:
            response = urllib.request.urlopen(CSV_ONLINE_URL)
            lines = [l.decode('utf-8') for l in response.readlines()]
        except Exception as e:
            raise Exception(f"Gagal mengunduh CSV.\nDetail Error: {e}")
    else:
        print(f"Membaca data file lokal {CSV_FILE_PATH}...")
        if not os.path.exists(CSV_FILE_PATH):
            raise FileNotFoundError(f"File '{CSV_FILE_PATH}' tidak ditemukan.")
        with open(CSV_FILE_PATH, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    return lines

def process_data(lines):
    reader = csv.DictReader(lines)
    karyawan_data = defaultdict(lambda: {"divisi": "", "total_skor": 0.0, "count": 0})
    periode_bulan = "Bulan Berjalan"
    for row in reader:
        nama = row.get("Nama Illustrator")
        if not nama or not nama.strip(): continue 
        skor_str = row.get("Skor Akhir", "0").strip()
        divisi = row.get("Divisi", "").strip()
        bulan = row.get("Bulan", "").strip()
        if bulan: periode_bulan = bulan
        try: skor = float(skor_str)
        except ValueError: skor = 0.0
        karyawan_data[nama]["divisi"] = divisi
        karyawan_data[nama]["total_skor"] += skor
        karyawan_data[nama]["count"] += 1
    return karyawan_data, periode_bulan

def main():
    try:
        lines = get_kpi_data()
        karyawan_map, periode = process_data(lines)
        hasil_karyawan = []
        id_counter = 1
        for nama, data in karyawan_map.items():
            if data["count"] > 0: rata_rata = data["total_skor"] / data["count"]
            else: rata_rata = 0
            hasil_karyawan.append({
                "id": id_counter,
                "nama": nama.strip(),
                "divisi": data["divisi"],
                "posisi": "Illustrator",
                "skor": round(rata_rata, 1),
                "total_plot": data["count"]
            })
            id_counter += 1
        json_final = {"periode": periode, "karyawan": hasil_karyawan}
        os.makedirs(os.path.dirname(JSON_OUTPUT_PATH), exist_ok=True)
        with open(JSON_OUTPUT_PATH, 'w', encoding='utf-8') as f:
            json.dump(json_final, f, indent=4)
        print("✓ BERHASIL! File kpi.json telah terupdate.")
    except Exception as e:
        print(f"❌ TERJADI KESALAHAN:\n{e}")

if __name__ == "__main__":
    main()
