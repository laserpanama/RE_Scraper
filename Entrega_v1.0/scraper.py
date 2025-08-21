import csv, re, sys, time, logging
from pathlib import Path
import requests
from bs4 import BeautifulSoup

# Setup logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    filename='scraper.log',
                    filemode='w')

def log(msg):
    print(f"[Meow] {msg}", flush=True)
    logging.info(msg)

URL = "https://www.encuentra24.com/panama-es/searchresult/bienes-raices-venta-de-propiedades?regionslug=prov-panama&f_price=600000-"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}

out = Path("datos.csv")
html_dump = Path("page_dump.html")

def clean(txt):
    if not txt: return ""
    return re.sub(r"\s+", " ", txt).strip()

def get_with_retries(url, headers, retries=3, backoff_factor=0.5):
    for i in range(retries):
        try:
            log(f"Intentando descargar la página (intento {i+1}/{retries})...")
            logging.info(f"URL: {url}")
            logging.info(f"Headers: {headers}")
            r = requests.get(url, headers=headers, timeout=30)
            r.raise_for_status()
            return r
        except requests.exceptions.RequestException as e:
            log(f"Error al descargar: {e}")
            logging.error(f"Error en el intento {i+1}: {e}")
            if i < retries - 1:
                sleep_time = backoff_factor * (2 ** i)
                log(f"Esperando {sleep_time} segundos para reintentar...")
                time.sleep(sleep_time)
            else:
                log("Máximo de reintentos alcanzado. Fallo al descargar la página.")
                raise

def main():
    log("Descargando página...")
    try:
        r = get_with_retries(URL, headers)
    except requests.exceptions.RequestException:
        sys.exit(1)

    html = r.text
    html_dump.write_text(html, encoding="utf-8")

    soup = BeautifulSoup(html, "html.parser")
    rows = []

    for card in soup.find_all(["article","div"], recursive=True):
        txt = clean(card.get_text(" ", strip=True))
        if not txt: continue
        a = card.find("a", href=True)
        href = a["href"].strip() if a else ""
        if href and href.startswith("/"): href = "https://www.encuentra24.com" + href
        if not a or len(txt) < 30: continue

        title = clean(a.get_text()) if a and clean(a.get_text()) else ""
        price = ""
        m = re.search(r"(\$\s?\d[\d\.,]*)", txt)
        if m: price = clean(m.group(1))
        location = ""
        loc_candidates = re.findall(r"(Ciudad de Panamá|Panamá|Obarrio|Costa|Coronado|San Francisco|Clayton|Bella Vista|Avenida|Calle|Vía|Provincia)", txt, flags=re.I)
        if loc_candidates:
            location = clean(", ".join(list(dict.fromkeys(loc_candidates))[:2]))

        if title and href:
            rows.append({"titulo": title, "precio": price, "ubicacion": location, "link": href})

    with out.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["titulo","precio","ubicacion","link"])
        w.writeheader()
        for row in rows:
            w.writerow(row)

    log(f"Filas extraídas: {len(rows)}")
    if len(rows) == 0:
        log("No se detectaron filas. Se guardó 'page_dump.html' para inspección.")
        sys.exit(0)

if __name__ == "__main__":
    main()
