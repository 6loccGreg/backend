const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const path = require("path");
const PORT = 3001;

const allowedOrigins = ["http://localhost:5173"];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionSuccessStatus: 200,
};
let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.static(path.join(__dirname, "dist"));

app.use(cors(allowedOrigins));

app.use((req, res, next) => {
  const originalJson = res.json;
  res.bodyData = null;
  res.json = function (data) {
    res.bodyData = data;
    return originalJson.call(this, data);
  };
  next();
});

morgan.token("res-body", (req, res) => {
  if (req.method === "POST") {
    res.bodyData = { name: res.bodyData.name, number: res.bodyData.number };
    return JSON.stringify(res.bodyData);
  }
  return "Hello";
});

app.use(express.json());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :res-body",

    {
      skip: (req) => req.method !== "POST",
    },
  ),
);

app.get("/api/persons", (request, response) => {
  response.send(persons);
});
app.get("/info", (request, response) => {
  response.send(
    `<p><strong>Phonebook has info for ${persons.length} people </strong></p> <p><strong>${new Date().toString()}</strong></p>`,
  );
});
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  if (persons[id]) {
    const person = persons.find((person) => person.id === id);
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body?.name) {
    return response.status(400).json({ error: "name is required" });
  }
  if (!body?.number) {
    return response.status(400).json({ error: "number is required" });
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(409).json({ error: "name must be unique" });
  }

  const person = {
    id: `${Math.floor(Math.random() * 1000)}`,
    name: body.name,
    number: body.number,
  };

  persons = [...persons, person];
  response.json(person);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
