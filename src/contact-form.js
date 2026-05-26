const makeWebhookUrl = "https://hook.eu1.make.com/2uutni4wmoy3ueemdp5sxpyo12adn1cs";

const setupContactForm = () => {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("status");

  if (!form || !status) return;

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    status.style.display = "block";
    status.textContent = "Envoi en cours...";
    status.dataset.state = "loading";
    submitButton.disabled = true;

    const payload = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value,
    };

    try {
      const response = await fetch(makeWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        status.textContent = "✅ Message envoyé ! Vérifiez votre boîte mail.";
        status.dataset.state = "success";
        event.target.reset();
      } else {
        status.textContent = "❌ Une erreur est survenue, réessayez.";
        status.dataset.state = "error";
      }
    } catch {
      status.textContent = "❌ Connexion impossible.";
      status.dataset.state = "error";
    } finally {
      submitButton.disabled = false;
    }
  });
};

setupContactForm();
