
///////////////////////////////////////////////////////////////////////////////////////////////
//
// IOT InfluxDB Exporter
// 09/12/2019
// 2019 (c) Unicos Ltd.
//
// This module provides an interface for the Postgres SQL database
// 
///////////////////////////////////////////////////////////////////////////////////////////////

// Configuration settings
const globalAppSettings = require('./settings').settings

// Postgress promise based client
const pgp = require('pg-promise')()
let cn = undefined

module.exports = {

    init: function() 
    {
        // Database connection details;
        cn = {
            host: globalAppSettings.POSTGRESS_HOST,
            port: globalAppSettings.POSTGRESS_PORT5432,
            database: globalAppSettings.POSTGRESS_DATABASE,
            user: globalAppSettings.POSTGRESS_USER,
            password: globalAppSettings.POSTGRESS_PASSWORD
        };
        // You can check for all default values in:
        // https://github.com/brianc/node-postgres/blob/master/lib/defaults.js
    },

    insertData: function(timeStamp, jsonData)
    {
        const db = pgp(cn); // database instance;
        
        db.tx(async t => 
        {
            return await t.one('INSERT INTO temperatura(time, data) VALUES ($1,$2) RETURNING id', [timeStamp, jsonData]);
        })
        .then((id) => {
            // print new user id + new event id;
            console.log('New data inserted with ID:', id);
        })
        .catch(error => 
        {
            console.log('ERROR:', error); // print the error;
        })
        .finally(db.$pool.end); // For immediate app exit, shutting down the connection pool
        // For details see: https://github.com/vitaly-t/pg-promise#library-de-initialization
    },

    getData: function(startIndex, endIndex)
    {
        return new Promise((resolve, reject) =>
        {
            const db = pgp(cn)
    
            db.any({
                text: 'SELECT * FROM temperatura ORDER BY time DESC LIMIT $1',
                values: [endIndex]
            })
            .then((data) => {
                // print new user id + new event id;
                //console.log('Data recived:', id);
                resolve(data)
            })
            .catch(error => 
            {
                reject(error)
            })
            .finally(db.$pool.end)
        })
    }

}