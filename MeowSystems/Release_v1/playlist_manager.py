import os
import subprocess
import glob
import sys

def download_transcripts(playlist_url, lang="en"):
    # Make output folder
    os.makedirs("transcripts", exist_ok=True)

    # Step 1: Get all videos from the playlist
    print("📋 Getting video list...")
    cmd_list = [
        "yt-dlp",
        "--flat-playlist",
        "--print", "%(id)s",
        playlist_url
    ]
    result = subprocess.run(cmd_list, capture_output=True, text=True)
    video_ids = result.stdout.strip().split("\n")

    # Step 2: Download transcripts for each video
    for idx, vid in enumerate(video_ids, 1):
        url = f"https://youtu.be/{vid}"
        print(f"📥 [{idx}/{len(video_ids)}] Downloading transcript for {url}...")
        subprocess.run([
            "yt-dlp",
            "--write-auto-sub",
            f"--sub-lang={lang}",
            "--skip-download",
            "--sub-format=vtt",
            "-o", f"transcripts/{idx:03d}.%(ext)s",
            url
        ])

    # Step 3: Convert VTT to TXT
    print("🧹 Cleaning transcripts...")
    for file in glob.glob("transcripts/*.vtt"):
        with open(file, "r", encoding="utf-8") as f:
            lines = [line for line in f if not line.strip().isdigit() and "-->" not in line]
        txt_file = file.replace(".vtt", ".txt")
        with open(txt_file, "w", encoding="utf-8") as out:
            out.write("".join(lines))
        os.remove(file)

    print("✅ All transcripts ready in the 'transcripts' folder!")
    print("➡ Upload them directly into NotebookLM.")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python playlist_manager.py PLAYLIST_URL")
        sys.exit(1)
    playlist_url = sys.argv[1]
    download_transcripts(playlist_url)
