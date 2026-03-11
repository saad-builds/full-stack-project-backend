const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
require("./utils/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./Models/userModel");
const productModel = require("./Models/productModel");
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://full-stack-project-frontend-psi.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// ADD PRODUCT -- POST
app.post("/add", isLoggedin, async (req, res) => {
  await productModel.create(req.body);
  return res.status(201).send("Product Added");
});

// GET PRODUCTS
app.get("/get-products", isLoggedin, async (req, res) => {
  const products = await productModel.find();
  if (products.length === 0) {
    return res.json({ message: "No products found" });
  }
  return res.json({ message: "Here are all the products", products });
});

app.get("/get-single-product/:id", isLoggedin, async (req, res) => {
  const productId = req.params.id;

  const getSingleProduct = await productModel.findOne({ _id: productId });
  if (!getSingleProduct) {
    return res.status(404).send("Product not found");
  }

  return res
    .status(200)
    .json({ message: "Here are your product details", getSingleProduct });
});

// UPDATE PRODUCT
app.put("/update-product/:id", isLoggedin, async (req, res) => {
  const productId = req.params.id;
  const findProduct = await productModel.findById(productId);
  if (!findProduct) {
    return res.send("No Product Found.");
  }
  const updateProduct = await productModel.findByIdAndUpdate(
    productId,
    req.body,
    { new: true },
  );
  return res.json({ message: "Product Updated Successfully", updateProduct });
});

// DELETE PRODUCT
app.delete("/delete-product/:id", isLoggedin, async (req, res) => {
  const productId = req.params.id;

  await productModel.findByIdAndDelete({ _id: productId });
  return res.send("Product Delete Successfully.");
});

// Register User API

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

        // Validate inputs
    if (!username || !email || !password) {
      return res.status(400).send("All fields are required");
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send("Email already registered");
    }

    const saltRounds = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userCreate = await userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    if (!userCreate) {
      res.status(404).send("Error while creating user.");
    }

    return res.status(200).send("User Created Successfully.");
  } catch (error) {
    console.log("something is wrong", error);
    return res.status(500).send("Server error");
  }
});

// Login user API

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const findEmail = await userModel.findOne({ email: email });
    if (!findEmail) {
      return res.status(404).send("Incorrect email");
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      findEmail.password,
    );

    if (!isPasswordCorrect) {
      return res.status(404).send("Incorrect password");
    }

    const token = jwt.sign(
      {
        userId: findEmail._id,
        email: findEmail.email,
      },
      process.env.JWT_SECRECT_KEY,
      { expiresIn: "20m" },
    );

    return res.status(200).json({ message: "User logged in.", token });
  } catch (error) {
    console.log("something is wrong", error);
    return res.status(200).send("Server error");
  }
});

app.post("/logout", (req, res) => {
  // If you were using cookies, clear the token cookie
  res.cookie("token", "", { httpOnly: true, expires: new Date(0) });

  // Send JSON response for frontend SPA
  res.status(200).json({ message: "Logged out successfully" });
});

// middleware to verify token

function isLoggedin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const data = jwt.verify(token, process.env.JWT_SECRECT_KEY);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
// runs a server

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
