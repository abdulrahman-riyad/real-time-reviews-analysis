const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 5000

const { cleanData } = require('./controllers/postData');

app.use(cors());

app.use(express.json());

app.post('/clean', cleanData)


app.listen(PORT, ()=> {
    console.log("Server is running on port ", PORT);
})