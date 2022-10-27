const { Client } = require("cassandra-driver");
async function run() {
    const client = new Client({
        cloud: {
            secureConnectBundle: "/Users/tombryant/Downloads/secure-connect-mldata.zip",
        },
        credentials: {
            username: "ZqsazhZZaugCzbSvMjGICZGR",
            password: "ZJOp_ik-ZH-1aAdqnlodcd7ZUcbBJEl9BEOmQqpCqb1CM6fP6OlIoPPQoUJ9,D9-FMip_-TL-Loqp.Ple_BuJ-ePSfo,3XKNmkrJkrY_hZuX8.FNfOu6Iv6hj7pZo9NG",
        },
    });

    await client.connect();

    // Execute a query
    const rs = await client.execute("SELECT * FROM system.local");
    console.log(`Your cluster returned ${rs.rowLength} row(s)`);

    await client.shutdown();
}

// Run the async function
run();