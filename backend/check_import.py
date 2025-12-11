import sys
import traceback

try:
    print("Attempting to import backend.main...")
    from backend import main
    print("Successfully imported backend.main")
except Exception:
    print("Failed to import backend.main")
    traceback.print_exc()
    sys.exit(1)