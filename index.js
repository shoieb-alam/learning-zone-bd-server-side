const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware:
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8su0x.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('database connected');
        const database = client.db("LearningZone");
        const coursesCollection = database.collection("courses");
        const buyingCollection = database.collection("buyings");
        const usersCollection = database.collection("users");
        const reviewCollection = database.collection("reviews");

        // GET API 
        app.get('/courses', async (req, res) => {
            const cursor = coursesCollection.find({});
            const courses = await cursor.toArray();
            res.send(courses);
        });

        // GET SINGLE ITEM 
        app.get('/courses/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const course = await coursesCollection.findOne(query);
            res.json(course);
        })

        // POST API 
        app.post('/courses', async (req, res) => {
            const course = req.body;
            console.log('hit the post api', course);
            const result = await coursesCollection.insertOne(course);
            console.log(result);
            res.json(result);
        });

        // DELETE API   
        app.delete('/courses/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await coursesCollection.deleteOne(query);
            res.json(result);
        });

        // ADD BUYING API 
        app.post('/buyings', async (req, res) => {
            const buyings = req.body;
            const result = await buyingCollection.insertOne(buyings);
            res.json(result);
        })

        // GET BUYINGS 
        app.get('/myCourses/:email', async (req, res) => {
            const result = await buyingCollection.find({ email: req.params.email, }).toArray();
            res.send(result);
        })

        //DELETE BUYING
        app.delete('/myCourses/:email', async (req, res) => {
            console.log(req.params.email);
            const result = await buyingCollection.deleteOne({ email: req.params.email });
            res.send(result);
        });

        // POST REVIEW API 
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            console.log('hit the post api', review);
            const result = await reviewCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });

        // GET REVIEW API 
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //VERIFYING ADMIN
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // ADDING NEW USER 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // SETTING ADMIN
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })
    }

    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running my CRUD server');
});
app.listen(port, () => {
    console.log('Running server on port', port);
});
