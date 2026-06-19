const registerForm = document.getElementById("registerForm");
const messageBox = document.getElementById("messageBox");
const toast = document.getElementById("toast");

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("visible");
  window.setTimeout(() => toast.classList.remove("visible"), 3200);
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(registerForm);
  const name = formData.get("name").trim();
  const email = formData.get("email").trim();

  if (!name || !email) {
    messageBox.textContent = "Please complete both fields.";
    return;
  }

  messageBox.textContent = "Sending QR code email...";

  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const result = await response.json();

    if (!response.ok) {
      messageBox.textContent = result.message || "Unable to send email.";
      messageBox.classList.add("failure");
      showToast("Registration failed. Check your email and try again.");
      return;
    }

    registerForm.reset();
    messageBox.textContent = result.message;
    messageBox.classList.remove("failure");
    showToast("You will receive your entrance QR by email.");
  } catch (error) {
    messageBox.textContent = "There was a connection problem.";
    messageBox.classList.add("failure");
    showToast("Connection error. Please refresh and try again.");
  }
});
