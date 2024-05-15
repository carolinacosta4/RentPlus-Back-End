require("dotenv").config(); // read environment variables from .env file
const express = require("express");
const cors = require("cors"); // middleware to enable CORS (Cross-Origin Resource Sharing)

const app = express();
const port = process.env.PORT;
const host = process.env.HOST;

app.use(cors()); //enable ALL CORS requests (client requests from other domain)
app.use(express.json()); //enable parsing JSON body data

// root route -- /api/
app.get("/", function (req, res) {
  res.status(200).json({ message: "home -- RENT+ api" });
});

// routing middleware
app.use("/users", require("./routes/users.routes.js"));
app.use("/properties", require("./routes/properties.routes.js"));
app.use("/payments", require("./routes/payments.routes.js"));
app.use("/reservations", require("./routes/reservations.routes.js"));

// handle invalid routes
app.all("*", function (req, res) {
  res.status(400).json({
    success: false,
    msg: `The API does not recognize the request on ${req.url}`,
  });
});
app.listen(port, host, () =>
  console.log(`App listening at http://${host}:${port}/`)
);
