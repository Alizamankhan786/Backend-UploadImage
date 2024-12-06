// const express = require('express')
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import connectDB from "./src/db/index.js";
import router from "./src/routes/users.routes.js";
dotenv.config();
const app = express();
const port = 3000

app.use(express.json());
app.use(cors());
app.use(cookieParser());



app.get('/', (req, res) => {
  res.send('Hello World!')
});

// routes
app.use("/api/v1", router);

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB connection failed !!! ", err);
  });

