import express from 'express';
import { Review } from '../models/Review.model.js';
import reviewProducer from '../producers/review.producer.js';
import { FULFILLED, PENDING, FAILED } from '../config/constants.js';

const router = express.Router();

router.post("/generate", async (request, response) => {
    const data = request.body;
    try {
        /**
         * Data should be in the format:
         * {
         *  reviews: [string],
         *  title: string
         *  link: string
         *  product_id: string
         * }
         */

        const {
            reviews,
            title,
            link,
            product_id
        } = data;

        // if summary found for the product, return normally
        const review = await Review.findOneAndUpdate(
            {product_id: product_id},
            {
                $setOnInsert: {
                    reviews: reviews,
                    title: title,
                    link: link,
                    product_id: product_id,
                    status: PENDING,
                }
            },
            { upsert: true, new: true}
        );

        if (review.status === FULFILLED) {
            return response.status(200).send({
                message: "Summary already exists, refresh your page to see it"
            });
        }
        // TODO: use rabbitmq to process the reviews and generate summary here
        await reviewProducer({
            reviews: reviews,
            title: title,
            link: link,
            product_id: product_id,
            user_email: request.user.email,
            user_firstname: request.user.user_firstname,
        });
        
        response.status(200).send({
            message: "Summary request submitted successfully",
        })
    } catch (err) {
        console.log("Error happend: ", err);
        response.status(500).send({"message": "Server Error"});
    }
})

router.get("/summary/:product_id", async (request, response) => {
    const { product_id } = request.params;
    try {
        const review = await Review.findOne({ product_id: product_id });
        if (!review) {
            return response.status(404).send({ message: "Summary not found" });
        }

        if (review.status === PENDING){
            return response.status(202).send({ message: "Summary is being generated, wait for an email" });
        } else if (review.status === FAILED) {
            return response.status(500).send({ message: "Summary generation failed, please try regenerating" });
        }
        response.status(200).send({
            message: "Summary fetched successfully",
            summary: review.summary 
        });
    } catch (err) {
        console.log("Error happend: ", err);
        response.status(500).send({"message": "Server Error"});
    }
})

export default router;