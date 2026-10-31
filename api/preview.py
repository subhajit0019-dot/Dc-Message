import os
import sys

# Ensure project root is in sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app as flask_app


def preview_handler(environ, start_response):
    """Ensures PATH_INFO routes to /api/preview when invoked via serverless entrypoint."""
    path = environ.get("PATH_INFO", "")
    if path in ("", "/", "/api", "/api/", "/api/preview.py"):
        env = dict(environ)
        env["PATH_INFO"] = "/api/preview"
        return flask_app(env, start_response)
    return flask_app(environ, start_response)


# Export callable for Vercel Serverless Function runtime
app = preview_handler

if __name__ == "__main__":
    flask_app.run()
