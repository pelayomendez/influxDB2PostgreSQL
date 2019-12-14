# influxDB2PostgreSQL

This is a simple Node.js service that connects to an InfluxDB database and makes regular backups to a PostgreSQL database.

# Installing the service
````
npm install
````

# Running the service

First you have to modify the config/settings.json file with the information of your databases.


The you can run the backup service with:

````
npm run dev 
````

And the API to access the data with:

````
npm run api 
````

For running as a service both scripts you can use something like pm2 [https://pm2.keymetrics.io/]


