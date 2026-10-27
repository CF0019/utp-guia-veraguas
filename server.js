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

const respuestas = [
  {
    palabras: [
      "ubicacion",
      "dirección",
      "direccion",
      "donde",
      "sede",
      "lugar"
    ],
    respuesta: () =>
      `El Centro Regional de Veraguas está ubicado en ${conocimiento.contacto.direccion}`
  },
  {
    palabras: ["telefono", "teléfono", "contacto", "llamar"],
    respuesta: () =>
      `Puedes contactar al Centro Regional de Veraguas en los teléfonos ${conocimiento.contacto.telefonos.join(
        " y "
      )}.`
  },
  {
    palabras: ["correo", "email", "e-mail"],
    respuesta: () =>
      `El correo del Centro Regional de Veraguas es ${conocimiento.contacto.correo}.`
  },
  {
    palabras: ["horario", "atencion", "atención", "hora"],
    respuesta: () =>
      `El horario de atención es ${conocimiento.contacto.horario}.`
  },
  {
    palabras: [
      "admision",
      "admisión",
      "ingresar",
      "inscripcion",
      "inscripción",
      "requisitos"
    ],
    respuesta: () =>
      `${conocimiento.admision.descripcion} ${
        conocimiento.admision.nota
      } Consulta más información en ${conocimiento.enlaces.admision}.`
  },
  {
    palabras: ["carrera", "carreras", "pregrado", "estudiar", "oferta"],
    respuesta: () =>
      `Puedes consultar la oferta académica del Centro Regional de Veraguas en ${conocimiento.enlaces.pregrado}.`
  },
  {
    palabras: ["sitio", "pagina", "página", "web", "oficial"],
    respuesta: () =>
      `El sitio oficial del Centro Regional de Veraguas es ${conocimiento.enlaces.sitioOficial}.`
  },
  {
    palabras: ["hola", "buenas", "saludos"],
    respuesta: () =>
      `Hola, soy ${conocimiento.identidad.nombre}. Puedo orientarte sobre admisión, carreras, contacto, ubicación y horarios del Centro Regional de Veraguas.`
  }
];

function buscarRespuesta(mensaje) {
  const texto = normalizar(mensaje);

  const encontrada = respuestas.find((item) =>
    item.palabras.some((palabra) => texto.includes(normalizar(palabra)))
  );

  if (encontrada) {
    return encontrada.respuesta();
  }

  return `Todavía no tengo esa información registrada. Puedes consultar el sitio oficial del Centro Regional de Veraguas: ${conocimiento.enlaces.sitioOficial}`;
}

app.get("/api/health", (req, res) => {
  res.json({
    estado: "ok",
    servicio: conocimiento.identidad.nombre
  });
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