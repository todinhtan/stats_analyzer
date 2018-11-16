import logger from '../utils/logger';

async function getStatsDaily(vendorId, collection) {
  const docs = await collection.aggregate([
    {
      $match: { ownerId: vendorId },
    },
    {
      $project: {
        time: {
          $dateToString: {
            date: '$time',
            format: '%Y-%m-%d',
          },
        },
        category: 1,
        profileId: 1,
        itemId: 1,
      },
    },
    {
      $group: {
        _id: {
          category: '$category',
          time: '$time',
        },
        countClick: { $sum: 1 },
        profileIds: { $addToSet: '$profileId' },
        itemIds: { $addToSet: '$itemId' },
      },
    },
    {
      $unwind: '$profileIds',
    },
    {
      $group: {
        _id: {
          category: '$_id.category',
          time: '$_id.time',
          countClick: '$countClick',
          itemIds: '$itemIds',
        },
        countUser: { $sum: 1 },
      },
    },
    {
      $unwind: '$_id.itemIds',
    },
    {
      $group: {
        _id: {
          category: '$_id.category',
          time: '$_id.time',
          countClick: '$_id.countClick',
          countUser: '$countUser',
        },
        countItems: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        clicks: '$_id.countClick',
        users: '$_id.countUser',
        date: '$_id.time',
        items: '$countItems',
      },
    },
    {
      $group: {
        _id: '$date',
        stats: {
          $addToSet: {
            category: '$category',
            clicks: '$clicks',
            users: '$users',
            items: '$items',
          },
        },
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
      $match: { ownerId: vendorId },
    },
    {
      $project: {
        week: { $isoWeek: '$time' },
        year: { $isoWeekYear: '$time' },
        category: 1,
        profileId: 1,
        itemId: 1,
      },
    },
    {
      $group: {
        _id: {
          category: '$category',
          week: '$week',
          year: '$year',
        },
        countClick: { $sum: 1 },
        profileIds: { $addToSet: '$profileId' },
        itemIds: { $addToSet: '$itemId' },
      },
    },
    {
      $unwind: '$profileIds',
    },
    {
      $group: {
        _id: {
          category: '$_id.category',
          week: '$_id.week',
          year: '$_id.year',
          countClick: '$countClick',
          itemIds: '$itemIds',
        },
        countUser: { $sum: 1 },
      },
    },
    {
      $unwind: '$_id.itemIds',
    },
    {
      $group: {
        _id: {
          category: '$_id.category',
          week: '$_id.week',
          year: '$_id.year',
          countClick: '$_id.countClick',
          countUser: '$countUser',
        },
        countItems: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        clicks: '$_id.countClick',
        users: '$_id.countUser',
        week: '$_id.week',
        year: '$_id.year',
        items: '$countItems',
      },
    },
    {
      $group: {
        _id: {
          week: '$week',
          year: '$year',
        },
        stats: {
          $addToSet: {
            category: '$category',
            clicks: '$clicks',
            users: '$users',
            items: '$items',
          },
        },
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
      $match: { ownerId: vendorId },
    },
    {
      $project: {
        month: { $month: '$time' },
        year: { $year: '$time' },
        category: 1,
        profileId: 1,
        itemId: 1,
      },
    },
    {
      $group: {
        _id: {
          category: '$category',
          month: '$month',
          year: '$year',
        },
        countClick: { $sum: 1 },
        profileIds: { $addToSet: '$profileId' },
        itemIds: { $addToSet: '$itemId' },
      },
    },
    {
      $unwind: '$profileIds',
    },
    {
      $group: {
        _id: {
          category: '$_id.category',
          month: '$_id.month',
          year: '$_id.year',
          countClick: '$countClick',
          itemIds: '$itemIds',
        },
        countUser: { $sum: 1 },
      },
    },
    {
      $unwind: '$_id.itemIds',
    },
    {
      $group: {
        _id: {
          category: '$_id.category',
          month: '$_id.month',
          year: '$_id.year',
          countClick: '$_id.countClick',
          countUser: '$countUser',
        },
        countItems: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        clicks: '$_id.countClick',
        users: '$_id.countUser',
        month: '$_id.month',
        year: '$_id.year',
        items: '$countItems',
      },
    },
    {
      $group: {
        _id: {
          month: '$month',
          year: '$year',
        },
        stats: {
          $addToSet: {
            category: '$category',
            clicks: '$clicks',
            users: '$users',
            items: '$items',
          },
        },
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
