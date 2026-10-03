"""
Master One-Click Launcher for VERIDOC AI (SIH 26188)
Starts both Flask Backend (port 5000) and Vite Frontend (port 5173) simultaneously.
"""

import os
import sys
import subprocess
import time
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).parent.resolve()

# Locate Python environment
VENV_PYTHON = ROOT_DIR / "document-tampering-ai" / ".venv" / "Scripts" / "python.exe"
if not VENV_PYTHON.exists():
    VENV_PYTHON = ROOT_DIR / ".venv" / "Scripts" / "python.exe"
if not VENV_PYTHON.exists():
    VENV_PYTHON = Path(sys.executable)


def main():
    print("=" * 70)
    print("  VERIDOC AI — AI-BASED FAKE IDENTITY & DOCUMENT SCREENING SYSTEM  ")
    print("  Smart India Hackathon (SIH 26188) Prototype  ")
    print("=" * 70)

    # 1. Launch Flask Backend
    print(f"[1/3] Starting Python Forensic Backend on http://127.0.0.1:5000 ...")
    backend_cmd = [str(VENV_PYTHON), "backend/server.py"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=str(ROOT_DIR))

    # Give backend a moment to boot engines
    time.sleep(2.5)

    # 2. Launch Vite Frontend
    print("[2/3] Starting Vite Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=str(ROOT_DIR))

    time.sleep(2)
    print("[3/3] System Ready! Opening browser at http://localhost:5173 ...")
    print("-" * 70)
    print("Press Ctrl+C anytime to stop both services.")
    print("-" * 70)

    try:
        webbrowser.open("http://localhost:5173")
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping services...")
    finally:
        try:
            backend_proc.terminate()
        except Exception:
            pass
        try:
            frontend_proc.terminate()
        except Exception:
            pass


if __name__ == "__main__":
    main()
