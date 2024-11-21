const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "https://gadgetbd-client.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// verify token
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unathorized access" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unathorized access" });
    }
    req.user = decoded;
    if (req.body?.email !== req.user?.email) {
      return res.status(403).send({ message: "forbidden access" });
    }
    next();
  });
};

// MongoDb

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.rfr5aqt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// cookie option

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  secure: process.env.NODE_ENV === "production" ? true : false,
};

const userCollection = client.db("gadgetBd").collection("userCollection");
const productCollection = client.db("gadgetBd").collection("productCollection");

const connectDb = async () => {
  try {
    // seller route

    // delete product
    app.delete("/delete-product/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);

      const result = await productCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.json({ message: "success" });
    });

    // load single product
    app.get("/signle-product/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.json({ message: "success", data: result });
    });

    // update a product
    app.patch("/update-product/:id", async (req, res) => {
      const updatedProduct = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $set: updatedProduct };

      const result = await productCollection.updateOne(query, update);
      res.json({ message: "success" });
    });

    // add product
    app.post("/add-product", async (req, res) => {
      const productData = req.body;
      // console.log(productData);

      const result = await productCollection.insertOne(productData);
      res.json({ message: "success", status: 200 });
    });

    app.get("/my-products", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      try {
        const result = await productCollection.find({ email: email }).toArray();
        res.json({ message: "success", data: result });
      } catch (error) {
        res.json({ message: "error" });
      }
    });

    // save user after sign up
    app.post("/users", async (req, res) => {
      const data = req.body;
      const existingUser = await userCollection.findOne({ email: data.email });
      if (existingUser) {
        res.json({ message: "Email Already Exist" });
      }
      const result = await userCollection.insertOne(data);
      res.json({ message: "Success", status: 200 });
    });

    // load logged user
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      // console.log(email);
      const currentUser = await userCollection.findOne({ email: email });
      res.json({ message: "success", data: currentUser });
    });

    // Authentication by jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      // console.log(user);
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
