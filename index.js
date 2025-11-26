const express = require("express");
const cors = require("cors");
require("dotenv").config();
// console.log(process.env)
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3001;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vrmmuai.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("NextEvent server is running");
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("next-event_db");
    const eventsCollection = db.collection("events");
    const usersCollection = db.collection("users");
    // USER APIs
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "user already exist, no need to insert" });
      } else {
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
      }
    });

    app.get("/users", async (req, res) => {
      const email = req.query.email;
      console.log("Fetching transactions for:", email);
      const query = {};
      if (email) {
        query.email = email;
      }
      const cursor = usersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // Update a user info by ID
    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedUser.name,
          email: updatedUser.email,
          image: updatedUser.image,
        },
      };
      const result = await usersCollection.updateOne(query, update);
      res.send(result);
    });

    // All events APIs
    app.get("/events", async (req, res) => {
      // const projectField = {title: 1, price_min:1, price_max:1, image:1};
      // const cursor = productsCollection.find().sort({price_min : 1}).skip(2).limit(2).project(projectField);
      const cursor = eventsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //events-details
    app.get("/events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventsCollection.findOne(query);
      res.send(result);
    });

    // my-events sory by date
    app.get("/events-date-sorted", async (req, res) => {
      const email = req.query.email;
      console.log("Fetching events for:", email);
      const query = {};
      if (email) {
        query.user_email = email;
      }
      const cursor = eventsCollection.find(query).sort({ date: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    // add-events
    app.post("/events", async (req, res) => {
      const newTransaction = req.body;
      //   console.log('new transaction', newTransaction);
      const result = await eventsCollection.insertOne(newTransaction);
      res.send(result);
    });

    // // Update a events by ID
    // app.patch("/events/update/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const updatedEvent = req.body;
    //   const query = { _id: new ObjectId(id) };
    //   const update = {
    //     $set: {
    //       type: updatedEvent.type,
    //       description: updatedEvent.description,
    //       category: updatedEvent.category,
    //       amount: updatedEvent.amount,
    //       date: updatedEvent.date,
    //     },
    //   };
    //   const result = await eventsCollection.updateOne(query, update);
    //   res.send(result);
    // });

    // delete-events 
    app.delete("/events/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await eventsCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Next-Event server listening on port ${port}`);
});
