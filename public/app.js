const form = document.querySelector("#chat-form");
const input = document.querySelector("#mensaje");
const chat = document.querySelector("#chat");
const categories = document.querySelector("#categories");

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
      throw new Error(data.error || "Error del servidor.");
    }

    agregarMensaje(data.respuesta, "bot");
  } catch (error) {
    console.error(error);
    agregarMensaje(
      "No se pudo conectar con el servidor. Intenta nuevamente.",
      "bot"
    );
  }
}

function mostrarPreguntas(preguntas) {
  const lista = document.createElement("div");
  lista.className = "category-questions";

  preguntas.forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = item.pregunta;

    button.addEventListener("click", () => {
      enviarMensaje(item.pregunta);
    });

    lista.appendChild(button);
  });

  return lista;
}

async function cargarCategorias() {
  try {
    const response = await fetch("/api/categorias");

    if (!response.ok) {
      throw new Error("No se pudieron cargar las categorías.");
    }

    const data = await response.json();
    categories.innerHTML = "";

    data.forEach((categoria) => {
      const article = document.createElement("article");
      article.className = "category-card";

      const title = document.createElement("h3");
      title.textContent = categoria.nombre;

      const description = document.createElement("p");
      description.textContent = categoria.descripcion;

      article.appendChild(title);
      article.appendChild(description);

      if (categoria.preguntas.length > 0) {
        article.appendChild(mostrarPreguntas(categoria.preguntas));
      } else {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "Todavía no hay preguntas registradas.";
        article.appendChild(emptyMessage);
      }

      categories.appendChild(article);
    });
  } catch (error) {
    console.error(error);
    categories.innerHTML =
      "<p>No se pudieron cargar las categorías.</p>";
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
    enviarMensaje(button.dataset.question);
  });
});

cargarCategorias();