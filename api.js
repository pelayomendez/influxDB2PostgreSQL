
///////////////////////////////////////////////////////////////////////////////////////////////
//
// IOT InfluxDB Service
// 09/12/2019
// 2019 (c) Unicos Ltd.
//
// This service returns data from the Postgress SQL database
// 
///////////////////////////////////////////////////////////////////////////////////////////////

'use strict';

// Configuration settings
const globalAppSettings = require('./src/settings').settings

// Postgress SQL configuration
const postgressSQL = require('./src/postgress_client.js')
postgressSQL.init()

// Express setup
var express = require('express');
var app = express();

app.get('/latest', function (req, res)
{
    postgressSQL.getData(0, 1)
    .then(result => { 
        res.send(JSON.stringify(result))
    })
    .catch(error => {
        res.status(404).end()
    })
})

app.listen(4000, function () {
  console.log('Example app listening on port 4000!');
})
