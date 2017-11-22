import { Collection } from 'mongodbext'
import { ObjectID } from 'mongodb'
import { getDatesList } from '../utils/date.js'

const getQuery = params => {
    const query = {}

    if (!params) {
        return {}
    }

    const {
        email,
        status,
        from,
        to } = params

    if (from && to) {
        let days = getDatesList(new Date(from), new Date(to))

        query.days = { $in: days }
    }

    if (email) {
        query.email = {
            $eq: email
        }
    }

    if (status) {
        query.status = {
            $eq: status
        }
    }

    return query
}

const getUpdateData = ({ from, to, status }) => {
    const data = {}

    if (from && to) {
        data.days = getDatesList(new Date(from), new Date(to))
    }

    if (status) {
        data.status = status
    }

    return data
}

const getIntersections = (records, requestedDays) => {
    return records.reduce((acc, { status, days }) => {
        let intersectedDays = days.filter(day => (
            requestedDays.some(reqDay => (
                reqDay.getTime() === day.getTime()
            ))
        ))

        if (intersectedDays.length > 0) {
            acc.push({
                status,
                days,
                intersectedDays
            })
        }

        return acc
    }, [])
}

export default (app, db) => {
    const absense = new Collection(db, 'absense');

    app.get('/absense', ({ query }, res) => {
        const params = getQuery(query)

        absense.find(params)
            .toArray((error, findResult) => {
                if (error) {
                    res.send({ error })
                    return
                }

                res.send(findResult)
            });
    })

    app.post('/absense', ({ body }, res) => {
        const {
            email,
            from,
            to,
            status
        } = body

        const query = getQuery(body)
        const requestedDays = getDatesList(new Date(from), new Date(to))

        // get records about absebce for specifyed user and time horizon
        absense.find(query)
            .toArray((error, records) => {
                if (error) {
                    res.send({ error })

                    return
                }

                if (records.length > 0) {
                    const ovelapPeriods = getIntersections(records, requestedDays)

                    if (ovelapPeriods.length > 0) {
                        res.send({
                            ovelapPeriods,
                            error: 'Has overlaps. Please correct date range and try again.'
                        })

                        return
                    }
                }

                const data = {
                    email,
                    days: requestedDays,
                    status
                }

                absense.insertOne(data)
                    .then(insertResult => res.send({
                        status: 'OK',
                        data: insertResult
                    }))
            });
    })

    app.put('/absense/:id', ({ params, body }, res) => {
        const filter = { _id: ObjectID(params.id) }
        const data = getUpdateData(body);

        console.log('---- data', data)
        absense.updateOne(filter, { $set: data })
            .then(updateResult => {
                res.send({
                    status: 'OK',
                    data: updateResult
                })
            })
    })
}
