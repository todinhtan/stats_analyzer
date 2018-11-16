import httpStatus from 'http-status-codes';
import { MongoClient } from 'mongodb';
import json2csv from 'json2csv';
import config from '../config';
import logger from '../utils/logger';
import dateUtils from '../utils/date';
import clickService from '../services/click';

export async function mockup(req, res) {
  // connect mongodb
  const connection = await MongoClient.connect(config.database.uri, { useNewUrlParser: true })
    .catch(err => logger.error(err));
  // throw http 500 if connect failed
  if (!connection) return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();

  try {
    const collection = connection.db().collection('clicked_frequencies');

    const docsToInsert = [];

    for (let index = 0; index < 30; index += 1) {
      const dayToInsert = dateUtils.toUTCFloor(new Date('2019-01-01'));
      const today = dateUtils.toUTCFloor(new Date('2019-01-01'));
      dayToInsert.setDate(today.getDate() - index);
      const dayInMls = 24 * 3600 * 1000;
      const randomTotalUsers = Math.floor(Math.random() * 10) + 1;
      for (let j = 0; j < randomTotalUsers; j += 1) {
        const randomTotalItems = Math.floor(Math.random() * 10) + 1;
        for (let k = 0; k < randomTotalItems; k += 1) {
          for (let c = 0; c < 5; c += 1) {
            for (let m = 0; m < 5; m += 1) {
              for (let time = 0; time < 10; time += 1) {
                const timeToInsert = new Date(dayToInsert.getTime() + Math.random() * dayInMls);
                const random = Math.random();
                if (random > 0.5) {
                  docsToInsert.push({
                    profileId: `P${j}`,
                    ownerId: `V${m}`,
                    time: timeToInsert,
                    itemId: `ITEM${k}`,
                    category: `CAT${c}`,
                  });
                }
              }
            }
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
  const { vendorId, dateType } = req.params;

  if (!['daily', 'weekly', 'monthly'].includes(dateType)) return res.status(httpStatus.BAD_REQUEST).json({ message: 'dateType must be one of daily / weekly / monthly' }).end();

  // connect mongodb
  const connection = await MongoClient.connect(config.database.uri, { useNewUrlParser: true })
    .catch(err => logger.error(err));
  // throw http 500 if connect failed
  if (!connection) return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();

  try {
    const collection = connection.db().collection('clicked_frequencies');
    let docs = await clickService.getStats(dateType, vendorId, collection);

    // close connection
    connection.close();
    // return 404 http not found if no documents found
    if (!docs || docs.length === 0) return res.status(httpStatus.NOT_FOUND).json('Not found').end();

    // reformat documents
    docs = docs.map((doc) => {
      const result = {};
      switch (dateType) {
        case 'daily':
          result.date = doc.date;
          break;
        case 'weekly':
          result.date = dateUtils.getMonday(doc.week, doc.year);
          break;
        case 'monthly':
          result.date = dateUtils.getFirstDateOfMonth(doc.month, doc.year);
          break;
        default:
          break;
      }
      doc.stats.forEach((stat) => {
        result[`${stat.category}.clicks`] = stat.clicks;
        result[`${stat.category}.users`] = stat.users;
        result[`${stat.category}.items`] = stat.items;
      });

      return result;
    });

    const json2csvParser = new json2csv.Parser();
    const csv = json2csvParser.parse(docs);

    res.setHeader('Content-Disposition', `attachment; filename=frequencies_clicked_${vendorId}_${dateType}.csv`);
    res.type('text/csv');
    return res.send(csv).end();
  } catch (error) {
    logger.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).end();
  }
}
