import tkinter as tk
from tkinter import messagebox, Toplevel, filedialog
import requests
import json
import re

# ==========================================
# Discord Components V2 constants
# ==========================================
COMPONENTS_V2_FLAG = 1 << 15
ACCENT_COLOR = 0x00A2C7
DEFAULT_WIDTH_SPACES = 22


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

    # 1. Tenor view link
    tenor_match = re.search(r'tenor\.com/view/[^/]*?-(\d+)', url) or re.search(r'tenor\.com/view/.*?(\d+)$', url)
    if tenor_match:
        gif_id = tenor_match.group(1)
        return f"https://media.tenor.com/{gif_id}/tenor.gif"

    # 2. Giphy view link
    giphy_match = re.search(r'giphy\.com/gifs/(?:.*?-)?([a-zA-Z0-9]+)$', url)
    if giphy_match:
        gif_id = giphy_match.group(1)
        return f"https://media.giphy.com/media/{gif_id}/giphy.gif"

    # 3. Imgur view link
    imgur_match = re.search(r'imgur\.com/(?:gallery/)?([a-zA-Z0-9]+)$', url)
    if imgur_match and not url.lower().endswith(('.gif', '.png', '.jpg', '.jpeg', '.webp', '.ico')):
        img_id = imgur_match.group(1)
        return f"https://i.imgur.com/{img_id}.gif"

    return url


def format_features(text):
    """
    Converts raw text from a Text widget into a Discord formatted bullet list.
    """
    if not text.strip():
        return ""
    lines = text.strip().split('\n')
    return "\n".join([f"• {line.strip()}" for line in lines if line.strip()])


def build_components_v2_payload(title, main_content, price_text, buttons_data,
                                expand_width=True, width_spaces=22, thumbnail_url="", show_divider=True):
    """
    Builds a Discord Components V2 message layout (Container + TextDisplay +
    Media + Separator + ActionRow with link buttons side-by-side).
    """
    thumbnail_url = resolve_direct_image_url(thumbnail_url)
    container_children = []

    # Invisible padding to adjust container width in Discord UI
    padding = ("⠀" * width_spaces) if expand_width and width_spaces > 0 else ""

    # 1. Heading & Optional Thumbnail Image (Section component type 9 with Type 11 Thumbnail accessory)
    if title:
        header_text = f"# {title}"
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
                        "url": thumbnail_url
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

    # 3. Price shown as a subtext footer (separated by a divider if enabled)
    if price_text:
        if show_divider:
            container_children.append({"type": 14, "divider": True, "spacing": 1})  # Separator
        container_children.append({"type": 10, "content": f"-# Price: {price_text}"})

    # 4. Action Row containing Link buttons placed side-by-side
    action_row_components = []
    for btn_label, btn_url in buttons_data:
        if btn_label and btn_url:
            action_row_components.append({
                "type": 2,   # Button component
                "style": 5,  # Link button (opens URL)
                "label": btn_label,
                "url": btn_url
            })

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
        "accent_color": ACCENT_COLOR,
        "components": container_children
    }

    return {
        "flags": COMPONENTS_V2_FLAG,
        "components": [container]
    }


def collect_inputs():
    """Reads all fields from the UI and returns them as a dict."""
    try:
        w_val = int(width_spinbox.get())
    except Exception:
        w_val = DEFAULT_WIDTH_SPACES

    buttons_data = []
    for lbl_ent, url_ent in button_entries:
        lbl = lbl_ent.get().strip()
        url = url_ent.get().strip()
        if lbl and url:
            buttons_data.append((lbl, url))

    return {
        "webhook_url": webhook_entry.get().strip(),
        "title": title_entry.get().strip(),
        "thumbnail_url": thumbnail_entry.get().strip(),
        "main_content": content_text.get("1.0", tk.END).strip(),
        "price_text": price_entry.get().strip(),
        "buttons_data": buttons_data,
        "expand_width": expand_width_var.get(),
        "show_divider": show_divider_var.get() if "show_divider_var" in globals() else True,
        "width_spaces": w_val,
    }


