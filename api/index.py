import os
import sys

# Ensure project root is in sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app


class IndexNormalizerMiddleware:
    """Normalizes entrypoint calls to / for rendering the web app interface."""
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get("PATH_INFO", "")
        # Only rewrite if directly calling the index entrypoint
        if path in ("/api/index", "/api/index.py", "/api", "/api/"):
            environ["PATH_INFO"] = "/"
        return self.wsgi_app(environ, start_response)


# Wrap Flask WSGI app for Vercel Serverless Function runtime
app.wsgi_app = IndexNormalizerMiddleware(app.wsgi_app)

if __name__ == "__main__":
    app.run()
