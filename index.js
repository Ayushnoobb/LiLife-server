const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();

const mongoUrl = "mongodb+srv://ayushwilltry:6shwSK98vY9rwp73@online-mart.2y7oe4z.mongodb.net/?retryWrites=true&w=majority"
const { MongoClient, ObjectId } = require('mongodb');
const e = require("express");
const client = new MongoClient(mongoUrl);
const db = client.db("Online-Mart");
const product = db.collection("product");


const users = db.collection("user");



router.get("/" , (req , res) => {
    res.redirect("/admin")
})

router.get("/api/products/:id",async(req , res) =>{
    await client.connect();
    try{
        const productId = req.params.id;
        const prod = await product.findOne({ _id: new ObjectId(productId) });
        await res.json(prod);
        client.close();
    }catch(error){
        console.log(error);
    }finally{
        client.close();
    }
})

router.put("/api/products/edit/:id" , async(req , res) => {
    await client.connect()

    try{
        const proId = req.params.id;
        const result = await product.findOneAndUpdate(
            { _id: new ObjectId(proId) }, // Filter to find the document
            { $set: req.body }, // Update data using $set operator
            { returnOriginal: false } // Return the updated document
        );
        if (result.value) {
            console.log("Product updated successfully:", result.value);
            res.redirect("/admin/products");
        } else {
            console.log("Product not found");
            res.status(404).send("Product not found");
        }
    }catch(error){
        console.log(error);
    }finally{
        client.close();
    }
})

// router.get("api")

router.delete("/api/proudcts/remove/:id",async(req , res) =>{
    console.log("received req")
    await client.connect();
    try{
        const proId = req.params.id;
        console.log(proId)
        const result = await product.findOneAndDelete({_id : new ObjectId(proId)})
        console.log(result);

        if(result){
            res.status(200).redirect("/admin/products")
        }else{
            res.status(500).send("Not found product")
        }
    }
    catch(error){
        console.log(error)
    }finally{
        client.close();
    }
}) 



router.post("/api/login", async (req, res) => {
    try {
      await client.connect();
  
      let email = req.body.email;
      console.log(email)
      let result = await users.findOne({ email });
  
      console.log(typeof(req.body.password))
      console.log(result)
      console.log(typeof(result.password))

      if (result && req.body.password == result.password) {
        console.log("Login successful");
        res.redirect("/admin"); // Redirect upon successful login
      } else {
        console.log("Login failed");
        res.status(401).send("Login failed"); // Unauthorized
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Internal Server Error");
    }finally{
        client.close();
    }
});



router.post("/api/sign-up" , async(req ,res) => {
    console.log(req + "req")
    let data = await JSON.parse(req.body);
    console.log(data)
    let email = req.body.email;
    let password = req.body.password;
    let repassword = req.body.repassword;

    await client.connect();

    try{

        users.insertOne(
            {
                "email":email,
                "password":password,
                "repassword":repassword
            },
            (err , result) =>{
                if(err){
                    console.error("the error is : " + err);
                    res.status(400).send("Error registering your data")
                }else{
                    res.status(200).redirect("/");
                }
            }
        )
    }catch(error){
        console.error("the error is : " + error);
    }finally{
        client.close();
    }


})

router.get("/api/products",async(req,res) =>{
    await client.connect();
    try{
        const products = await product.find({}).toArray();
        res.json(products);
    }catch(error){
        console.log(error);
    }finally{
        client.close();
    }
})





router.post("/api/products/insert", async(req,res) =>{
    await client.connect();

    let product_name = req.body.product_name;
    let product_brand = req.body.product_brand;
    let product_description = req.body.product_description;
    let product_price = req.body.product_price;
    let product_category = req.body.product_category;
    let product_rate = req.body.product_rate;
    let product_img = req.body.product_img;
    let product_size = req.body.product_size;

    let product_quantity = req.body.product_quantity;
    let product_discount = req.body.product_discount;


    try{
            await product.insertOne({
            'product_name': product_name,
            'product_brand': product_brand,
            'product_description': product_description,
            'product_price': product_price,
            'product_category': product_category,
            'product_rate': product_rate,
            'product_img': product_img,
            'product_size': product_size,
            'product_discount': product_discount,
            'product_quantity': product_quantity,
        })
        res.redirect("/admin/products");
    }catch(error){
        console.log(error);
    }finally{
        client.close();
    }

})

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
