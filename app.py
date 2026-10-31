import json
import os
import re
import requests
from flask import Flask, render_template, request, jsonify

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static"),
)

# Discord Components V2 constants
COMPONENTS_V2_FLAG = 1 << 15
DEFAULT_ACCENT_COLOR = 0x00A2C7
DEFAULT_WIDTH_SPACES = 22

def hex_to_int(hex_str):
    """Converts hex color string like #00A2C7 to integer, or returns None if disabled/empty."""
    if not hex_str or str(hex_str).strip().lower() in ("none", "null", "false"):
        return None
    hex_clean = str(hex_str).lstrip('#').strip()
    try:
        return int(hex_clean, 16)
    except ValueError:
        return None

def resolve_direct_image_url(url):
    """
    Resolves webpage/share URLs (Tenor, Giphy, Imgur) to direct image / GIF URLs.
    Ensures Discord Webhooks render animated GIFs, WEBP, PNG, JPG, ICO properly.
    """
    if not url or not isinstance(url, str):
        return ""
    url = url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        return url

    # 1. Tenor view link e.g. https://tenor.com/view/cat-gif-25123456 or https://tenor.com/view/25123456
    tenor_match = re.search(r'tenor\.com/view/[^/]*?-(\d+)', url) or re.search(r'tenor\.com/view/.*?(\d+)$', url)
    if tenor_match:
        gif_id = tenor_match.group(1)
        return f"https://media.tenor.com/{gif_id}/tenor.gif"

    # 2. Giphy view link e.g. https://giphy.com/gifs/cat-12345 or https://giphy.com/gifs/12345
    giphy_match = re.search(r'giphy\.com/gifs/(?:.*?-)?([a-zA-Z0-9]+)$', url)
    if giphy_match:
        gif_id = giphy_match.group(1)
        return f"https://media.giphy.com/media/{gif_id}/giphy.gif"

    # 3. Imgur view link e.g. https://imgur.com/abcde or https://imgur.com/gallery/abcde
    imgur_match = re.search(r'imgur\.com/(?:gallery/)?([a-zA-Z0-9]+)$', url)
    if imgur_match and not url.lower().endswith(('.gif', '.png', '.jpg', '.jpeg', '.webp', '.ico')):
        img_id = imgur_match.group(1)
        return f"https://i.imgur.com/{img_id}.gif"

    return url

