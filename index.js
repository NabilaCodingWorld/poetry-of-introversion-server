const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors())
app.use(express.json())



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zx1pf4.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const dailyBlogCollection = client.db('petry-of-introversion').collection("dailyBlog");

        const novelCollection = client.db('petry-of-introversion').collection("novel");

        const quoteCollection = client.db('petry-of-introversion').collection("quote");


        // daily blog
        app.get('/dailyBlog', async (req, res) => {
            const result = await dailyBlogCollection.find().toArray();
            res.send(result);
        })

        // single data load from daily blog
        app.get('/dailyBlog/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const options = {
                projection: {
                    image: 1,
                    author: 1,
                    text: 1,
                    date: 1,

                }
            }

            const result = await dailyBlogCollection.findOne(query, options);
            res.send(result);
        });


        // novel
        app.get('/novel', async (req, res) => {
            const result = await novelCollection.find().toArray();
            res.send(result);
        })


        // single data load from novel
        app.get('/novel/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };

            const options = {
                projection: {
                    image: 1,
                    author: 1,
                    text: 1,
                    date: 1,

                }
            }

            const result = await novelCollection.findOne(query, options);
            res.send(result);
        });


        // quote
        app.get('/quote', async (req, res) => {
            const result = await quoteCollection.find().toArray();
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Nabila is comming')
})

app.listen(port, () => {
    console.log(`Nabila is sitting soon ${port}`)
})