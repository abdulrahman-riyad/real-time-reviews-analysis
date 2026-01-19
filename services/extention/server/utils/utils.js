import * as cheerio from "cheerio";

export function cleanReviews(data){
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
        return reviews;
    } catch(err) {
        console.error(`Error happened while cleaning the data: ${err}`);
        return [];
    }
}