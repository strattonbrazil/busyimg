const express = require('express')
const app = express()
const port = process.env.PORT || process.argv[2] || 8080

app.get('/', (req, res) => {
    let proto = "http";
    if (req.headers["X-Forwarded-Proto"]) {
        proto = req.headers["X-Forwarded-Proto"];
    }
    res.send('Hello World! from: ' + proto);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

