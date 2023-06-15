import { config } from 'dotenv';
config();
import csv from 'csv-parser';
import fs from 'fs-extra';
import sequelize from './db';
import Data from './models/data.model';
import express from 'express';
import elasticsearch from '@elastic/elasticsearch'

const app = express();
const port = process.env.PORT || 3030;

let buff = "";
let count = 0;

// fs.createReadStream("data/data.csv", { encoding: 'utf-8'}).on('data', (chunk) => {
//     buff += chunk;
//     if(++count == 10) {
//         fs.writeFileSync("data/part1.csv", buff);
//         process.exit();
//     }
// })

const headers = ["url","description","duration","thumbnail","iframe","keywords","author","no","type","quality"];

function readcsv(filename) {
      // Read CSV file
      let cache = [];
      let rowCount = 0;
      let finalRowCount;

    fs.createReadStream(filename)
    .pipe(csv({ headers: headers, separator: ";", }))
    .on('data', (rowData) => {
        const rawData = (Object.values(rowData).reduce((a,b) => a + ';' + b) as string).split(';');
        for(let i = 0; i < headers.length; i ++) {
            rowData[headers[i]] = rawData[i];
        }
        cache.push(rowData);
        insert_to_elastic_server(rowData);
        rowCount ++;
        console.log(rowCount);
        if(cache.length == 3000) {
            insert_rows(cache, rowData)
            cache = [];
            return;
        }
    })
    .on('end', () => {
        finalRowCount = rowCount;
        if(cache.length) {
            insert_rows(cache, finalRowCount);
        }
        console.log('upload ended', finalRowCount);
    });

}

function insert_rows(cache, rowCount) {
    return;
    Data.bulkCreate(cache).then(() => {
        console.log('saved', rowCount);
    });

}

const client = new elasticsearch.Client({
    node: 'https://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
})

async function insert_to_elastic_server(rowData){
    console.log(rowData)
    client.index({
        index: 'cup-index',
        body: rowData
    })
    //client.indices.refresh({index: 'cup-index'})
}

async function elastic_search(data) {
    const body = await client.search({
        index: 'cup-index',
        body: {
            query: {
                match: data
            }
        }
    })
    return body.hits.hits;
}
  
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

app.post('/insert', (req, res) => {
    const {data} = req;
    readcsv('data/data.csv');
})
  
app.get('/search', async (req, res) => {
    const data = req.query;
    const keys = Object.keys(data);
    console.log(keys)
    let query = {};
    for(var i = 0; i < keys.length; i ++)
        if(data[keys[i]] != ''){query[keys[i]] = data[keys[i]]; break}
    if(Object.keys(query).length == 0) query = {description:""};
    console.log(query);
    const matching_data = await elastic_search(query);
    console.log(matching_data)
    res.send(matching_data);
})

app.get('/', (req, res, next) => {
    res.send("Server running!");
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

/*sequelize.sync().then(() => {
    readcsv('data/data.csv');
});*/
//readcsv('data/data.csv');