import { Collection } from 'mongodbext'
import employee from './employee.js'
import absense from './absense.js'

export default (app, db) => {
  employee(app, db)
  absense(app, db)
}
