const cheerio = require("cheerio");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();


exports.generateSummary = async (request, response) => {
    const data = request.body.data;
    try {
        const $ = cheerio.load(data);
        const reviewContent = $('li');
        if (reviewContent.length === 0) {
            throw new Error("No reviews found, scraping failed")
        }
        const reviews = []
        reviewContent.each((idx, el) => {
            const reviewBody = $(el).find('div[data-hook="review-collapsed"] span').text();
            
            reviews.push(reviewBody);
        })
    
        // Request to the FastAPI
        axios.post(process.env.MODEL_URL, {
            reviews: reviews
        },{
            headers: {
                "Content-Type": "application/json"
            }
        }).then(async (res) => {
            const data = await res.data;
            console.log(data)
            response.status(200).send(JSON.stringify({
                data: data
            }))
        }).catch((err) => {
            console.log("server error " + err)
            response.status(500).send({
                message: "Server Error while generating summary"
            })
        })
    } catch (err) {
        console.log("Error happend: ", err);
        response.status(500).send({"message":  "Server Error"});
    }
}