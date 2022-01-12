// load .env data into process.env
require("dotenv").config();

// Web server config
const PORT = process.env.PORT || 8080; //anyway I still prefer 8080
const sassMiddleware = require("./lib/sass-middleware");
const cookieSession = require("cookie-session");
const express = require("express");
const app = express();
const morgan = require("morgan");

// PG database client/connection setup
const { Pool } = require("pg");
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect(() => {
  console.log("database connected!");
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));//based on body-parser
app.use(
  "/styles",
  sassMiddleware({
    source: __dirname + "/styles",
    destination: __dirname + "/public/styles",
    isSass: false, // false => scss, true => sass
  })
);
app.use(express.static("public"));
app.use(cookieSession({
  name: 'session',
  keys: ["lightEasts", "allenKevinSimar"]
}));

// Separated Routes for each Resource
const loginRoutes = require("./routes/login");
const logoutRoutes = require("./routes/logout");
const ordersRoutes = require("./routes/orders");
const cartsRoutes = require("./routes/carts");
const restaurantsRoutes = require("./routes/restaurants");
const orderStatus = require("./routes/current");//check this

// Mount all resource routes
app.use("/orders/", ordersRoutes(db));
app.use("/carts/", cartsRoutes(db));
app.use("/restaurants/", restaurantsRoutes(db));
app.use("/current/",orderStatus(db));
app.use("/login/", loginRoutes(db));
app.use("/logout/", logoutRoutes());

// Note: mount other resources here, using the same pattern above

// Home page
app.get("/", (req, res) => {
  const user = req.session.user;
  db.query(`
  SELECT restaurants.*, menu_items.name AS item_name, price, image_url
  FROM menu_items
  JOIN restaurants ON
  restaurants.id = restaurant_id`)
  .then(data => {
    const menuItems = data.rows;
    const templatevars = {
      user,
      rest_id: null,
      menuItems
    };
    res.render("index", templatevars);
  })
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
