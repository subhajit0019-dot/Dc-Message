import os
import sys

# Ensure project root is in sys.path so app can be imported
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app

# Vercel WSGI entry point
# Exports 'app' for serverless execution
if __name__ == "__main__":
    app.run()

