const express = require("express");
const path = require("path");
const conocimiento = require("./data/conocimiento.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buscarRespuesta(mensaje) {
  const texto = normalizar(mensaje);

  let mejorCoincidencia = null;
  let mayorPuntaje = 0;

  for (const pregunta of conocimiento.preguntasFrecuentes) {
    const puntaje = pregunta.palabrasClave.reduce((total, palabra) => {
      return texto.includes(normalizar(palabra)) ? total + 1 : total;
    }, 0);

    if (puntaje > mayorPuntaje) {
      mayorPuntaje = puntaje;
      mejorCoincidencia = pregunta;
    }
  }

  if (mejorCoincidencia) {
    return `${mejorCoincidencia.respuesta} Fuente: ${mejorCoincidencia.fuente}`;
  }

  return `Todavía no tengo esa información registrada. Puedes consultar el sitio oficial del Centro Regional de Veraguas: ${conocimiento.fuente.url}`;
}

app.get("/api/health", (req, res) => {
  res.json({
    estado: "ok",
    servicio: conocimiento.identidad.nombre
  });
});

app.get("/api/categorias", (req, res) => {
  const categorias = conocimiento.categorias.map((categoria) => {
    const preguntas = conocimiento.preguntasFrecuentes
      .filter((pregunta) => pregunta.categoria === categoria.nombre)
      .map((pregunta) => ({
        pregunta: pregunta.pregunta,
        palabrasClave: pregunta.palabrasClave
      }));

    return {
      ...categoria,
      preguntas
    };
  });

  res.json(categorias);
});

app.post("/api/chat", (req, res) => {
  const { mensaje } = req.body;

  if (typeof mensaje !== "string" || mensaje.trim() === "") {
    return res.status(400).json({
      error: "El mensaje es obligatorio."
    });
  }

  res.json({
    respuesta: buscarRespuesta(mensaje)
  });
});

app.listen(PORT, () => {
  console.log(
    `${conocimiento.identidad.nombre} disponible en http://localhost:${PORT}`
  );
});