def validate_inputs(data):
    """Validates the gathered inputs. Returns an error message or None."""
    if not data["webhook_url"]:
        return "Please enter a valid Discord Webhook URL."

    if data["thumbnail_url"] and not (data["thumbnail_url"].startswith("http://") or data["thumbnail_url"].startswith("https://")):
        return "Thumbnail Image URL must start with http:// or https://"

    for idx, (lbl, url) in enumerate(data.get("buttons_data", []), start=1):
        if lbl and not (url.startswith("http://") or url.startswith("https://")):
            return f"Button {idx} URL must start with http:// or https://"

    return None


def send_webhook():
    """
    Validates inputs, builds the Components V2 payload, and sends it to Discord.
    """
    data = collect_inputs()

    error = validate_inputs(data)
    if error:
        messagebox.showerror("Error", error)
        return

    if not data["title"]:
        data["title"] = "Mod Menu"

    payload = build_components_v2_payload(
        data["title"], data["main_content"], data["price_text"],
        data["buttons_data"],
        expand_width=data["expand_width"],
        width_spaces=data["width_spaces"],
        thumbnail_url=data["thumbnail_url"]
    )

    send_btn.config(state=tk.DISABLED, text="Sending...")

    try:
        # Webhooks require ?with_components=true for the components field to be honored.
        response = requests.post(
            data["webhook_url"],
            params={"with_components": "true"},
            json=payload,
            timeout=15,
        )
        if response.status_code in [200, 204]:
            status_label.config(text="Components V2 message sent successfully!", fg="#00C2DF")
        else:
            status_label.config(text=f"Discord API Error: {response.status_code} - {response.text[:300]}", fg="red")
    except Exception as e:
        status_label.config(text=f"Connection Error: {str(e)}", fg="red")
    finally:
        send_btn.config(state=tk.NORMAL, text="Send Webhook")


def preview_payload():
    """Shows the exact Components V2 JSON that will be posted to Discord."""
    data = collect_inputs()

    error = validate_inputs(data)
    if error:
        messagebox.showerror("Error", error)
        return

    if not data["title"]:
        data["title"] = "Mod Menu"

    payload = build_components_v2_payload(
        data["title"], data["main_content"], data["price_text"],
        data["buttons_data"],
        expand_width=data["expand_width"],
        width_spaces=data["width_spaces"],
        thumbnail_url=data["thumbnail_url"]
    )

    win = Toplevel(root)
    win.title("Components V2 Payload Preview")
    win.geometry("580x440")

    txt = tk.Text(win, wrap="none", font=("Consolas", 9))
    txt.pack(fill=tk.BOTH, expand=True, padx=8, pady=8)
    txt.insert("1.0", json.dumps(payload, indent=2, ensure_ascii=False))
    txt.config(state=tk.DISABLED)


def export_config():
    """Exports current UI configuration to a JSON file with custom filename."""
    data = collect_inputs()
    default_name = "discord_webhook_config.json"
    if data.get("title"):
        slug = "".join(c if c.isalnum() else "_" for c in data["title"].lower()).strip("_")
        if slug:
            default_name = f"discord_{slug}.json"

    filepath = filedialog.asksaveasfilename(
        defaultextension=".json",
        filetypes=[("JSON Files", "*.json"), ("All Files", "*.*")],
        initialfile=default_name,
        title="Export Configuration JSON"
    )
    if filepath:
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            messagebox.showinfo("Export Successful", f"Configuration exported to:\n{filepath}")
        except Exception as e:
            messagebox.showerror("Export Error", f"Could not save file: {e}")


