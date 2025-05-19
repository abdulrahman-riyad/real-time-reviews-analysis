const cheerio = require("cheerio");


exports.cleanData = async (request, response) => {
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
        reviews.forEach((review, idx) => {
            console.log(`Review ${idx + 1}: ${review}`);
        });
    } catch (err) {
        console.log("Error happend: ", err);
        response.status(500).send({"message":  "Error happend"});
    }
}