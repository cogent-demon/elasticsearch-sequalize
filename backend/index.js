const express = require('express')
const app = express()
const port = 3000
const { Client } = require('@elastic/elasticsearch')
const config = require('config');
const elasticConfig = config.get('elastic');
const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: elasticConfig.username,
    password: elasticConfig.password,
  },
  tls: {
    rejectUnauthorized: false
  }
})

async function run(data) {
  await client.index({
    index: 'cup',
    body: data
  })
  await client.indices.refresh({index: 'cup'})
}

async function read(data) {
  const body = await client.search({
    index: 'game-of-thrones',
    body: {
      query: {
        match: data
      }
    }
  })
  return body.hits.hits;
}


app.post('/add', (req, res) => {
  const {data} = req;
  run(data);
})

app.post('/find', (req, res) => {
  const {data} = req;
  const ret = read(data);
  res.send({status:200, data:ret})
})

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})