import logger from '../utils/logger';

async function getStatsDaily(vendorId, collection) {
  const docs = await collection.aggregate([
    {
      $match: { vendorId },
    },
    {
      $group: {
        _id: {
          category: '$category',
          time: '$time',
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        count: 1,
        date: '$_id.time',
      },
    },
    {
      $group: {
        _id: '$date',
        stats: { $addToSet: { category: '$category', count: '$count' } },
      },
    },
    {
      $project: {
        _id: 0,
        date: '$_id',
        stats: 1,
      },
    },
    { $sort: { date: -1 } },
  ]).toArray().catch((err) => { logger.error(err); });

  return docs;
}

async function getStatsWeekly(vendorId, collection) {
  const docs = await collection.aggregate([
    {
      $match: { vendorId },
    },
    {
      $project: {
        week: { $isoWeek: '$time' },
        year: { $year: '$time' },
        itemId: 1,
        category: 1,
      },
    },
    {
      $group: {
        _id: {
          category: '$category',
          week: '$week',
          year: '$year',
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        count: 1,
        week: '$_id.week',
        year: '$_id.year',
      },
    },
    {
      $group: {
        _id: {
          week: '$week',
          year: '$year',
        },
        stats: { $addToSet: { category: '$category', count: '$count' } },
      },
    },
    {
      $project: {
        _id: 0,
        week: '$_id.week',
        year: '$_id.year',
        stats: 1,
      },
    },
    { $sort: { year: -1, week: -1 } },
  ]).toArray().catch((err) => { logger.error(err); });

  return docs;
}

async function getStatsMonthly(vendorId, collection) {
  const docs = await collection.aggregate([
    {
      $match: { vendorId },
    },
    {
      $project: {
        month: { $month: '$time' },
        year: { $year: '$time' },
        itemId: 1,
        category: 1,
      },
    },
    {
      $group: {
        _id: {
          category: '$category',
          month: '$month',
          year: '$year',
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        count: 1,
        month: '$_id.month',
        year: '$_id.year',
      },
    },
    {
      $group: {
        _id: {
          month: '$month',
          year: '$year',
        },
        stats: { $addToSet: { category: '$category', count: '$count' } },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        year: '$_id.year',
        stats: 1,
      },
    },
    { $sort: { year: -1, month: -1 } },
  ]).toArray().catch((err) => { logger.error(err); });

  return docs;
}

async function getStats(type, vendorId, collection) {
  switch (type) {
    case 'daily':
      return getStatsDaily(vendorId, collection);
    case 'weekly':
      return getStatsWeekly(vendorId, collection);
    case 'monthly':
      return getStatsMonthly(vendorId, collection);
    default:
      return [];
  }
}

export default {
  getStats: async (type, vendorId, collection) => getStats(type, vendorId, collection),
};
