import os
import sys
import urllib.parse

# Ensure project root is in sys.path so app can be imported
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app


class VercelPathFix:
    """
    WSGI middleware to normalize PATH_INFO across Vercel rewrite and routing modes:
    1. Extracts original URI from Vercel route match groups (x-now-route-matches).
    2. Uses x-forwarded-uri / x-invoke-path if forwarded by the edge proxy.
    3. Translates /api/index entrypoint calls back to root / target endpoint.
    """
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        # 1. Match captured group in Vercel route matches (e.g. from /(.*) rewrite)
        route_matches = environ.get("HTTP_X_NOW_ROUTE_MATCHES")
        if route_matches:
            try:
                parsed = urllib.parse.parse_qs(route_matches)
                if "1" in parsed and parsed["1"]:
                    match_val = parsed["1"][0]
                    if not match_val.startswith("/"):
                        match_val = "/" + match_val
                    environ["PATH_INFO"] = match_val
            except Exception:
                pass

        # 2. Check original URI headers from Vercel edge
        orig_uri = (
            environ.get("HTTP_X_FORWARDED_URI")
            or environ.get("HTTP_X_INVOKE_PATH")
            or environ.get("HTTP_X_ORIGINAL_URI")
        )
        if orig_uri:
            path = orig_uri.split("?")[0]
            if path and not path.startswith("/api/index"):
                environ["PATH_INFO"] = path

        # 3. Fallback normalization for direct serverless function path
        path_info = environ.get("PATH_INFO", "")
        if path_info in ("/api/index", "/api/index.py", "/api", "/api/"):
            environ["PATH_INFO"] = "/"
        elif path_info.startswith("/api/index/"):
            environ["PATH_INFO"] = path_info[len("/api/index"):]
        elif path_info.startswith("/api/index.py/"):
            environ["PATH_INFO"] = path_info[len("/api/index.py"):]

        return self.wsgi_app(environ, start_response)


# Wrap Flask WSGI app for Vercel Serverless Function runtime
app.wsgi_app = VercelPathFix(app.wsgi_app)

if __name__ == "__main__":
    app.run()
