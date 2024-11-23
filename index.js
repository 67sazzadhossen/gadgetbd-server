const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "https://gadgetbd-client.vercel.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  console.log("req", req);
  console.log("cookie", req.cookies);
  const token = req.cookies?.token;
  console.log("token", token);

  if (!token) {
    return res.status(404).send({ message: "token not found" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.user = decoded;
    // console.log(req.query);
    if (req.query?.email !== req.user?.email) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    next();
  });
};

const verifyBuyer = async (req, res, next) => {
  try {
    // Verify the token first
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).send({ message: "Unauthorized access" });
    }

    // Decode the token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized access" });
      }

      // Attach the decoded user data to the request object
      req.user = decoded;

      // Fetch user from the database to check role
      const user = await userCollection.findOne({ email: req.user?.email });

      // Check if the user's role is 'seller'
      if (user.role !== "buyer") {
        return res
          .status(403)
          .send({ message: "Forbidden access, buyer only" });
      }

      // Proceed to the next middleware/route handler
      next();
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};
const verifySeller = async (req, res, next) => {
  try {
    // Verify the token first
    const token = req.cookies?.token;
    // console.log("clicked");
    if (!token) {
      return res.status(401).send({ message: "Unauthorized access" });
    }

    // Decode the token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized access" });
      }

      // Attach the decoded user data to the request object
      req.user = decoded;

      // Fetch user from the database to check role
      const user = await userCollection.findOne({ email: req.user?.email });

      // Check if the user's role is 'seller'
      if (user.role !== "seller") {
        return res
          .status(403)
          .send({ message: "Forbidden access, seller only" });
      }

      // Proceed to the next middleware/route handler
      next();
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
    // Verify the token first
    const token = req.cookies?.token;
    // console.log("verify admin");
    if (!token) {
      // console.log("check token");
      return res.status(401).send({ message: "Unauthorized access" });
    }

    // Decode the token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      // console.log("verifying");
      if (err) {
        // console.log("err");
        return res.status(401).send({ message: "Unauthorized access" });
      }

      // Attach the decoded user data to the request object
      req.user = decoded;

      // Fetch user from the database to check role
      const user = await userCollection.findOne({ email: req.user?.email });
      // console.log(user?.role);

      // Check if the user's role is 'admin'
      if (user.role !== "admin") {
        return res
          .status(403)
          .send({ message: "Forbidden access, admin only" });
      }

      // Proceed to the next middleware/route handler
      next();
    });
  } catch (error) {
    res.status(500).send({ message: "Server error", error });
  }
};

// MongoDB
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.rfr5aqt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Cookie Options
const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  secure: process.env.NODE_ENV === "production",
};

// Collections
const userCollection = client.db("gadgetBd").collection("userCollection");
const productCollection = client.db("gadgetBd").collection("productCollection");

