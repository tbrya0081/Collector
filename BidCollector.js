const puppeteer = require('puppeteer');

require('cometd-nodejs-client').adapt();

// Your normal CometD client application here.
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');


// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'test';

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);
});

var lib = require('cometd');
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
    console.log('The results: ' + JSON.stringify(results));

    Array.from(results).forEach(function (element) {
        cometd.subscribe('/com/proxibid/livebidding/auction/public/' + element, (message) => {
            const db = client.db(dbName);
            const result = client.db("test").collection("actionMessages").insertOne(message.data);
            console.log(message.data);
        });
    });


    // console.log('The results2: ' + JSON.stringify(results2));
    //  console.log('The results3: ' + JSON.stringify(results3));

    await browser.close();
})();
