import os
import sys

# Ensure project root is in sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app


class PreviewPathMiddleware:
    """Ensures PATH_INFO routes to /api/preview when invoked via serverless entrypoint."""
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get("PATH_INFO", "")
        if path in ("", "/", "/api", "/api/", "/api/preview.py"):
            environ["PATH_INFO"] = "/api/preview"
        return self.wsgi_app(environ, start_response)


# Wrap WSGI app for /api/preview endpoint
app.wsgi_app = PreviewPathMiddleware(app.wsgi_app)

if __name__ == "__main__":
    app.run()
