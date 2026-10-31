import os
import sys
import urllib.parse

# Ensure project root is in sys.path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from app import app as flask_app


def index_handler(environ, start_response):
    """
    Robust WSGI handler for Vercel Serverless Function runtime.
    Restores the real request path from Vercel's rewrite query params or HTTP headers
    so Flask correctly serves the HTML, static CSS/JS assets, and API routes.
    """
    env = dict(environ)
    query_string = env.get("QUERY_STRING", "")
    parsed_qs = urllib.parse.parse_qs(query_string)

    # 1. Check if rewritten with __vercel_subpath
    if "__vercel_subpath" in parsed_qs:
        raw_subpath = parsed_qs["__vercel_subpath"][0]
        if not raw_subpath.startswith("/"):
            raw_subpath = "/" + raw_subpath
        if not raw_subpath.startswith("/static/"):
            raw_subpath = "/static" + (raw_subpath if raw_subpath.startswith("/") else "/" + raw_subpath)
        env["PATH_INFO"] = raw_subpath

        # Clean up __vercel_subpath from QUERY_STRING so Flask route params stay clean
        filtered_params = {k: v for k, v in parsed_qs.items() if k != "__vercel_subpath"}
        env["QUERY_STRING"] = urllib.parse.urlencode(filtered_params, doseq=True)

    else:
        # 2. Check headers passed by Vercel Edge proxy
        forwarded_uri = (
            env.get("HTTP_X_FORWARDED_URI")
            or env.get("RAW_URI")
            or env.get("REQUEST_URI")
            or ""
        )
        forwarded_path = forwarded_uri.split("?")[0]
        if forwarded_path.startswith("/static/"):
            env["PATH_INFO"] = forwarded_path
        else:
            path = env.get("PATH_INFO", "")
            if path in ("", "/api/index", "/api/index.py", "/api", "/api/"):
                env["PATH_INFO"] = "/"

    return flask_app(env, start_response)


# Export callable for Vercel Serverless Function runtime
app = index_handler

if __name__ == "__main__":
    flask_app.run()
