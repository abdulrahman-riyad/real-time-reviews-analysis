import { Review } from "../models/Review.model.js";
import { User } from "../models/User.model.js";
import { FULFILLED } from "../config/constants.js";
import { REVIEW_QUEUE } from "../config/rabbitmq.js";
import createChannel from "../rabbitmq/channel.js";
import emailProducer from "../producers/email.producer.js";
import {connectDB} from "../config/db.js"
import axios from "axios";
import dotenv from "dotenv";
dotenv.config({
    path: "../.env"
});

async function processReviews(reviews) {
    const response = await axios.post(process.env.MODEL_URL, {
        reviews: reviews,
    }, {
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await response.data;
    return data.final_summary.summary_paragraph;
}

export async function reviewConsumer() {
    try {
        await connectDB();
        const channel = await createChannel();

        console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', REVIEW_QUEUE);
        channel.consume(REVIEW_QUEUE, async (msg) => {
            if (msg !== null) {
                console.log(" [x] Received review request");
                const reviewPayload = JSON.parse(msg.content.toString());
                const {
                    reviews,
                    title,
                    link,
                    product_id,
                    user_email,
                    user_firstname,
                } = reviewPayload;

                // check if the review already processed first or not
                let review;
                try {
                    review = await Review.findOne({
                    product_id: product_id
                });
                } catch (err) {
                    console.error(`Error fetching review for product_id ${product_id}: ${err}`);
                    channel.ack(msg);
                    return;
                }
                if (review && review.status !== FULFILLED) {
                    // process the reviews to generate summary
                    let summary;
                    try {
                        console.log(" [x] Processing review request....");
                        summary = await processReviews(reviews);
                    } catch (err) {
                        console.error(`Error processing reviews for product_id ${product_id}: ${err}`);
                        channel.ack(msg);
                        return;
                    }
                    
                    console.log(" [🗸] Review processing completed.", summary);

                    // update the review document with the summary and status
                    try{
                        console.log(" [x] Updating review with summary....");
                        await Review.findOneAndUpdate(
                            { product_id: product_id },
                            {
                                summary: summary,
                                status: FULFILLED,
                            }
                        );
                        console.log(" [🗸] Review updated with summary.");
                    } catch (err) {
                        console.error(`Error updating review for product_id ${product_id}: ${err}`);
                        channel.ack(msg);
                        return;
                    }
                }

                // Send email to user notifying them of summary completion
                console.log(" [x] Sending email notification");
                try{
                    await emailProducer({
                        to: user_email,
                        subject: 'Your review summary is ready',
                        templateData: {
                            user: user_firstname,
                            product_title: title,
                            product_link: link,
                        }
                    });
                    console.log(" [🗸] Email notification sent");
                    channel.ack(msg);
                    console.log(` [🗸] Processed review for product_id: ${product_id}`);
                } catch (err) {
                    console.error(`Error sending email to ${user_email}: ${err}`);
                    channel.ack(msg);
                }
            }
        }, {
            noAck: false
        })
    } catch (err) {
        console.error(`Error happened in review consumer: ${err}`);
    }
}

reviewConsumer();