"""
check_environment.py

Run this once after installing requirements.txt to confirm that all
required libraries are installed correctly and to see whether PyTorch
can find a CUDA-capable GPU on this machine.

Usage:
    python check_environment.py
"""

import sys


def check_import(module_name, pip_name=None):
    pip_name = pip_name or module_name
    try:
        module = __import__(module_name)
        version = getattr(module, "__version__", "unknown version")
        print(f"[OK]   {module_name:<15} {version}")
        return True
    except ImportError:
        print(f"[FAIL] {module_name:<15} not installed (pip install {pip_name})")
        return False


def main():
    print(f"Python version: {sys.version.split()[0]}")
    print("-" * 50)

    all_ok = True
    all_ok &= check_import("torch")
    all_ok &= check_import("torchvision")
    all_ok &= check_import("cv2", "opencv-python")
    all_ok &= check_import("PIL", "Pillow")
    all_ok &= check_import("numpy")
    all_ok &= check_import("sklearn", "scikit-learn")
    all_ok &= check_import("matplotlib")
    all_ok &= check_import("tqdm")

    print("-" * 50)

    if not all_ok:
        print("Some packages are missing. Run: pip install -r requirements.txt")
        sys.exit(1)

    import torch

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Selected device: {device}")

    if torch.cuda.is_available():
        print(f"GPU name: {torch.cuda.get_device_name(0)}")
        print(f"CUDA version (PyTorch built with): {torch.version.cuda}")
    else:
        print("No CUDA GPU detected — training will run on CPU (slower, "
              "but fine for the small sanity tests in the early steps).")

    print("-" * 50)
    print("Environment check complete. Everything needed for Step 1 is in place.")


if __name__ == "__main__":
    main()
