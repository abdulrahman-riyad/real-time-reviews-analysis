(async () => {

    window.addEventListener ("load", scrapReviews, false);

    function scrapReviews() {
        // const reviews = document.getElementById('cm-cr-dp-review-list');
        // if (reviews) {
        //     console.log(reviews.innerHTML);
        // } else {
        //     console.log("Reviews not found");
        // }

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.type === "REVIEWS"){
                const reviews = document.getElementById('cm-cr-dp-review-list');
                if (reviews) {
                    sendResponse({
                        type: "REVIEWS",
                        data: reviews.innerHTML
                    });
                } else {
                    sendResponse({
                        type: "REVIEWS",
                        data: null
                    });
                }
            }
        });
    }
})();