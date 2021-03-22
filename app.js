const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require('path'); // NodeJS Package for file paths

const app = express();

// Settings
app.set("port", process.env.PORT || 3000);

// Middlewares
// const corsOptions = {origin: "http://localhost:4200"}
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(__dirname + '/public')); // Provide static directory for frontend

// Routes
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/cuenta", require("./routes/cuenta.routes"));
app.use("/api/transfer", require("./routes/transferencia.routes"));

app.get('/*', function(req, res) {

    res.sendFile(path.join(__dirname + '/dist/frontend/index.html'));
});

module.exports = app;