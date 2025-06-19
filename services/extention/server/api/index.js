const express = require('express');
const cors = require('cors');
const dotenv = require("dotenv");

dotenv.config();

const { generateSummary } = require('../controllers/postData');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', generateSummary);

module.exports = app;
