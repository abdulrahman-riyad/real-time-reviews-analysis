const url = "https://www.amazon.com/Sidefeel-Womens-Jeans-Waisted-Strechy/dp/B0D4QFSLP3/ref=sr_1_1?_encoding=UTF8&s=apparel&sr=1-1";
const cheerio = require("cheerio");
const axios = require("axios");
const pretty = require("pretty");

async function getData(url) {
    try {
        const {data} = await axios.get(url);
        const $ = cheerio.load(data);
        const reviewContent = $('ul#cm-cr-dp-review-list li');
        const reviews = []
        reviewContent.each((idx, el) => {
            console.log(`Review ${idx}: \n`)
            const reviewBody = $(el).find('div[data-hook="review-collapsed"] span').text();
            console.log(reviewBody)
        })
        console.log("Data Scrapped Successfully!");
    } catch (err) {
        console.log("Error happend: ", err)
    }
}

getData(url);