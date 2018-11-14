import { MongoClient } from 'mongodb';
import httpStatus from 'http-status-codes';
import logger from '../utils/logger';
import config from '../config';
import dateUtils from '../utils/date';
import { start } from 'repl';
import date from '../utils/date';

// filter and update
export async function mockup(req, res) {
  // connect mongodb
  const connection = await MongoClient.connect(config.database.uri, { useNewUrlParser: true })
    .catch(err => logger.error(err));
  // throw http 500 if connect failed
  if (!connection) return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();

  try {
    const collection = connection.db().collection('dau');

    const docsToInsert = [];

    for (let index = 0; index < 30; index += 1) {
      const dayToInsert = dateUtils.toUTCFloor(new Date());
      const today = dateUtils.toUTCFloor(new Date());
      dayToInsert.setDate(today.getDate() - index);

      for (let j = 0; j < 10; j += 1) {
        for (let k = 0; k < 5; k += 1) {
          const random = Math.random();
          if (random > 0.5) {
            docsToInsert.push({
              profileId: `P${j}`,
              time: dayToInsert,
              vendorName: `Vendor ${k}`,
              vendorId: `V${k}`,
            });
          }
        }
      }
    }

    await collection.insertMany(docsToInsert).catch((err) => { logger.error(err); });
    connection.close();
    return res.json('Success').end();
  } catch (error) {
    logger.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
  }
}

export async function get(req, res) {
  const startDateQuery = req.query.start_date;
  const endDateQuery = req.query.end_date;

  // require on start and end date
  if (!startDateQuery || !endDateQuery) return res.status(httpStatus.NOT_FOUND).json({ message: 'start_date or end_date is missing !' }).end();

  const startDate = new Date(startDateQuery);
  const endDate = new Date(endDateQuery);

  if (!dateUtils.isValidDate(startDate) || !dateUtils.isValidDate(endDate)) return res.status(httpStatus.BAD_REQUEST).json({ message: 'start_date or end_date is not valid date' }).end();

  // connect mongodb
  const connection = await MongoClient.connect(config.database.uri, { useNewUrlParser: true })
    .catch(err => logger.error(err));
  // throw http 500 if connect failed
  if (!connection) return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();

  try {
    const collection = connection.db().collection('dau');
    const docs = await collection.aggregate([
      {
        $match: {
          $and: [
            { time: { $gte: startDate } },
            { time: { $lte: endDate } },
          ],
        },
      },
      {
        $group: {
          _id: {
            vendorId: '$vendorId',
            vendorName: '$vendorName',
            time: '$time',
          },
          // vendorName: '$vendorName',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          vendorName: '$_id.vendorName',
          vendorId: '$_id.vendorId',
          count: 1,
          date: '$_id.time',
        },
      },
      { $sort: { date: 1 } },
    ]).toArray().catch((err) => { logger.error(err); });

    // close connection
    connection.close();
    return res.json(docs).end();
  } catch (error) {
    logger.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
  }
}