def import_config():
    """Imports configuration from a selected JSON file into UI fields."""
    filepath = filedialog.askopenfilename(
        filetypes=[("JSON Files", "*.json"), ("All Files", "*.*")],
        title="Import Configuration JSON"
    )
    if filepath:
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)
            if "webhook_url" in data:
                webhook_entry.delete(0, tk.END)
                webhook_entry.insert(0, data.get("webhook_url", ""))
            if "title" in data:
                title_entry.delete(0, tk.END)
                title_entry.insert(0, data.get("title", ""))
            if "thumbnail_url" in data:
                thumbnail_entry.delete(0, tk.END)
                thumbnail_entry.insert(0, data.get("thumbnail_url", ""))
            if "main_content" in data:
                content_text.delete("1.0", tk.END)
                content_text.insert("1.0", data.get("main_content", ""))
            if "price_text" in data:
                price_entry.delete(0, tk.END)
                price_entry.insert(0, data.get("price_text", ""))
            if "buttons_data" in data:
                for idx, (lbl_ent, url_ent) in enumerate(button_entries):
                    lbl_ent.delete(0, tk.END)
                    url_ent.delete(0, tk.END)
                    if idx < len(data["buttons_data"]):
                        btn_info = data["buttons_data"][idx]
                        if isinstance(btn_info, (list, tuple)):
                            lbl_ent.insert(0, btn_info[0])
                            url_ent.insert(0, btn_info[1])
                        elif isinstance(btn_info, dict):
                            lbl_ent.insert(0, btn_info.get("label", ""))
                            url_ent.insert(0, btn_info.get("url", ""))
            messagebox.showinfo("Import Successful", "Configuration loaded from JSON file!")
        except Exception as e:
            messagebox.showerror("Import Error", f"Failed to load JSON file: {e}")



# ==========================================
# Tkinter UI Setup
# ==========================================
root = tk.Tk()
root.title("Discord Webhook Sender (Components V2)")
root.geometry("780x850")

main_frame = tk.Frame(root, padx=20, pady=20)
main_frame.pack(fill=tk.BOTH, expand=True)

# Input Fields
# 1. Webhook
tk.Label(main_frame, text="Webhook URL:", font=("Arial", 10, "bold")).pack(anchor="w", pady=(5, 0))
webhook_entry = tk.Entry(main_frame, width=85)
webhook_entry.pack(anchor="w", pady=(0, 5))

# 2. Title
tk.Label(main_frame, text="Embed Title:", font=("Arial", 10, "bold")).pack(anchor="w", pady=(5, 0))
title_entry = tk.Entry(main_frame, width=85)
title_entry.insert(0, "Mod Menu V7A")
title_entry.pack(anchor="w", pady=(0, 5))

# 3. Thumbnail / Image URL
tk.Label(main_frame, text="Thumbnail / Image URL (Optional):", font=("Arial", 10, "bold")).pack(anchor="w", pady=(5, 0))
thumbnail_entry = tk.Entry(main_frame, width=85)
thumbnail_entry.pack(anchor="w", pady=(0, 5))

# 4. Main Content (Single Text Widget for custom markdown/text)
tk.Label(main_frame, text="Main Content / Description (Markdown supported):", font=("Arial", 10, "bold")).pack(anchor="w", pady=(10, 0))
content_text = tk.Text(main_frame, height=10, width=85)
default_content = "## Memory\n• Silent Aim\n• Aimbot Lite\n\n## Exploits\n• Ghost\n• Speed Hack\n\n## ESP\n• Show Name\n• Show Distance\n• Show Health"
content_text.insert("1.0", default_content)
content_text.pack(anchor="w", pady=(0, 5))

# 5. Price
tk.Label(main_frame, text="Price Text (Footer):", font=("Arial", 10, "bold")).pack(anchor="w", pady=(10, 0))
price_entry = tk.Entry(main_frame, width=85)
price_entry.insert(0, "De R$ 10,00 a R$ 100,00")
price_entry.pack(anchor="w", pady=(0, 5))

# 6. Buttons Configuration (Side-by-Side in Discord)
tk.Label(main_frame, text="Buttons Configuration (Side-by-Side in Discord):", font=("Arial", 10, "bold")).pack(anchor="w", pady=(10, 5))

