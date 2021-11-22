'use strict'
const AWS = require('aws-sdk');
const { ObjectId } = require('mongodb')
const { getCollection } = require('./db')
const { buildResponse } = require('./utils')

const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

const TABLE_NAME = 'workoutsTable'

const getWorkouts = async ({ queryStringParameters = {} }) => {
  const {
    limit = 20,
    offset = 0,
    month = null,
    ['categories[]']: categoryArray = '',
    categories
  } = queryStringParameters
  const matchQuery = {}
  if(categories) {
    matchQuery.category = categories
  }
  if(categoryArray) {
    const parsedCategories = categoryArray.split(',')
    matchQuery.category = { $in: parsedCategories }
  }
  if(month) {
    const now = new Date()
    const parsedMonth = parseInt(month, 10)
    const monthDelta = ((parsedMonth - now.getMonth()) + 12)%12
    const newMonth = new Date(now.setMonth(now.getMonth()+monthDelta))
    newMonth.setDate(1)
    newMonth.setHours(0,0,0,0)
    const monthStart = new Date(newMonth)
    const monthEnd = new Date(newMonth.setMonth(newMonth.getMonth()+1))
    matchQuery.startDate = { $gte: monthStart.getTime(), $lte: monthEnd.getTime() }
  }
  try {
    const workouts = await getCollection('workouts')
    const [data = {}] = await workouts.aggregate([
      {$sort: { startDate: 1 }},
      {$match: matchQuery },
      {$facet:{
        "stage1" : [ {"$group": {_id:null, count:{$sum:1}}} ],
        "stage2" : [
          { "$skip": parseInt(offset, 10)},
          {"$limit": parseInt(limit, 10)},
          {"$project":{ title: 1, teaser: 1, thumbnailUrl: 1, category: 1, startDate: 1, duration: 1}}
        ]
      }},
      {$unwind: "$stage1"},
      {$project:{
        count: "$stage1.count",
        items: "$stage2"
      }}
    ]).toArray();
    const {
      items = [],
      count = 0
    } = data
    return buildResponse({ items, count });
  }
  catch(e) {
    return buildResponse(e, 500)
  }
}

const getWorkoutById = async({ pathParameters }) => {
  try {
    const workouts = await getCollection('workouts')
    const workoutData = await workouts.findOne(
      ObjectId(pathParameters.id),
      {
        projection: {
          category: 1,
          description: 1,
          duration: 1,
          teaser: 1,
          thumbnailUrl: 1,
          title: 1,
          startDate: 1,
          videoUrl: 1
        }
      }
    )
    return buildResponse(workoutData)
  } catch (e) {
    return buildResponse({ error: e }, 500)
  }
}

module.exports = {
  get: getWorkouts,
  getById: getWorkoutById,
}