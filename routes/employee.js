import { Collection } from 'mongodbext'
import { ObjectID } from 'mongodb'

export default (app, db) => {
  const employees = new Collection(db, 'employee');

  app.get('/employee/:email?', ({ params }, res) => {
    const { email } = params
    const query = email ? { email } : {}

    employees
      .find(query)
      .toArray((error, findResult) => {
        if (error) {
          res.send({ error });

          return
        }

        res.send(findResult);
      });
  });

  app.post('/employee', ({ body }, res) => {
    const filter = { email: body.email }
    const options = {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    }

    employees
      .findOneAndUpsert(filter, body, options)
      .then((err, updateRes) => {
        console.log(err, updateRes)
        res.send(updateRes)
      });
  });

  app.put('/employee/:id', ({ params, body }, res) => {
    const filter = { _id: ObjectID(params.id) }

    employees
      .updateOne(filter, { $set: body })
      .then(updateRes => res.send(updateRes));
  });

  app.delete('/employee/:id', ({ params, body }, res) => {
    const filter = { _id: ObjectID(params.id) }

    employees
      .deleteOne(filter, { $set: body })
      .then(deleteRes => res.send(deleteRes));
  })
}