button_entries = []
# Pre-set default values for Button 1 and Button 2
defaults = [
    ("🛒 Ver Opções", "https://example.com"),
    ("💬 Suporte", "https://discord.gg"),
    ("", "")
]

for i in range(1, 4):
    b_frame = tk.Frame(main_frame)
    b_frame.pack(anchor="w", pady=2)

    tk.Label(b_frame, text=f"Button {i} Text:", font=("Arial", 9, "bold")).pack(side=tk.LEFT)
    lbl_ent = tk.Entry(b_frame, width=22)
    lbl_ent.insert(0, defaults[i-1][0])
    lbl_ent.pack(side=tk.LEFT, padx=(2, 10))

    tk.Label(b_frame, text="URL:", font=("Arial", 9, "bold")).pack(side=tk.LEFT)
    url_ent = tk.Entry(b_frame, width=48)
    url_ent.insert(0, defaults[i-1][1])
    url_ent.pack(side=tk.LEFT, padx=2)

    button_entries.append((lbl_ent, url_ent))

# Options
opts_frame = tk.Frame(main_frame)
opts_frame.pack(anchor="w", pady=(10, 15))

show_divider_var = tk.BooleanVar(value=True)
show_divider_check = tk.Checkbutton(opts_frame, text="Show Divider Lines",
                                    variable=show_divider_var, font=("Arial", 10, "bold"))
show_divider_check.pack(side=tk.LEFT, padx=(0, 10))

expand_width_var = tk.BooleanVar(value=True)
expand_width_check = tk.Checkbutton(opts_frame, text="Expand Container Width",
                                   variable=expand_width_var, font=("Arial", 10, "bold"))
expand_width_check.pack(side=tk.LEFT)

tk.Label(opts_frame, text=" Width Padding (Spaces):", font=("Arial", 10)).pack(side=tk.LEFT, padx=(15, 5))
width_spinbox = tk.Spinbox(opts_frame, from_=0, to=60, width=5, font=("Arial", 10))
width_spinbox.delete(0, tk.END)
width_spinbox.insert(0, "22")
width_spinbox.pack(side=tk.LEFT)

# Buttons row
btn_row = tk.Frame(main_frame)
btn_row.pack(pady=5)

send_btn = tk.Button(btn_row, text="Send Webhook", command=send_webhook, bg="#00C2DF", fg="white",
                     font=("Arial", 11, "bold"), width=16, cursor="hand2")
send_btn.pack(side=tk.LEFT, padx=3)

preview_btn = tk.Button(btn_row, text="Preview JSON", command=preview_payload,
                        font=("Arial", 11), width=12, cursor="hand2")
preview_btn.pack(side=tk.LEFT, padx=3)

export_btn = tk.Button(btn_row, text="💾 Export Config", command=export_config,
                        font=("Arial", 11), width=13, cursor="hand2")
export_btn.pack(side=tk.LEFT, padx=3)

import_btn = tk.Button(btn_row, text="📂 Import Config", command=import_config,
                        font=("Arial", 11), width=13, cursor="hand2")
import_btn.pack(side=tk.LEFT, padx=3)

def launch_web_app():
    """Launches the Web App in browser and starts server if needed."""
    import webbrowser
    import subprocess
    import sys
    try:
        webbrowser.open("http://uptimes.hexacloud.qzz.io:25578")
        subprocess.Popen([sys.executable, "app.py"], cwd=os.path.dirname(os.path.abspath(__file__)))
    except Exception as e:
        messagebox.showerror("Web App Error", f"Could not launch Web App: {e}")


webapp_btn = tk.Button(btn_row, text="🌐 Launch Web App", command=launch_web_app, bg="#5865F2", fg="white",
                       font=("Arial", 12, "bold"), width=16, cursor="hand2")
webapp_btn.pack(side=tk.LEFT, padx=5)

# Status Label (Log)
status_label = tk.Label(main_frame, text="Waiting to send...", font=("Arial", 10, "italic"), fg="gray")
status_label.pack()

# Start UI
if __name__ == "__main__":
    import os
    root.mainloop()


