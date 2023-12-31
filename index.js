const express = require('express')
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors())
app.use(express.json())


const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });
    }
    // bearer token
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}




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

        const usersCollection = client.db('petry-of-introversion').collection('users');



        // JWT Token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })



        // verifyAdmin start
        // Warning: use verifyJWT before using verifyAdmin
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ error: true, message: 'forbidden message' });
            }
            next();
        }


        // users related API start

        // for post
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);
        });


        // for get user
        app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });


        // delete admin
        app.delete('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await usersCollection.deleteOne(query);
            res.send(result);
        })


        // patch
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    role: 'admin'
                },
            };

            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);

        })


        // for admin get
        // get
        app.get('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;

            if (req.decoded.email !== email) {
                res.send({ admin: false })
            }

            const query = { email: email }
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            res.send(result);

        })


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

        // post daily Blog
        app.post('/dailyBlog', verifyJWT, verifyAdmin, async (req, res) => {
            const newItem = req.body;
            const result = await dailyBlogCollection.insertOne(newItem);

            res.send(result)
        })


        // delete daily blog
        app.delete('/dailyBlog/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await dailyBlogCollection.deleteOne(query);
            res.send(result);
          })


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


        // post novel
        app.post('/novel', verifyJWT, verifyAdmin, async (req, res) => {
            const newItem = req.body;
            const result = await novelCollection.insertOne(newItem);

            res.send(result)
        })


        // delete novel
        app.delete('/novel/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await novelCollection.deleteOne(query);
            res.send(result);
          })




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