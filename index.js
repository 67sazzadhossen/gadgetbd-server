const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDb

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.rfr5aqt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

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
