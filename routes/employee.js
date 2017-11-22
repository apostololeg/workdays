import { Collection } from 'mongodbext'

export default (app, db) => {
  const employees = new Collection(db, 'employee');

  app.get('/employee/:email?', ({ params }, res) => {
    const { email } = params
    const query = {}

    if (email) {
      query.email = email
    }

    employees
      .find(query)
      .toArray((error, findResult) => {
        if (error) {
          res.send({ error });

          return
        }

        res.send(findResult);
      });
  })

  app.post('/employee', ({ body }, res) => {
    const {
      name,
      email,
      tel,
      notes
    } = body

    employees
      .findOne({ email })
      .then(findResult => {
        if (findResult) {
          res.send({
            error: 'User already exist.',
            data: findResult
          });

          return
        }

        employees
          .insertOne({ name, email, tel, notes })
          .then(insertResult => res.send({
            status: 'OK',
            data: insertResult
          }))
      });
  })
}
