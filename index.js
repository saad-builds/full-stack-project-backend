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
  "https://full-stack-project-frontend-psi.vercel.app"
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
    credentials: true
  })
);



// ADD PRODUCT -- POST
app.post("/add", async (req, res) => {
await productModel.create(req.body);
return res.status(201).send("Product Added");
});
// GET PRODUCTS
app.get("/get-products", async (req, res) => {
const products = await productModel.find();
if (products.length === 0) {
  return res.json({ message: "No products found" });
}
return res.json({message: "Here are all the products", products});  
});


app.get("/get-single-product/:id", async (req, res) => {
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
app.put("/update-product/:id", async (req, res) => {
  const productId = req.params.id;
  const findProduct = await productModel.findById(productId);
  if (!findProduct) {
    return res.send("No Product Found.");
  }
  const updateProduct = await productModel.findByIdAndUpdate(productId, req.body, { new: true });
  return res.json({ message: "Product Updated Successfully", updateProduct });
});



// DELETE PRODUCT
app.delete("/delete-product/:id", async (req, res) => {
  const productId = req.params.id;
  
  await productModel.findByIdAndDelete({ _id: productId });  
  return res.send("Product Delete Successfully.");
 })



// create User API

app.post("/create-user", async (req, res) => {
  if (!req.body) {
    return res.send("No Data found");
  }

  const userData = await userModel.create(req.body);

  if (userData) {
    return res.json({ message: "data recived", userData });
  } else {
    return res.json({ message: "data not saved. Error" });
  }
});

// get all users API

app.get("/get-users", async (req, res) => {
  const userData = await userModel.find();
  if (userData.length > 0) {
    return res.json({ message: "here are all the users", userData });
  } else {
    return res.json({ message: "no users found" });
  }
});

// get single user details API

app.get("/get-single-user/:id", async (req, res) => {
  const userId = req.params.id;

  const getSingleUser = await userModel.findOne({ _id: userId });
  if (!getSingleUser) {
    return res.status(404).send("User not found");
  }

  return res
    .status(200)
    .json({ message: "Here are your user details", getSingleUser });
});

// UPDATE a user
app.put("/update-user/:id", async (req, res) => {
  const userId = req.params.id;
  const findUser = await userModel.findOne({ _id: userId });
  if (!findUser) {
    return res.json({ message: "No user found" });
  }

  const updateUser = await userModel.findByIdAndUpdate(userId, req.body, {
    new: true,
  });

  return res.send("User updated successfully");
});

// delete user API

app.delete("/delete-user/:id", async (req, res) => {
  const userId = req.params.id;

  const findUser = await userModel.findById(userId);
  if (!findUser) {
    return res.send("No User Found.");
  }

  const deleteUser = await userModel.findByIdAndDelete(userId);
  return res.send("User Delete Successfully.");
});

// Register User API

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

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
      findEmail.password
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
      { expiresIn: "20m" }
    );

    return res.status(200).json({ message: "User logged in.", token });

    
  } catch (error) {
    console.log("something is wrong", error);
    return res.status(200).send("Server error");
  }
});

// runs a server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
