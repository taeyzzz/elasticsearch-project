const express = require("express");
const { Client } = require("@elastic/elasticsearch");
const { faker } = require("@faker-js/faker");

const app = express();
app.use(express.json());

const PORT = 3000;

const genres = [
  "Fantasy",
  "Science",
  "Mystery",
  "Historical",
  "Romance",
  "Horror",
  "Biography",
  "Adventure",
];

const getRandomGenre = () => {
  const randomIndex = Math.floor(Math.random() * genres.length);
  return genres[randomIndex];
};

// Instantiate Elasticsearch client
const client = new Client({ node: "http://localhost:9200" });

app.get("/init", async (req, res) => {
    for (let i = 0; i < 10000; i++) {
      let book = {
        title: faker.commerce.productName(),
        author: faker.person.fullName(),
        genre: getRandomGenre(),
        publish: faker.date.anytime()
      };
      console.log("position ", i, "title", book.title);
      await client.index({
        index: "books",
        body: book,
      });
    }
    res.send({ success: true, message: "generated data" });
});

app.get("/search", async (req, res) => {
    const { q } = req.query;
  
    if (!q) {
      return res.status(400).send({ error: "Query parameter q is required." });
    }
  
    try {
      const result = await client.search({
        index: "books",
        body: {
          query: {
            match: {
              author: q,
            },
          },
        },
      });
  
      console.log(result);
      
      res.send(result.hits.hits);
    } catch (error) {
      console.error("Elasticsearch error:", error);
      res.status(500).send({ error: "Failed to search." });
    }
});
  

app.listen(PORT, () => {
  console.log(`Express server started on http://localhost:${PORT}`);
});
