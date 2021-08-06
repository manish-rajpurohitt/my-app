const firebase = require('firebase/auth');

const admin = require('firebase-admin');

//initialize admin SDK using serciceAcountKey
let creds = {
    type: process.env.TYPE,
    projectId: process.env.PROJECT_ID,
    private_key_id: process.env.PRIVATE_KEY_ID,
    privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    clientEmail: process.env.CLIENT_EMAIL,
    client_id: process.env.CLIENT_ID,
    auth_uri: process.env.AUTH_URI,
    token_uri: process.env.TOKEN_URI,
    auth_provider_x509_cert_url: process.env.AUTH_PROVIDER,
    client_x509_cert_url: process.env.CLIENT_X509
}
admin.initializeApp({
credential: admin.credential.cert(creds)
});

var cors = require('cors')
const db = admin.firestore();
var express = require("express");
const { json } = require('body-parser');
const { firestore } = require('firebase-admin');
var app = express();
app.use(cors());

app.use(
    express.urlencoded({
      extended: true
    })
  )
  app.use(express.json())


app.get("/api/getAllProducts", (req, res, next) => {
    db.collection("productsCollection").doc("allProducts").get().then(data=>{
        var ress = data.data();
        res.json(ress);
    })
});
app.post("/api/checkAuth",(req, res)=>{

    let auth = false;
    db.collection("creds").doc("users").get().then(result=>{
        let data = result.data();
        let body = req.body;
        console.log(body.username === data.username && req.body.password === data.password);
        if(body.username === data.username && req.body.password === data.password){
            res.send({"success":"loggedin"});
        }else{
            res.send({"error":"error adding product!!"});
        }
    })
   
})

app.post("/api/addProduct",(req, res)=>{
    var body = req.body;
    username = body.username;
    password = body.password;
    db.collection("creds").doc("users").get().then(result=>{
        let data = result.data();
        if(username === data.username && password === data.password){
            auth = true;
        }else{
            auth = false;
        }
    })
    if(!auth){
        res.send({"error":"error adding product!!"});
        return;
    }
    console.log("req.body" + req.body.productName);
    var ref = db.collection("my_collection").doc();
    var myId = ref.id;
    var data = {
        productName : body.productName,
        category : body.category,
        price : body.price,
        discount:body.discount,
        image:body.image,
        id: myId
    };
    db.collection("productsCollection").doc("allProducts").update({
        products:admin.firestore.FieldValue.arrayUnion(data)
    });
    db.collection("categoriesCollection").doc("allCategories").update({
        categories:firestore.FieldValue.arrayUnion(data.category)
    });
    db.collection("products").doc(myId).set(data);
    res.json(data);
})

app.get("/api/getAllCategories",(req, res)=>{
    db.collection("categoriesCollection").doc("allCategories").get().then(data=>{
        let ress = data.data();
        res.json(ress);
    })
})

app.get("/api/getProductsWithCategory", (req, res)=>{
    let category = req.body.category;
    db.collection("productsCollection").doc("allProducts").get().then(data=>{
        var ress = data.data();
        let arr = ress.categories.map(product=>{
            if(category == product.category) return product;
        })
        ress.categories = arr;
        res.json(ress);
    })
})


app.listen(process.env.PORT || 5000, () => {
    console.log("Server running on port 3000");
   });
