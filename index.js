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
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.user = decoded;
    if (req.body?.email !== req.user?.email) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    next();
  });
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
    // Seller Routes
    // Delete Product
    app.delete("/delete-product/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await productCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.json({ message: "Success", result });
      } catch (error) {
        res.status(500).json({ message: "Error deleting product", error });
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

    // Update Product
    app.patch("/update-product/:id", async (req, res) => {
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
    });

    // Add Product
    app.post("/add-product", async (req, res) => {
      try {
        const productData = req.body;
        const result = await productCollection.insertOne(productData);
        res.json({ message: "Success", status: 200, result });
      } catch (error) {
        res.status(500).json({ message: "Error adding product", error });
      }
    });

    // My Products
    app.get("/my-products", async (req, res) => {
      try {
        const email = req.query.email;
        const result = await productCollection.find({ email }).toArray();
        res.json({ message: "Success", data: result });
      } catch (error) {
        res.status(500).json({ message: "Error loading my products", error });
      }
    });

    // app.post("/add", async (req, res) => {
    //   const products = [
    //     {
    //       name: "Wireless Bluetooth Headphones",
    //       category: "Electronics",
    //       price: "2500",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sd66ac8fd91e64c3e8396076a15f9e906T.jpg?widt…",
    //       description:
    //         "Experience high-quality sound with these comfortable wireless Bluetooth headphones.",
    //       brand: "Awei",
    //       featured: false,
    //     },
    //     {
    //       name: "Portable Bluetooth Speaker",
    //       category: "Electronics",
    //       price: "1500",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S1b6f3a5c38a64e8b9b9b70f97e65825fO.jpg?widt…",
    //       description:
    //         "Compact and portable, this Bluetooth speaker delivers powerful sound on the go.",
    //       brand: "Xiaomi",
    //       featured: true,
    //     },
    //     {
    //       name: "Smart Fitness Tracker",
    //       category: "Wearables",
    //       price: "1800",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sb6c015a0f6b347ec9a7fcabfdfe7a7d3S.jpg?widt…",
    //       description:
    //         "Track your fitness goals with ease using this stylish and accurate fitness tracker.",
    //       brand: "Fitbit",
    //       featured: false,
    //     },
    //     {
    //       name: "Wireless Earbuds",
    //       category: "Electronics",
    //       price: "1200",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sad5783470e3a41b19b41cdbdb06c7b08z.jpg?widt…",
    //       description:
    //         "Enjoy high-quality music with these wireless earbuds that provide clear sound.",
    //       brand: "Samsung",
    //       featured: true,
    //     },
    //     {
    //       name: "Smartphone Mount for Car",
    //       category: "Accessories",
    //       price: "800",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S5c9bc4f950c64e0d8e3a57dbf00c41d3h.jpg?widt…",
    //       description:
    //         "Keep your phone in place and easily accessible while driving with this car mount.",
    //       brand: "Baseus",
    //       featured: false,
    //     },
    //     {
    //       name: "Wireless Charger Pad",
    //       category: "Accessories",
    //       price: "950",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sb6fdd31866d74c6e8a73094b68f3517cd.jpg?widt…",
    //       description:
    //         "Efficiently charge your devices with this sleek wireless charger pad.",
    //       brand: "Anker",
    //       featured: true,
    //     },
    //     {
    //       name: "Smart Home Security Camera",
    //       category: "Home Gadgets",
    //       price: "3500",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S1ffdfc2b67b8426da687ea290dd9733f0.jpg?widt…",
    //       description:
    //         "Monitor your home with ease using this intelligent and reliable security camera.",
    //       brand: "Ring",
    //       featured: false,
    //     },
    //     {
    //       name: "Smart Light Bulb",
    //       category: "Home Gadgets",
    //       price: "600",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sd2d838a742d24a7b82c122c3125ad8e0T.jpg?widt…",
    //       description:
    //         "Control the lighting in your home remotely with this smart and energy-efficient light bulb.",
    //       brand: "Philips Hue",
    //       featured: true,
    //     },
    //     {
    //       name: "Noise-Canceling Headphones",
    //       category: "Electronics",
    //       price: "4200",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S0e2d5b6f5c974062a2f26a0a9ab7c8feV.jpg?widt…",
    //       description:
    //         "Block out distractions and enjoy crystal-clear audio with these noise-canceling headphones.",
    //       brand: "Sony",
    //       featured: false,
    //     },
    //     {
    //       name: "Mini Drone with Camera",
    //       category: "Electronics",
    //       price: "5800",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S0ac0e44a7c674b6b8b5b564d16a21f6dO.jpg?widt…",
    //       description:
    //         "Capture stunning aerial shots with this compact mini drone equipped with a high-quality camera.",
    //       brand: "DJI",
    //       featured: true,
    //     },
    //     {
    //       name: "Smartphone Wireless Charging Pad",
    //       category: "Accessories",
    //       price: "1200",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sb5e0e9f9f602475d96349f5a2f1b4b09u.jpg?widt…",
    //       description:
    //         "Charge your smartphone wirelessly with this fast-charging pad.",
    //       brand: "Anker",
    //       featured: false,
    //     },
    //     {
    //       name: "Bluetooth Smart Scale",
    //       category: "Health",
    //       price: "2500",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S2f8f13213d814ae7a8a8f43a0ef4c3be1.jpg?widt…",
    //       description:
    //         "Track your weight and body composition with this Bluetooth-enabled smart scale.",
    //       brand: "Withings",
    //       featured: true,
    //     },
    //     {
    //       name: "Smart LED Desk Lamp",
    //       category: "Home Gadgets",
    //       price: "2200",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S7d34d4f824074b8b85813d9849e61b18l.jpg?widt…",
    //       description:
    //         "A smart desk lamp with adjustable brightness and color temperature for better work.",
    //       brand: "Xiaomi",
    //       featured: true,
    //     },
    //     {
    //       name: "Mini Portable Air Conditioner",
    //       category: "Home Gadgets",
    //       price: "3500",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sab7716c0ef4b4b8f95e3e0c04a9a5a17f.jpg?widt…",
    //       description:
    //         "Stay cool on hot days with this compact, portable air conditioner.",
    //       brand: "Midea",
    //       featured: false,
    //     },
    //     {
    //       name: "Smart Home Thermostat",
    //       category: "Home Gadgets",
    //       price: "4000",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S5b7f8c2cb559473db4367c31fc340bb4F.jpg?widt…",
    //       description:
    //         "Control your home's temperature remotely with this smart thermostat.",
    //       brand: "Nest",
    //       featured: true,
    //     },
    //     {
    //       name: "Smartwatch with Heart Rate Monitor",
    //       category: "Wearables",
    //       price: "3800",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sfd2345c6e9f14a5c86ba2e58ac3775103.jpg?widt…",
    //       description:
    //         "Monitor your health and fitness with this smartwatch that tracks your heart rate.",
    //       brand: "Garmin",
    //       featured: false,
    //     },
    //     {
    //       name: "Portable Power Bank",
    //       category: "Accessories",
    //       price: "1200",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S3d9de8f116f24a1b87b5ed9b463afcd8L.jpg?widt…",
    //       description:
    //         "Keep your devices charged on the go with this high-capacity power bank.",
    //       brand: "Anker",
    //       featured: true,
    //     },
    //     {
    //       name: "Car Dash Camera",
    //       category: "Automotive",
    //       price: "2500",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sd02c6f306fb64a2c9571d2228318fe5e5.jpg?widt…",
    //       description:
    //         "Capture your drives with this high-definition car dash camera.",
    //       brand: "Garmin",
    //       featured: false,
    //     },
    //     {
    //       name: "Noise-Canceling Bluetooth Headphones",
    //       category: "Electronics",
    //       price: "4500",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sd3f0c49b142743b8bb7b8096e771e8a3N.jpg?widt…",
    //       description:
    //         "Enjoy clear audio and block out background noise with these Bluetooth headphones.",
    //       brand: "Bose",
    //       featured: true,
    //     },
    //     {
    //       name: "Smart Water Bottle",
    //       category: "Health",
    //       price: "1200",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S9da4c17cc990465c8c21b004ef9455b8w.jpg?widt…",
    //       description:
    //         "Track your water intake with this intelligent water bottle that reminds you to hydrate.",
    //       brand: "Hidrate",
    //       featured: false,
    //     },
    //     {
    //       name: "Solar-Powered Battery Charger",
    //       category: "Accessories",
    //       price: "2000",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S6db739cb6d8e40cc9b84761e557b2c89Q.jpg?widt…",
    //       description:
    //         "Charge your devices using solar power with this portable solar charger.",
    //       brand: "RAVPower",
    //       featured: false,
    //     },
    //     {
    //       name: "Smart Bluetooth Lock",
    //       category: "Home Gadgets",
    //       price: "2500",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sf4b5a4f77c9642ca83a409d2a460b28aB.jpg?widt…",
    //       description:
    //         "Lock and unlock your doors remotely with this smart Bluetooth lock.",
    //       brand: "August",
    //       featured: true,
    //     },
    //     {
    //       name: "4K Action Camera",
    //       category: "Electronics",
    //       price: "5000",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S1a1e23b5b9e14a1f8e4e6b1a3de9bbda0.jpg?widt…",
    //       description:
    //         "Capture high-definition action shots with this rugged and waterproof 4K action camera.",
    //       brand: "GoPro",
    //       featured: true,
    //     },
    //     {
    //       name: "Smart Wi-Fi Plug",
    //       category: "Home Gadgets",
    //       price: "800",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S59d04c13ec6b45b4b8b20d9812721c7fg.jpg?widt…",
    //       description:
    //         "Control your devices remotely with this smart Wi-Fi plug.",
    //       brand: "TP-Link",
    //       featured: false,
    //     },
    //     {
    //       name: "Smart Mirror",
    //       category: "Home Gadgets",
    //       price: "4500",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sd0d02e59d8d04c4e92b78b9e2084fe47b.jpg?widt…",
    //       description:
    //         "A mirror that doubles as a smart screen, displaying weather, news, and more.",
    //       brand: "HiMirror",
    //       featured: true,
    //     },
    //     {
    //       name: "Smart Pet Feeder",
    //       category: "Pet Gadgets",
    //       price: "3500",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sdb2ff8bb98ba4d99833df4cc89d9f415r.jpg?widt…",
    //       description:
    //         "Feed your pet remotely with this automated smart pet feeder.",
    //       brand: "PetSafe",
    //       featured: false,
    //     },
    //     {
    //       name: "Robot Vacuum Cleaner",
    //       category: "Home Gadgets",
    //       price: "6000",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sfc9b8f5008e947be9020bcfbdcd42138O.jpg?widt…",
    //       description:
    //         "Keep your floors spotless with this automated robot vacuum cleaner.",
    //       brand: "iRobot",
    //       featured: true,
    //     },
    //     {
    //       name: "Electric Smart Toothbrush",
    //       category: "Health",
    //       price: "1500",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/S7b4c5c6b9b7645108bc687fad02ff6b6J.jpg?widt…",
    //       description:
    //         "Achieve superior oral hygiene with this electric smart toothbrush.",
    //       brand: "Oral-B",
    //       featured: false,
    //     },
    //     {
    //       name: "Wireless Video Doorphone",
    //       category: "Home Gadgets",
    //       price: "7000",
    //       email: "sazzadhossen010@gmail.com",
    //       image:
    //         "https://ae01.alicdn.com/kf/Sb7bbeb56c2724bcfa3fe68a11837aaf7Y.jpg?widt…",
    //       description:
    //         "See and speak to visitors at your door remotely with this wireless video doorphone.",
    //       brand: "TMEZON",
    //       featured: true,
    //     },
    //   ];

    //   const response = await productCollection.insertMany(products);
    //   res.json({ success: true });
    // });

    // user route
    // Load All Products with Pagination and Stats
    app.get("/all-products", async (req, res) => {
      try {
        const queryParams = req.query;

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

    // Add to Wishlist
    app.put("/wishlist/add", async (req, res) => {
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
    app.put("/wishlist/remove", async (req, res) => {
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

    // wishlist products
    app.get("/wishlist", async (req, res) => {
      const { email } = req.query;
      const user = await userCollection.findOne({ email: email });
      const products = await productCollection
        .find({ _id: { $in: user.wishlist.map((id) => new ObjectId(id)) } })
        .toArray();
      res.json({ success: true, data: products });
    });

    // Add to Cartlist
    app.put("/cartlist/add", async (req, res) => {
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
    app.put("/cartlist/remove", async (req, res) => {
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
    app.get("/cartlist", async (req, res) => {
      const { email } = req.query;
      const user = await userCollection.findOne({ email: email });
      const products = await productCollection
        .find({ _id: { $in: user.cartlist.map((id) => new ObjectId(id)) } })
        .toArray();
      res.json({ success: true, data: products });
    });

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

// const express = require("express");
// const cors = require("cors");
// const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");
// const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// require("dotenv").config();
// const app = express();
// const port = process.env.PORT || 3000;

// // middlewares
// app.use(
//   cors({
//     origin: ["http://localhost:5173", "https://gadgetbd-client.vercel.app"],
//     credentials: true,
//   })
// );
// app.use(express.json());
// app.use(cookieParser());

// // verify token
// const verifyToken = (req, res, next) => {
//   const token = req.cookies?.token;
//   if (!token) {
//     return res.status(401).send({ message: "unathorized access" });
//   }
//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err) {
//       return res.status(401).send({ message: "unathorized access" });
//     }
//     req.user = decoded;
//     if (req.body?.email !== req.user?.email) {
//       return res.status(403).send({ message: "forbidden access" });
//     }
//     next();
//   });
// };

// // MongoDb

// const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.rfr5aqt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
// });

// // cookie option

// const cookieOptions = {
//   httpOnly: true,
//   sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
//   secure: process.env.NODE_ENV === "production" ? true : false,
// };

// const userCollection = client.db("gadgetBd").collection("userCollection");
// const productCollection = client.db("gadgetBd").collection("productCollection");

// const connectDb = async () => {
//   try {
//     // seller route
//     // delete product
//     app.delete("/delete-product/:id", async (req, res) => {
//       const id = req.params.id;
//       // console.log(id);

//       const result = await productCollection.deleteOne({
//         _id: new ObjectId(id),
//       });
//       res.json({ message: "success" });
//     });

//     // load single product
//     app.get("/signle-product/:id", async (req, res) => {
//       const id = req.params.id;
//       // console.log(id);
//       const query = { _id: new ObjectId(id) };
//       const result = await productCollection.findOne(query);
//       res.json({ message: "success", data: result });
//     });

//     // update a product
//     app.patch("/update-product/:id", async (req, res) => {
//       const updatedProduct = req.body;
//       const id = req.params.id;
//       const query = { _id: new ObjectId(id) };
//       const update = { $set: updatedProduct };

//       const result = await productCollection.updateOne(query, update);
//       res.json({ message: "success", status: 200 });
//     });

//     // add product
//     app.post("/add-product", async (req, res) => {
//       const productData = req.body;
//       // console.log(productData);

//       const result = await productCollection.insertOne(productData);
//       res.json({ message: "success", status: 200 });
//     });

//     // my products
//     app.get("/my-products", async (req, res) => {
//       const email = req.query.email;
//       // console.log(email);
//       try {
//         const result = await productCollection.find({ email: email }).toArray();
//         res.json({ message: "success", data: result });
//       } catch (error) {
//         res.json({ message: "error" });
//       }
//     });

//     // Load all products
//     app.get("/all-products", async (req, res) => {
//       try {
//         const queryParams = req.query;
//         const query = {};
//         if (queryParams.featured) {
//           query.featured = queryParams.featured === "true";
//         }
//         const result = await productCollection.find(query).toArray();
//         res.json({
//           status: 200,
//           data: result,
//         });
//       } catch (error) {
//         console.error("Error loading products:", error);
//         res.status(500).json({
//           status: 500,
//           message: "Failed to load products",
//           error,
//         });
//       }
//     });

//     // save user after sign up
//     app.post("/users", async (req, res) => {
//       const data = req.body;
//       const existingUser = await userCollection.findOne({ email: data.email });
//       if (existingUser) {
//         res.json({ message: "Email Already Exist" });
//       }
//       const result = await userCollection.insertOne(data);
//       res.json({ message: "Success", status: 200 });
//     });

//     // load logged user
//     app.get("/user/:email", async (req, res) => {
//       const email = req.params.email;
//       // console.log(email);
//       const currentUser = await userCollection.findOne({ email: email });
//       res.json({ message: "success", data: currentUser });
//     });

//     // Authentication by jwt
//     app.post("/jwt", async (req, res) => {
//       const user = req.body;
//       // console.log(user);
//       const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
//       res.cookie("token", token, cookieOptions).send({ success: true });
//     });

//     app.post("/log-out", async (req, res) => {
//       res
//         .clearCookie("token", { ...cookieOptions, maxAge: 0 })
//         .send({ success: true });
//     });

//     client.connect();
//     console.log("Database connected successfully");
//   } catch (error) {
//     console.log(error.name, error.message);
//   }
// };

// connectDb();

// // api

// app.get("/", (req, res) => {
//   res.send("Server is running");
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
