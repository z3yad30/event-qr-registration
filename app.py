import io
import os
import uuid
import qrcode
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request, send_from_directory
from email_sender import send_email

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
QR_DIR = os.path.join(BASE_DIR, "static", "qrs")
os.makedirs(QR_DIR, exist_ok=True)

USERS = {
    os.getenv("ORGANIZER_USERNAME"): os.getenv("ORGANIZER_PASSWORD")
}
SUCCESS_TOKEN = "EVENT_REGISTRATION_SUCCESS"

app = Flask(__name__, static_folder="static", template_folder="templates")


def generate_qr_bytes(payload: str) -> bytes:
    qr = qrcode.QRCode(box_size=10, border=2)
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/organizer")
def organizer():
    return render_template("organizer.html")


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(force=True)
    name = data.get("name", "").strip()
    email = data.get("email", "").strip()

    if not name or not email:
        return jsonify(success=False, message="Name and email are required."), 400

    qr_text = f"EVENT_REGISTER|{name}|{email}|{SUCCESS_TOKEN}"
    qr_bytes = generate_qr_bytes(qr_text)
    filename = f"{uuid.uuid4().hex}.png"
    qr_path = os.path.join(QR_DIR, filename)

    with open(qr_path, "wb") as qr_file:
        qr_file.write(qr_bytes)

    email_subject = "Your event entrance QR code"
    email_message = (
        f"Hello {name},\n\n"
        "Thank you for registering for the event. Your entrance QR code is attached to this email. "
        "Please print or save the image and show it at the entry gate."
    )

    send_email(
        to_email=email,
        subject=email_subject,
        message=email_message,
        attachment_path=qr_path,
        attachment_name="entrance_qr.png",
    )

    return jsonify(success=True, message="You will receive an entrance QR code by email.")


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if USERS.get(username) == password:
        return jsonify(success=True, message="Login successful.")

    return jsonify(success=False, message="Invalid username or password."), 401


@app.route("/qrs/<path:filename>")
def qr_image(filename):
    return send_from_directory(QR_DIR, filename)


if __name__ == "__main__":
    app.run(debug=True)