def build_components_v2_payload(
    title,
    main_content,
    price_text,
    buttons_data,
    expand_width=True,
    width_spaces=22,
    thumbnail_url="",
    banner_url="",
    username="",
    avatar_url="",
    accent_color=DEFAULT_ACCENT_COLOR,
    price_prefix="Price: ",
    price_subtext=True,
    show_divider=True
):
    """
    Builds a Discord Components V2 message layout (Container + TextDisplay +
    Media + Separator + ActionRow with link buttons side-by-side).
    """
    # Resolve direct GIF, WEBP, PNG, JPG, ICO, and Tenor/Giphy share URLs
    thumbnail_url = resolve_direct_image_url(thumbnail_url)
    banner_url = resolve_direct_image_url(banner_url)
    avatar_url = resolve_direct_image_url(avatar_url)

    container_children = []

    # Invisible padding to adjust container width in Discord UI (U+2800 Braille space)
    try:
        w_spaces = int(width_spaces)
    except (ValueError, TypeError):
        w_spaces = DEFAULT_WIDTH_SPACES

    padding = ("⠀" * w_spaces) if expand_width and w_spaces > 0 else ""

    # 1. Heading & Optional Thumbnail Image (Section component type 9 with Type 11 Thumbnail accessory)
    if title and title.strip():
        header_text = f"# {title.strip()}"
        if padding:
            header_text += f" {padding}"

        if thumbnail_url and (thumbnail_url.startswith("http://") or thumbnail_url.startswith("https://")):
            container_children.append({
                "type": 9,  # Section
                "components": [
                    {"type": 10, "content": header_text}
                ],
                "accessory": {
                    "type": 11,  # Thumbnail
                    "media": {
                        "url": thumbnail_url.strip()
                    }
                }
            })
        else:
            container_children.append({"type": 10, "content": header_text})
    elif padding:
        container_children.append({"type": 10, "content": padding})

    # 2. Main Content (TextDisplay, full width)
    if main_content and main_content.strip():
        container_children.append({"type": 10, "content": main_content.strip()})

    # 3. Banner Image / Media Component (Type 12) above Price & Buttons
    if banner_url and (banner_url.startswith("http://") or banner_url.startswith("https://")):
        container_children.append({
            "type": 12,  # Media Gallery
            "items": [
                {
                    "media": {
                        "url": banner_url.strip()
                    }
                }
            ]
        })

    # 4. Price & Footer Subtext (with custom prefix and subtext toggle)
    if price_text and price_text.strip():
        if show_divider:
            container_children.append({"type": 14, "divider": True, "spacing": 1})  # Separator
        prefix_str = price_prefix if price_prefix is not None else "Price: "
        full_price_line = f"{prefix_str}{price_text.strip()}"
        if price_subtext:
            full_price_line = f"-# {full_price_line}"
        container_children.append({"type": 10, "content": full_price_line})

    # 5. Action Row containing Link buttons placed side-by-side
    action_row_components = []
    for btn in buttons_data:
        btn_label = btn.get("label", "").strip()
        btn_url = btn.get("url", "").strip()
        if btn_label and btn_url:
            btn_comp = {
                "type": 2,   # Button component
                "style": 5,  # Link button (opens URL)
                "label": btn_label,
                "url": btn_url
            }

            # Check if button contains custom Discord emoji (<:name:id> or <a:name:id>)
            emoji_match = re.search(r'<(a)?:([a-zA-Z0-9_]+):(\d+)>', btn_label)
            if emoji_match:
                is_animated = bool(emoji_match.group(1))
                e_name = emoji_match.group(2)
                e_id = emoji_match.group(3)
                btn_comp["emoji"] = {
                    "id": e_id,
                    "name": e_name,
                    "animated": is_animated
                }
                cleaned_label = re.sub(r'<(a)?:[a-zA-Z0-9_]+:\d+>', '', btn_label).strip()
                btn_comp["label"] = cleaned_label if cleaned_label else e_name
            elif "emoji" in btn and isinstance(btn["emoji"], dict):
                btn_comp["emoji"] = btn["emoji"]

            action_row_components.append(btn_comp)

    if action_row_components:
        if show_divider:
            container_children.append({"type": 14, "divider": True, "spacing": 1})  # Separator
        container_children.append({
            "type": 1,  # Action Row (all buttons inside type 1 are placed side-by-side)
            "components": action_row_components
        })

    # Wrap everything inside one Container (the V2 replacement for an embed card)
    container = {
        "type": 17,  # Container
        "components": container_children
    }

    # Set accent_color only if enabled and valid
    if accent_color is not None and str(accent_color).strip().lower() not in ("", "none", "null", "false"):
        color_val = accent_color if isinstance(accent_color, int) else hex_to_int(accent_color)
        if color_val is not None:
            container["accent_color"] = color_val

    payload = {
        "flags": COMPONENTS_V2_FLAG,
        "components": [container]
    }

    if username and username.strip():
        payload["username"] = username.strip()

    if avatar_url and avatar_url.strip():
        payload["avatar_url"] = avatar_url.strip()

    return payload

