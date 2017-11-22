import express from 'express'
import { MongoClient } from 'mongodb'
import bodyParser from 'body-parser'

import routes from './routes'
import db from './db'

const app = express()
const port = 8000

MongoClient.connect(db.url, (err, database) => {
  if (err) {
    throw err
  }

  app.use(bodyParser.urlencoded({ extended: true }));

  routes(app, database);

  app.listen(port, () => {
    console.log(`Server started on ${port}.`);
  });
});
