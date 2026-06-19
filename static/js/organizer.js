const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("loginSection");
const scannerSection = document.getElementById("scannerSection");
const loginMessage = document.getElementById("loginMessage");
const scanResult = document.getElementById("scanResult");
const scanButton = document.getElementById("scanButton");
const video = document.getElementById("camera");
const qrCanvas = document.getElementById("qrCanvas");
const qrContext = qrCanvas.getContext("2d");
let stream = null;

async function startCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    video.srcObject = stream;
    await video.play();
    qrCanvas.width = video.videoWidth;
    qrCanvas.height = video.videoHeight;
  } catch (error) {
    loginMessage.textContent = "Unable to access the camera. Please allow camera permission.";
    loginMessage.classList.add("failure");
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
}

function updateScanResult(text, success) {
  scanResult.textContent = text;
  scanResult.classList.toggle("success", success);
  scanResult.classList.toggle("failure", !success);
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessage.textContent = "Logging in...";
  loginMessage.classList.remove("failure");

  const formData = new FormData(loginForm);
  const username = formData.get("username").trim();
  const password = formData.get("password").trim();

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.json();

    if (!response.ok) {
      loginMessage.textContent = result.message || "Login failed.";
      loginMessage.classList.add("failure");
      return;
    }

    loginSection.classList.add("hidden");
    scannerSection.classList.remove("hidden");
    loginMessage.textContent = "";
    await startCamera();
  } catch (error) {
    loginMessage.textContent = "Server connection failed.";
    loginMessage.classList.add("failure");
  }
});

scanButton.addEventListener("click", () => {
  if (!video.videoWidth || !video.videoHeight) {
    updateScanResult("Camera is not ready. Try again.", false);
    return;
  }

  qrContext.drawImage(video, 0, 0, qrCanvas.width, qrCanvas.height);
  const imageData = qrContext.getImageData(0, 0, qrCanvas.width, qrCanvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);

  if (!code) {
    updateScanResult("No QR code detected. Move the camera slowly and try again.", false);
    return;
  }

  const decoded = code.data || "";
  const valid = decoded.includes("EVENT_REGISTER|") && decoded.includes("EVENT_REGISTRATION_SUCCESS");

  if (valid) {
    updateScanResult("Success! Valid event entry QR code detected.", true);
  } else {
    updateScanResult("Failed. The scanned QR code is not valid for this event.", false);
  }
});

window.addEventListener("beforeunload", stopCamera);