def validate_data(data):
    """Validates incoming payload parameters."""
    webhook_url = data.get("webhook_url", "").strip()
    if not webhook_url:
        return "Please enter a valid Discord Webhook URL."
    if not (webhook_url.startswith("https://discord.com/api/webhooks/") or 
            webhook_url.startswith("https://discordapp.com/api/webhooks/") or
            webhook_url.startswith("https://canary.discord.com/api/webhooks/")):
        return "URL must be a valid Discord Webhook endpoint."

    thumbnail_url = data.get("thumbnail_url", "").strip()
    if thumbnail_url and not (thumbnail_url.startswith("http://") or thumbnail_url.startswith("https://")):
        return "Thumbnail Image URL must start with http:// or https://"

    banner_url = data.get("banner_url", "").strip()
    if banner_url and not (banner_url.startswith("http://") or banner_url.startswith("https://")):
        return "Banner Image URL must start with http:// or https://"

    avatar_url = data.get("avatar_url", "").strip()
    if avatar_url and not (avatar_url.startswith("http://") or avatar_url.startswith("https://")):
        return "Avatar Image URL must start with http:// or https://"

    buttons = data.get("buttons_data", [])
    for idx, btn in enumerate(buttons, start=1):
        lbl = btn.get("label", "").strip()
        url = btn.get("url", "").strip()
        if lbl and not (url.startswith("http://") or url.startswith("https://")):
            return f"Button {idx} URL must start with http:// or https://"

    return None

@app.route("/")
@app.route("/api/index")
@app.route("/api")
def index():
    """Renders the main web app interface."""
    return render_template("index.html")

@app.route("/api/preview", methods=["POST"])
def api_preview():
    """Returns the generated Components V2 payload JSON for live preview."""
    data = request.json or {}
    enable_accent = data.get("enable_accent_color", True)
    raw_accent = data.get("accent_color")
    accent_val = None if (not enable_accent or raw_accent in (None, "", "none", "null", False)) else raw_accent

    payload = build_components_v2_payload(
        title=data.get("title", ""),
        main_content=data.get("main_content", ""),
        price_text=data.get("price_text", ""),
        buttons_data=data.get("buttons_data", []),
        expand_width=data.get("expand_width", True),
        width_spaces=data.get("width_spaces", 22),
        thumbnail_url=data.get("thumbnail_url", ""),
        banner_url=data.get("banner_url", ""),
        username=data.get("username", ""),
        avatar_url=data.get("avatar_url", ""),
        accent_color=accent_val,
        price_prefix=data.get("price_prefix", "Price: "),
        price_subtext=data.get("price_subtext", True),
        show_divider=data.get("show_divider", True)
    )
    return jsonify({"success": True, "payload": payload})

@app.route("/api/send", methods=["POST"])
def api_send():
    """Validates inputs, builds payload, and sends to Discord Webhook."""
    data = request.json or {}
    
    error = validate_data(data)
    if error:
        return jsonify({"success": False, "error": error}), 400

    webhook_url = data.get("webhook_url", "").strip()
    enable_accent = data.get("enable_accent_color", True)
    raw_accent = data.get("accent_color")
    accent_val = None if (not enable_accent or raw_accent in (None, "", "none", "null", False)) else raw_accent

    payload = build_components_v2_payload(
        title=data.get("title", ""),
        main_content=data.get("main_content", ""),
        price_text=data.get("price_text", ""),
        buttons_data=data.get("buttons_data", []),
        expand_width=data.get("expand_width", True),
        width_spaces=data.get("width_spaces", 22),
        thumbnail_url=data.get("thumbnail_url", ""),
        banner_url=data.get("banner_url", ""),
        username=data.get("username", ""),
        avatar_url=data.get("avatar_url", ""),
        accent_color=accent_val,
        price_prefix=data.get("price_prefix", "Price: "),
        price_subtext=data.get("price_subtext", True),
        show_divider=data.get("show_divider", True)
    )

    try:
        # Webhooks require ?with_components=true for the components field to be honored
        response = requests.post(
            webhook_url,
            params={"with_components": "true"},
            json=payload,
            timeout=15
        )
        if response.status_code in [200, 204]:
            return jsonify({
                "success": True,
                "message": "Components V2 message sent successfully to Discord!",
                "status_code": response.status_code
            })
        else:
            return jsonify({
                "success": False,
                "error": f"Discord API Error ({response.status_code}): {response.text[:500]}",
                "status_code": response.status_code
            }), 400
    except requests.exceptions.RequestException as e:
        return jsonify({"success": False, "error": f"Connection Error: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 25578))
    print(f"=== Discord Webhook Sender Web App running on http://uptimes.hexacloud.qzz.io:{port} (http://127.0.0.1:{port}) ===")
    app.run(host="0.0.0.0", port=port, debug=True)


