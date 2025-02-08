const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const port = 3000;

mongoose.connect("mongodb://127.0.0.1:27017/quotesDB")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));



const quoteSchema = new mongoose.Schema({
    text: String,
    author: String
});

const Quote = mongoose.model("Quote", quoteSchema);

app.set("view engine", "ejs");


app.use(express.urlencoded({ extended: true }));  // To parse form data
app.use(express.static(path.join(__dirname, "public")));


app.get("/", async (req, res) => {
    try {
        
        const response = await axios.get("https://favqs.com/api/qotd");
        const quote = response.data.quote;
        const savedQuotes = await Quote.find();

        res.render("index", { quote, savedQuotes });
    } catch (error) {
        res.status(500).send("Failed to fetch quote");
    }
});


app.post("/save", async (req, res) => {
    const { text, author } = req.body;

    const existingQuote = await Quote.findOne({ text });
    if (!existingQuote) {
        const newQuote = new Quote({ text, author });
        await newQuote.save();
    }

    res.redirect("/");
});

app.get("/search", async (req, res) => {
    const searchQuery = req.query.q;
    const foundQuotes = await Quote.find({ author: new RegExp(searchQuery, "i") });

    res.render("search", { foundQuotes, searchQuery });
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
