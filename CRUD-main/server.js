const app = require("./backend/app");
const express = require("express");
const dotenv = require("dotenv");
const dbConnect = require("./backend/config/dbConfig");
dotenv.config({ path: "./backend/config/config.env" });

const PORT = process.env.PORT;
const MODE = process.env.NODE_ENV;

dbConnect();

app.use(express.static("uploads"));

app.get("/", async (req, res) => {
  res.render("index", { title: "Postol Authenticate" });
});
app.get("/signup", async (req, res) => {
  res.render("auth", { title: "Postol Authenticate" });
});
app.get("/signin", async (req, res) => {
  res.render("signin", { title: "Postol Authenticate" });
});
app.get("/profile/:id", async (req, res) => {
  res.render("profile", { title: "Postol Authenticate" });
});
app.get("/write/:id", async (req, res) => {
  res.render("write", { title: "Create Article" });
});
app.get("/article", async (req, res) => {
  res.render("article", { title: "Postol Authenticate" });
});
app.get("/myarticles/:id", async (req, res) => {
  res.render("myarticles", { title: "Postol Authenticate" });
});

app.all("*", (req, res) => {
  res.render("404", { title: "Page not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${MODE} mode`);
});
