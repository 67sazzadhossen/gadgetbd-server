const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://gadgetbd-client.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// MongoDb

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.rfr5aqt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  secure: process.env.NODE_ENV === "production" ? true : false,
};

const userCollection = client.db("gadgetBd").collection("userCollection");
const productCollection = client.db("gadgetBd").collection("productCollection");

const connectDb = async () => {
  try {
    app.post("/users", async (req, res) => {
      const data = req.body;
      const existingUser = await userCollection.findOne({ email: data.email });
      if (existingUser) {
        res.json({ message: "Email Already Exist" });
      }
      const result = await userCollection.insertOne(data);
      res.json({ message: "Success", status: 200 });
    });

    // Authentication by jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.cookie("token", token, cookieOptions).send({ success: true });
    });

    app.post("/log-out", async (req, res) => {
      res
        .clearCookie("token", { ...cookieOptions, maxAge: 0 })
        .send({ success: true });
    });

    client.connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error.name, error.message);
  }
};

connectDb();

// api

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
