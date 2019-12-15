var mosca = require('mosca');
var settings = {
    port: 1887,
    http: {
      port: 1888,
      bundle: true,
      static: './'
    }
};
var server = new mosca.Server(settings);
server.on('ready', setup);

var mqtt = require('mqtt');
console.log(mqtt);
function setup() {
    console.log('Mosca server is up and running')
}
server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
});

var options = {
    ca: './keys/mqttca.crt',
    rejectUnauthorized: false,
    protocol: 'mqtts',
    username: 'genaro', 
    password: 'passw0rd', 
    clientId: 'WebClient-' + parseInt(Math.random() * 100000)
}

client = mqtt.connect('mqtts://172.24.182.157', options);

client.on('connect', function () 
{
    console.log('MQTT client connected')
    client.subscribe('presence', function (err) {
        console.log(err)
    })
    client.subscribe('Homie/#', function (err) {
        console.log(err)
    })
})
   
client.on('message', function (topic, message)
{
    // message is Buffer
    console.log(message.toString())

    server.publish({
        topic: topic,
        payload: Buffer.from(message.toString()),
        qos: 0 // this is important for offline messaging
      }, null, function done() {})

    //client.end()
})

server.on('published', function(packet, mqttClient)
{  
    if(mqttClient != null) 
    {
        // console.log('Published', packet);
        // console.log('Client', client);
        // console.log('t:' + packet.payload.toString());
        try {
            console.log('Published', packet);
            client.publish(packet.topic, packet.payload.toString())
        } catch(e) {
            console.log(e)
        }
        
    }
});


server.on('message', function (topic, message)
{
    // message is Buffer
    // console.log(topic, message.toString())

    server.publish({
        topic: topic,
        payload: Buffer.from(message.toString()),
        qos: 0 // this is important for offline messaging
      }, null, function done() {})

    //client.end()
})

/*
setInterval(() => {
    client.publish('presence', 'Hello mqtt')
}, 5000);
*/