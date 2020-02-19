const express = require('express')
const app = express()
const port = process.env.PORT || process.argv[2] || 8080

app.get('/', (req, res) => {
    const proto = req.get("x-forwarded-proto") ? req.get("x-forwarded-proto") : "http";
    res.send('Hello World! from: ' + proto);
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

