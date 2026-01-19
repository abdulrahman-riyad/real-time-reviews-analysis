import createChannel from '../rabbitmq/channel.js';
import { REVIEW_QUEUE } from '../config/rabbitmq.js';
import { cleanReviews } from '../utils/utils.js';

export default async function reviewProducer(job) {
    try {
        const {
            reviews,
            title,
            link,
            product_id,
            user_email,
            user_firstname,
        } = job;
        const channel = await createChannel();
        let cleanedReviews;

        if (process.env.NODE_ENV === 'test'){
            cleanedReviews = reviews;
        } else {
            cleanedReviews = cleanReviews(reviews);
        }
        
        const reviewPayload = {
            reviews: cleanedReviews,
            title,
            link,
            product_id,
            user_email,
            user_firstname,
        };
        await channel.sendToQueue(REVIEW_QUEUE,
            Buffer.from(JSON.stringify(reviewPayload))
        , { persistent: true });
        console.log(`Review job sent to queue for product_id: ${product_id}`);
    } catch (err) {
        console.error(`Error happened in review producer: ${err}`);
    }
}