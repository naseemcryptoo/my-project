const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { exec } = require("child_process");
const fs = require("fs");


// Middleware
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log(`${req.method} request to ${req.url}`);
    next();
});
app.use(express.urlencoded({ extended: true }));


// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/Ecommerce")
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// Home Route
app.get("/", (req, res) => {
    res.send("Express App is Running");
});


// Multer storage for image uploads
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.originalname}`);
    }
});
const upload = multer({ storage: storage });
app.use('/images', express.static('upload/images'));

// Upload Route
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required: true,

    },
    name:{
        type:String,
        required:true,
    
    },
    image:{
        type:String,
        required:true,
    },

    category:{
        type:String,
        required:true,
    
    },
    new_price:{
        type:Number,
        required:true,
    
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,

    },

})

app.post('/addproduct', async (req, res) => {
    try {
        let products = await Product.find({});
        let id; 
        
        if (req.body.id) {
            id = req.body.id; 
        } else {
            if (products.length > 0) {
                let last_product_array = products.slice(-1);
                let last_product = last_product_array[0];
                id = last_product.id + 1;
            } else {
                id = 1;
            }
        }
        const product = new Product({ 
            id: id, 
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await product.save();

        console.log("Product Saved:", product);
        res.json({ 
            success: true,
            name: req.body.name,
        });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


app.post('/updateproduct', async (req, res) => {
    try {
        const { id, name, image, category, new_price, old_price } = req.body;
        const product = await Product.findOneAndUpdate(
            { id },
            { name, new_price, old_price },
            { new: true }
        );
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });
        console.log("Product Updated:", product);
        res.json({ success: true, message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("Removed");
    res.json({ success: true, name: req.body.name });
});

app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
});

const Users = mongoose.model('Users',{
    name:{
        type:String,

    },
    email:{
        type:String,
        unique:true,

    },
    password:{
        type:String,

    },
    cartData:{
        type:Object,

    },
    date:{
        type:Date,
        default:Date.now,

    }

})

const ConfirmOrder = mongoose.model("ConfirmOrder", {
    fullName: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    paymentMethod: { type: String, required: true },
    items: [
      {
        productId: { type: Number, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        total: { type: Number, required: true },
      },
    ], // Store product details in the order
    date: { type: Date, default: Date.now },
  });
  

// User Authentication
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) return res.status(400).json({ success: false, errors: "Existing user found with the same email address" });
    
    let cart = {};
    for (let i = 0; i < 30; i++) cart[i] = 0;
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        cartData: cart
    });
    await user.save();

    const data = { user: { id: user.id } };
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token });
});

app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = await bcrypt.compare(req.body.password, user.password);
        if (passCompare) {
            const data = { user: { id: user.id } };
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        } else {
            res.json({ success: false, errors: "Wrong Password" });
        }
    } else {
        res.json({ success: false, errors: "Wrong Email ID" });
    }
});

// Product Queries
app.get('/newcollections', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("Newcollection Fetched");
    res.send(newcollection);
});

app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: "women" });
    let popular_in_women = products.slice(0, 4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
});

app.get('/relatedproducts', async (req, res) => {
    let products = await Product.find({ category: "women" });
    let relatedproducts = products.slice(0, 4);
    console.log("Related Products Fetched");
    res.send(relatedproducts);
});


// Middleware to Fetch User
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send({ errors: "Please authenticate using a valid token" });
    try {
        const data = jwt.verify(token, 'secret_ecom');
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
};

//profile
app.put('/profile/update', fetchUser, async (req, res) => {
    const { name, email } = req.body;

    try {
        const user = await Users.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (name) user.name = name;
        if (email) user.email = email;

        await user.save();
        res.json({ success: true, message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});


app.post("/confirmorder", async (req, res) => {
    const { fullName, city, address, paymentMethod, items } = req.body;
  
    if (!fullName || !city || !address || !paymentMethod || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
  
    try {
      const order = new ConfirmOrder({
        fullName,
        city,
        address,
        paymentMethod,
        items, // Store the items array with product details
      });
  
      await order.save();
      console.log("Order Confirmed:", order);
      res.json({ success: true, message: "Order placed successfully!" });
    } catch (error) {
      console.error("Error placing order:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });
  
  
// Middleware to serve static files from the results folder
app.use("/VITON-HD/results", express.static(path.join(__dirname, "VITON-HD/results")));

// Function to ensure directories exist
const createDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Ensure necessary directories exist
createDirectory(path.join(__dirname, "VITON-HD/datasets/test/image"));
createDirectory(path.join(__dirname, "VITON-HD/datasets/test/cloth"));
createDirectory(path.join(__dirname, "VITON-HD/results"));

// Multer configuration for file uploads
const storagevto = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "personImage") {
      cb(null, "./VITON-HD/datasets/test/image");
    } else if (file.fieldname === "clothImage") {
      cb(null, "./VITON-HD/datasets/test/cloth");
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const uploadvto = multer({ storage: storagevto });

// Endpoint to process VITON-HD
app.post(
  "/process-vitons",
  uploadvto.fields([
    { name: "personImage" },
    { name: "clothImage" },
  ]),
  async (req, res) => {
    try {
      console.log('Uploaded files:', req.files);

      // Ensure both images are uploaded
      if (!req.files || !req.files.personImage || !req.files.clothImage) {
        return res.status(400).send({ message: "Both person and cloth images are required." });
      }

      const personImage = req.files.personImage[0].originalname;
      const clothImage = req.files.clothImage[0].originalname;

      // Clear and update test_pairs.txt with person and cloth image names
      const testPairsPath = path.join(__dirname, "VITON-HD/datasets/test_pairs.txt");
      fs.writeFileSync(testPairsPath, `${personImage} ${clothImage}\n`);

      // Generate a unique name for this test run
      const uniqueName = `${Date.now()}`;

      // Run the VITON-HD processing script
      exec(
        `python ./VITON-HD/test.py --name ${uniqueName} --checkpoint_dir ./VITON-HD/checkpoints --dataset_dir ./VITON-HD/datasets`,
        (error, stdout, stderr) => {
          if (error) {
            console.error("Error running VITON-HD script:", error);
            return res.status(500).send({ message: "Error processing VITON-HD." });
          }

          console.log("VITON-HD Output:", stdout);

          // Construct the result image path
          const resultImageName = `${personImage.split('_')[0]}_${clothImage.split('_')[0]}_${clothImage.split('_')[1]}`;
          const resultImagePath = path.join(__dirname, "VITON-HD/results", uniqueName, resultImageName);

          // Check if the result image exists
          if (!fs.existsSync(resultImagePath)) {
            return res.status(500).send({ message: "Result image not found." });
          }

          const resultImageUrl = `/VITON-HD/results/${uniqueName}/${resultImageName}`;

          // Send response with result URL
          res.status(200).send({
            message: "Processing complete.",
            result: resultImageUrl,
          });
        }
      );
    } catch (err) {
      console.error("Error:", err);
      res.status(500).send({ message: "Server error during processing." });
    }
  }
);



// User Profile
app.get('/profile', fetchUser, async (req, res) => {
    try {
        const user = await Users.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

// Reset Password
app.post('/profile/reset-password', fetchUser, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await Users.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Incorrect old password" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save();

        res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.post('/removefromcart',fetchUser, async(req,res)=>{

    console.log("removed",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId] -= 1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed")

})



app.post('/addtocart', fetchUser, async(req,res)=>{

    console.log("Added",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});// Fetch the user data from the database using the authenticated user's ID
    userData.cartData[req.body.itemId] += 1; // Increment the quantity of the item in the user's cart
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});   // Update the user's cart in the database
    res.send("Added")  // Send a response to the client indicating that the item has been added
 
 })


app.post('/getcart', fetchUser, async(req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);//This line sends the cartData as a JSON response to the client.
    //The client will receive the current state of the user's cart
})




app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on Port "+ port)
    }

    else{
        console.log("Error: "+error)
    }

})
