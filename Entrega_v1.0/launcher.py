import os, threading, webbrowser, time
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
import subprocess, sys

ROOT = Path(__file__).resolve().parent

def run_scraper():
    py = sys.executable
    subprocess.check_call([py, str(ROOT / "scraper.py")], cwd=str(ROOT))

def serve_and_open():
    os.chdir(str(ROOT))
    port = 8000
    def _serve():
        with HTTPServer(("127.0.0.1", port), SimpleHTTPRequestHandler) as httpd:
            httpd.serve_forever()
    t = threading.Thread(target=_serve, daemon=True)
    t.start()
    time.sleep(0.8)
    webbrowser.open(f"http://127.0.0.1:{port}/dashboard.html")

if __name__ == "__main__":
    run_scraper()
    serve_and_open()
    try:
        while True: time.sleep(1)
    except KeyboardInterrupt: pass
