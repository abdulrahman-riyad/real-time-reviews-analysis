module.exports = {
    apps: [
        {
            name: "extention-server",
            script: "index.js",
            watch: true,
        },
        {
            name: "review-consumer",
            script: "consumers/review.consumer.js",
            watch: true,
        },
        {
            name: "email-consumer",
            script: "consumers/email.consumer.js",
            watch: true,
        }
    ]
}