const connectDb = async () => {
  try {
    // ================== Seller Routes ================

    // Delete Product
    app.delete(
      "/delete-product/:id",
      verifyToken,
      verifySeller,
      async (req, res) => {
        try {
          const id = req.params.id;
          const result = await productCollection.deleteOne({
            _id: new ObjectId(id),
          });
          res.json({ message: "Success", result });
        } catch (error) {
          res.status(500).json({ message: "Error deleting product", error });
        }
      }
    );

    // Update Product
    app.patch(
      "/update-product/:id",
      verifyToken,
      verifySeller,
      async (req, res) => {
        try {
          const updatedProduct = req.body;
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const update = { $set: updatedProduct };

          const result = await productCollection.updateOne(query, update);
          res.json({ message: "Success", status: 200, result });
        } catch (error) {
          res.status(500).json({ message: "Error updating product", error });
        }
      }
    );

    // Add Product
    app.post("/add-product", verifyToken, verifySeller, async (req, res) => {
      try {
        const productData = req.body;
        const result = await productCollection.insertOne(productData);
        res.json({ message: "Success", status: 200, result });
      } catch (error) {
        res.status(500).json({ message: "Error adding product", error });
      }
    });

    // My Products
    app.get("/my-products", verifyToken, async (req, res) => {
      try {
        const email = req.query.email;
        const result = await productCollection.find({ email }).toArray();
        res.json({ message: "Success", data: result });
      } catch (error) {
        res.status(500).json({ message: "Error loading my products", error });
      }
    });

    // ================== Buyer Routes ================

    // Load All Products with Pagination and Stats
    app.get("/all-products", async (req, res) => {
      try {
        const queryParams = req.query;
        // console.log(queryParams);

        // Build query filters
        const query = {};
        if (queryParams.featured) {
          query.featured = queryParams.featured === "true";
        }
        if (queryParams.category) {
          query.category = queryParams.category;
        }
        if (queryParams.brand) {
          query.brand = queryParams.brand;
        }
        if (queryParams.search) {
          query.name = { $regex: queryParams.search, $options: "i" }; // Case-insensitive search
        }

        // Pagination parameters
        const page = parseInt(queryParams.page) || 1; // Default to page 1
        const limit = parseInt(queryParams.limit) || 6; // Default to 10 items per page
        const skip = (page - 1) * limit;
        // console.log(skip);

        // Sorting parameters
        const sortField = queryParams.sortField || "createdAt"; // Default to `createdAt`
        const sortOrder = queryParams.sortOrder === "desc" ? -1 : 1; // Default to ascending order

        // Fetch products with pagination and sorting
        const products = await productCollection
          .find(query)
          .sort({ [sortField]: sortOrder })
          .skip(skip)
          .limit(limit)
          .toArray();

        // Calculate total products for the query
        const totalProducts = await productCollection.countDocuments(query);

        // Calculate unique categories and brands
        const allProducts = await productCollection.find(query).toArray();
        const categories = [
          ...new Set(allProducts.map((p) => p.category)),
        ].filter(Boolean);
        const brands = [...new Set(allProducts.map((p) => p.brand))].filter(
          Boolean
        );

        res.json({
          message: "Success",
          status: 200,
          data: {
            products, // Current page products
            stats: {
              totalProducts,
              totalPages: Math.ceil(totalProducts / limit),
              categories,
              brands,
            },
          },
        });
      } catch (error) {
        res.status(500).json({ message: "Error loading products", error });
      }
    });

    // Load Single Product
    app.get("/single-product/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await productCollection.findOne({
          _id: new ObjectId(id),
        });
        res.json({ message: "Success", data: result });
      } catch (error) {
        res.status(500).json({ message: "Error loading product", error });
      }
    });

    // Add to Wishlist
    app.put("/wishlist/add", verifyToken, verifyBuyer, async (req, res) => {
      const { id, email } = req.query;

      if (!id || !email) {
        return res
          .status(400)
          .json({ success: false, message: "ID and Email are required." });
      }

      try {
        // Check if the user exists
        const user = await userCollection.findOne({ email });

        if (!user) {
          return res
            .status(404)
            .json({ success: false, message: "User not found." });
        }

        // Check if the item already exists in the wishlist
        const exists = user.wishlist?.some((item) => item.toString() === id);

        if (exists) {
          return res.status(400).json({
            success: false,
            message: "Item already exists in the wishlist.",
          });
        }

        // Add the product to the wishlist
        const result = await userCollection.updateOne(
          { email },
          { $addToSet: { wishlist: new ObjectId(id) } }
        );

        res.json({
          success: true,
          message: "Item added to wishlist successfully.",
          result,
        });
      } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).json({
          success: false,
          message: "An error occurred while adding to wishlist.",
          error,
        });
      }
    });

    // Remove from Wishlist
    app.put("/wishlist/remove", verifyToken, verifyBuyer, async (req, res) => {
      const { id, email } = req.query;

      // Validate input
      if (!id || !email) {
        return res
          .status(400)
          .json({ success: false, message: "ID and Email are required." });
      }

      try {
        // Remove the product from the wishlist
        const result = await userCollection.updateOne(
          { email: email },
          { $pull: { wishlist: new ObjectId(id) } } // Use `$pull` to remove the item
        );

        // Check if any document was modified
        if (result.modifiedCount === 0) {
          return res.status(400).json({
            success: false,
            message: "Product not found in wishlist.",
          });
        }

        res.json({ success: true, message: "Product removed from wishlist." });
      } catch (error) {
        console.error("Error removing from wishlist:", error);
        res
          .status(500)
          .json({ success: false, message: "An error occurred.", error });
      }
    });

    // Wishlist products
    app.get("/wishlist", verifyToken, async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res
            .status(400)
            .json({ success: false, message: "Email is required" });
        }

        const user = await userCollection.findOne({ email: email });

        if (!user || !user.wishlist || user.wishlist.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No wishlist found for this user",
          });
        }

        const products = await productCollection
          .find({ _id: { $in: user.wishlist.map((id) => new ObjectId(id)) } })
          .toArray();

        res.json({ success: true, data: products });
      } catch (error) {
        console.error("Error fetching wishlist products:", error);
        res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
    });

    // Add to Cartlist
    app.put("/cartlist/add", verifyToken, verifyBuyer, async (req, res) => {
      const { id, email } = req.query;

      // Validate input
      if (!id || !email) {
        return res
          .status(400)
          .json({ success: false, message: "ID and Email are required." });
      }

      try {
        // Check if the product is already in the cartlist
        const user = await userCollection.findOne({ email });

        if (
          user?.cartlist?.some((cartItem) => cartItem.equals(new ObjectId(id)))
        ) {
          return res.status(400).json({
            success: false,
            message: "Product is already in the cartlist.",
          });
        }

        // Add the product to the cartlist
        const result = await userCollection.updateOne(
          { email },
          { $addToSet: { cartlist: new ObjectId(id) } }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Failed to add product to cartlist.",
          });
        }

        res.json({ success: true, message: "Product added to cartlist." });
      } catch (error) {
        console.error("Error adding to cartlist:", error);
        res.status(500).json({
          success: false,
          message: "An error occurred while adding to the cartlist.",
          error,
        });
      }
    });

    // remove from cartlist
    app.put("/cartlist/remove", verifyToken, verifyBuyer, async (req, res) => {
      const { id, email } = req.query;

      // Validate input
      if (!id || !email) {
        return res
          .status(400)
          .json({ success: false, message: "ID and Email are required." });
      }

      try {
        // Remove the product from the wishlist
        const result = await userCollection.updateOne(
          { email: email },
          { $pull: { cartlist: new ObjectId(id) } } // Use `$pull` to remove the item
        );

        // Check if any document was modified
        if (result.modifiedCount === 0) {
          return res.status(400).json({
            success: false,
            message: "Product not found in cartlist.",
          });
        }

        res.json({ success: true, message: "Product removed from cartlist." });
      } catch (error) {
        console.error("Error removing from cartlist:", error);
        res
          .status(500)
          .json({ success: false, message: "An error occurred.", error });
      }
    });

    // cartlist products
    app.get("/cartlist", verifyToken, verifyBuyer, async (req, res) => {
      const { email } = req.query;
      const user = await userCollection.findOne({ email: email });
      const products = await productCollection
        .find({ _id: { $in: user.cartlist.map((id) => new ObjectId(id)) } })
        .toArray();
      res.json({ success: true, data: products });
    });

    // ================== Admin routes ================

    // get all users
    app.get("/all-users", verifyToken, verifyAdmin, async (req, res) => {
      const users = await userCollection.find().toArray();
      res.status(200).json({ data: users });
    });

    //update user role
    app.put("/user/update-role", verifyToken, verifyAdmin, async (req, res) => {
      const { id, role } = req.query;
      // console.log(role);

      // Check if id or role is missing
      if (!id || !role) {
        return res
          .status(400)
          .json({ success: false, message: "ID and Role are required." });
      }

      try {
        // Update the user's role in the database
        const result = await userCollection.updateOne(
          { _id: new ObjectId(id) }, // Match the user by their ObjectId
          { $set: { role } } // Update the user's role
        );

        if (result.modifiedCount === 0) {
          // If no document was updated, it means the user wasn't found or the role is already the same
          return res.status(404).json({
            success: false,
            message: "User not found or role is already up to date.",
          });
        }

        res
          .status(200)
          .json({ success: true, message: "User role updated successfully." });
      } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({
          success: false,
          message: "An error occurred while updating the role.",
        });
      }
    });

    // delete an user
    app.delete("/user/delete", verifyToken, verifyAdmin, async (req, res) => {
      const { id } = req.query;
      // console.log("hi");
      const resp = await userCollection.deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ success: true });
    });

    // ================== Authentication related routes ================

    // Save User After Sign-Up
    app.post("/users", async (req, res) => {
      try {
        const data = req.body;
        const existingUser = await userCollection.findOne({
          email: data.email,
        });
        if (existingUser) {
          return res.status(400).json({ message: "Email already exists" });
        }
        const result = await userCollection.insertOne(data);
        res.json({ message: "Success", status: 200, result });
      } catch (error) {
        res.status(500).json({ message: "Error saving user", error });
      }
    });

    // Load Logged User
    app.get("/user/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const currentUser = await userCollection.findOne({ email });
        res.json({ message: "Success", data: currentUser });
      } catch (error) {
        res.status(500).json({ message: "Error loading user", error });
      }
    });

    // Authentication by JWT
    app.post("/jwt", async (req, res) => {
      try {
        const user = req.body;
        const token = jwt.sign(user, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });
        console.log(token);
        res.cookie("token", token, cookieOptions).json({ success: true });
      } catch (error) {
        res.status(500).json({ message: "Error generating token", error });
      }
    });

    // Logout
    app.post("/log-out", async (req, res) => {
      try {
        res
          .clearCookie("token", { ...cookieOptions, maxAge: 0 })
          .json({ success: true });
      } catch (error) {
        res.status(500).json({ message: "Error during logout", error });
      }
    });

    await client.connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

connectDb();

// API Root
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
