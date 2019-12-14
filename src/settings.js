
///////////////////////////////////////////////////////////////////////////////////////////////
// 
// IOT InfluxDB Service
// 09/12/2019
// 2019 (c) Unicos Ltd.
//
// This file helps working with config files.
// 
///////////////////////////////////////////////////////////////////////////////////////////////

const fs = require('fs')

class ClientSettings
{
    constructor() 
    {
        this.loadSettings()
    }

    loadSettings()
    {
        const settingsFile = require('./../config/settings.json')
        this.settings = Object.assign({}, settingsFile)
    }

    saveSettings()
    {
        try 
        {
            fs.writeFile('./../config/settings.json', JSON.stringify(this.settings, null, 4), 'utf8', error =>
            {
                if (error) {
                    logger.log(logTag, error, 'warn')
                    return false
                } else {
                    logger.log(logTag, 'Settings file saved.')
                    return true
                }
            })
        } 
        catch(error) 
        {
            logger.log(logTag, error, 'warn')
            return false
        }
    }
}

// Singleton pattern
module.exports = new ClientSettings()