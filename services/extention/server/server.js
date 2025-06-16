const express = require('express')
const cors = require('cors')
const app = express()
const dotenv = require("dotenv")
const PORT = 5000

dotenv.config()

const { generateSummary } = require('./controllers/postData');

app.use(cors());

app.use(express.json());

app.post('/generate', generateSummary)


app.listen(PORT, ()=> {
    console.log("Server is running on port ", PORT);
})