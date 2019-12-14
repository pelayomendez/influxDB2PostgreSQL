
///////////////////////////////////////////////////////////////////////////////////////////////
//
// IOT InfluxDB Exporter
// 09/12/2019
// 2019 (c) Unicos Ltd.
//
// This service generates a resume of the previous day and stores in a remote database.
// 
///////////////////////////////////////////////////////////////////////////////////////////////

'use strict';

// Configuration settings
//////////////////////////////////////////////////////////////////////////////////////////
const globalAppSettings = require('./src/settings').settings

// Generic Node.js modules
//////////////////////////////////////////////////////////////////////////////////////////
const fs = require('fs')

// Define ssl certificates
//////////////////////////////////////////////////////////////////////////////////////////
var rootCas = require('ssl-root-cas/latest').create();
rootCas.addFile(__dirname + '/keys/iot-ca-selfsigned.crt');
// default for all https requests
// (whether using https directly, request, or another module)
require('https').globalAgent.options.ca = rootCas;

// InfluxDB configuration
//////////////////////////////////////////////////////////////////////////////////////////
const Influx = require('influx');
const influx = new Influx.InfluxDB(
{
  host: globalAppSettings.INFLUXDB_HOST,
  port: globalAppSettings.INFLUXDB_PORT,
  protocol: globalAppSettings.INFLUXDB_PROTOCOL,
  database: globalAppSettings.INFLUXDB_DATABASE,
  username: globalAppSettings.INFLUXDB_USERNAME,
  password: globalAppSettings.INFLUXDB_PASSSWORD,
  schema: [
    {
      measurement: globalAppSettings.MEASUREMENT,
      fields: 
      {
        time: Influx.FieldType.STRING,
        temperatura: Influx.FieldType.FLOAT
      },
      tags: [
        'host'
      ]
   }
 ]
})

// Postgress SQL configuration
//////////////////////////////////////////////////////////////////////////////////////////
const postgressSQL = require('./src/postgress_client.js')
postgressSQL.init()

// Update database
//////////////////////////////////////////////////////////////////////////////////////////
function updateremoteDatabase()
{
  // Download and database update process
  const cachedDownloadDate = require('./config/cache.json')
  // const lastQueryDate = new Date(Date.now() - (1000*60*60*96)).toISOString()
  const lastQueryDate = new Date(cachedDownloadDate['latest_update']).toISOString()
  // const now = new Date()
  // const actDate =  new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()+1, 0, 0).toISOString()
  const actDate = new Date().toISOString()
  console.log(`Actual date: ${actDate} | Latest update: ${lastQueryDate}`)

  /*
  influx.getDatabaseNames()
  .then(names => {
    console.log(names)
  })
  .catch(error => console.log({ error }))
  */

  const query = `select * from temperatura WHERE time < '${actDate}' AND time >= '${lastQueryDate}'`

  influx.query(query)
  .then( results => 
  { 
    const resultObject = {}
    resultObject['start_time'] = lastQueryDate
    resultObject['end_time'] = actDate
    resultObject['data'] = []

    for(let result of results)
    {
      const obj = {time: result.time.toNanoISOString(), value: result.value }
      resultObject['data'].push(obj)
    }

    try 
    {
      const jsonData = JSON.stringify(resultObject)
      console.log(`Found ${resultObject['data'].length} objects`)
      if(resultObject['data'].length > 0)
      {
        postgressSQL.insertData(resultObject['start_time'], JSON.stringify(resultObject))
        fs.writeFileSync('./config/cache.json', JSON.stringify({ latest_update: actDate }))
      }
      //fs.writeFileSync(`./exports/${actDate}.json`, jsonData)
    } catch(err) {
      // An error occurred
      console.error(err);
    }
  })
  .catch((error) => { console.log(error) } )
}

updateremoteDatabase()
setInterval(updateremoteDatabase, 1000*60*30)
