const form = document.querySelector("#chat-form");
const input = document.querySelector("#mensaje");
const chat = document.querySelector("#chat");

function agregarMensaje(texto, tipo) {
  const elemento = document.createElement("div");
  elemento.className = `message ${tipo}`;
  elemento.textContent = texto;
  chat.appendChild(elemento);
  chat.scrollTop = chat.scrollHeight;
}

async function enviarMensaje(mensaje) {
  agregarMensaje(mensaje, "user");
  input.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ mensaje })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error del servidor");
    }

    agregarMensaje(data.respuesta, "bot");
  } catch (error) {
    console.error(error);
    agregarMensaje(
      "No se pudo conectar con el servidor. Revisa que node server.js esté ejecutándose.",
      "bot"
    );
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const mensaje = input.value.trim();

  if (mensaje) {
    enviarMensaje(mensaje);
  }
});

document.querySelectorAll("[data-question]").forEach((button) => {
  button.addEventListener("click", () => {
    const pregunta = button.dataset.question;
    enviarMensaje(pregunta);
  });
});