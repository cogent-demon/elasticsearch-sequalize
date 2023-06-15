"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const data_model_1 = __importDefault(require("./models/data.model"));
const express_1 = __importDefault(require("express"));
const elasticsearch_1 = __importDefault(require("@elastic/elasticsearch"));
const app = (0, express_1.default)();
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
const headers = ["url", "description", "duration", "thumbnail", "iframe", "keywords", "author", "no", "type", "quality"];
function readcsv(filename) {
    // Read CSV file
    let cache = [];
    let rowCount = 0;
    let finalRowCount;
    fs_extra_1.default.createReadStream(filename)
        .pipe((0, csv_parser_1.default)({ headers: headers, separator: ";", }))
        .on('data', (rowData) => {
        const rawData = Object.values(rowData).reduce((a, b) => a + ';' + b).split(';');
        for (let i = 0; i < headers.length; i++) {
            rowData[headers[i]] = rawData[i];
        }
        cache.push(rowData);
        insert_to_elastic_server(rowData);
        rowCount++;
        console.log(rowCount);
        if (cache.length == 3000) {
            insert_rows(cache, rowData);
            cache = [];
            return;
        }
    })
        .on('end', () => {
        finalRowCount = rowCount;
        if (cache.length) {
            insert_rows(cache, finalRowCount);
        }
        console.log('upload ended', finalRowCount);
    });
}
function insert_rows(cache, rowCount) {
    return;
    data_model_1.default.bulkCreate(cache).then(() => {
        console.log('saved', rowCount);
    });
}
const client = new elasticsearch_1.default.Client({
    node: 'https://localhost:9200',
    auth: {
        username: process.env.ELASTIC_USERNAME,
        password: process.env.ELASTIC_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});
function insert_to_elastic_server(rowData) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(rowData);
        client.index({
            index: 'cup-index',
            body: rowData
        });
        //client.indices.refresh({index: 'cup-index'})
    });
}
function elastic_search(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = yield client.search({
            index: 'cup-index',
            body: {
                query: {
                    match: data
                }
            }
        });
        return body.hits.hits;
    });
}
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});
app.post('/insert', (req, res) => {
    const { data } = req;
    readcsv('data/data.csv');
});
app.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.query;
    const keys = Object.keys(data);
    console.log(keys);
    let query = {};
    for (var i = 0; i < keys.length; i++)
        if (data[keys[i]] != '') {
            query[keys[i]] = data[keys[i]];
            break;
        }
    if (Object.keys(query).length == 0)
        query = { description: "" };
    console.log(query);
    const matching_data = yield elastic_search(query);
    console.log(matching_data);
    res.send(matching_data);
}));
app.get('/', (req, res, next) => {
    res.send("Server running!");
});
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
/*sequelize.sync().then(() => {
    readcsv('data/data.csv');
});*/
//readcsv('data/data.csv');
//# sourceMappingURL=app.js.map