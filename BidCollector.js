const puppeteer = require('puppeteer');

require('cometd-nodejs-client').adapt();

//let cassandra = require('cassandra-driver');
const { Client } = require("cassandra-driver");
const MongoClient = require('mongodb').MongoClient;

const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'test';

// Create a new MongoClient
contactPoints:['127.0.0.1:9042']

/*
const authProvider = new cassandra.auth.PlainTextAuthProvider(
    'cassandra',
    'cassandra',
);
*/

/*
const client2 = new cassandra.Client({
    contactPoints:['127.0.0.1:9042'],
    localDataCenter: 'datacenter1',
    authProvider,
    keyspace: 'collector',
});
*/

const client2 = new Client({
    cloud: {
        secureConnectBundle: "/Users/tombryant/Downloads/secure-connect-mldata.zip",
    },
    credentials: {
        username: "ZqsazhZZaugCzbSvMjGICZGR",
        password: "ZJOp_ik-ZH-1aAdqnlodcd7ZUcbBJEl9BEOmQqpCqb1CM6fP6OlIoPPQoUJ9,D9-FMip_-TL-Loqp.Ple_BuJ-ePSfo,3XKNmkrJkrY_hZuX8.FNfOu6Iv6hj7pZo9NG",
    },
});


// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
});


let lib = require('cometd');
let Client3 = require('azure-iot-device').Client;
let Protocol = require('azure-iot-device-mqtt').MqttWs;
let Message = require('azure-iot-device').Message;
let client3 = Client3.fromConnectionString("HostName=BWHUB.azure-devices.net;DeviceId=Bid1000;SharedAccessKey=KKUTauscuqGpWxoWVKnJwXM9rfKCZtNMSylMsE4zYIY=", Protocol);

var cometd = new lib.CometD();
var cometdURL = "https://live.proxibid.com/BidderWeb/cometd";
cometd.configure(cometdURL, 'debug');
cometd.handshake();

(async () => {

    //  while(true){}
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.proxibid.com/live-auctions');

    /*
        const thetrs = await page.evaluate(() => {
            const trs  = Array.from(document.getElementsByTagName('tr'));
            return trs.map((tr) => {
                const trinner = tr.innerHTML

                return trinner;
            });

        })
    */
    const results = await page.evaluate(() => {
        const trs = Array.from(document.getElementsByClassName('sellerRatingBtn'));
        return trs.map((tr) => {
            const fullName = tr.getAttribute("id")
            return fullName;
        });
    })

    const uuid = require('uuid');
    console.log('The results: ' + JSON.stringify(results));
    function printResultFor(op) {
        return function printResult(err, res) {
            if (err) console.log(op + ' error: ' + err.toString());
            if (res) console.log(op + ' status: ' + res.constructor.name);
        };
    }


    Array.from(results).forEach(function (element) {
        cometd.subscribe('/com/proxibid/livebidding/auction/public/' + element, (message) => {
            const db = client.db(dbName);
            const result = client.db("test").collection("actionMessages").insertOne(message.data);
            console.log("Sending Message " + JSON.stringify(message.data))
            client2.execute('INSERT INTO auctioninfo.bid_message (id, message, created) VALUES (?, ?, ?)', [ uuid.v1(), message.data.toString(), new Date() ], { prepare: true })
                .then(result => console.log('C* Success!'));

                let message2 = new Message(JSON.stringify(message.data))

            console.log("Sending message to IOT hub: " + message2);
            client3.sendEvent(message2, printResultFor('send'));




        });
    });

    await browser.close();
})();
