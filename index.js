const express = require('express')
const app = express()
const port = process.env.PORT || process.argv[2] || 8080

app.get('/', (req, res) => {
    const proto = req.protocol;
    res.send('Hello World! from: ' + JSON.stringify(req.headers));
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

