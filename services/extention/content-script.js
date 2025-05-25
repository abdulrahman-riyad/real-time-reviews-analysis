(async () => {


    const SELECTORS = {
        productTitle: "div#titleBlock.celwidget > div#titleBlockRightSection"
    }
    window.addEventListener ("load", initProgram, false);

    function initProgram() {
        if (isAmazonProductPage()){
            addListeners();
        }
    }

    function isAmazonProductPage() {
        return window.location.hostname.includes("amazon.com") && 
               window.location.pathname.includes("/dp/");
    }

    function addListeners(){

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

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.type === "MODAL"){
                const summary = request.data;
                createModal(summary);
                sendResponse({
                    type: "MODAL",
                    status: "success",
                })
            }
            else {
                sendResponse({
                    type: "MODAL",
                    status: "error",
                    message: "مشكلة حصلت هبقي اشوفها بعدين"
                });
            }
        })
    }

    function createModal(summary){
        if (document.getElementById('mdl-modal-view')){
            const modal = document.getElementById('mdl-modal-view');
            modal.querySelector('#mdl-modal-content').innerHTML = `
                <h2> AI Summary </h2>
                <p>${summary}</p>
                <div id="mdl-content-item">
                    <button id="close-modal">Close</button>
                </div>`;
            modal.querySelector('#close-modal').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            modal.style.display = 'flex';
        }
        else {
            const modal = document.createElement('div');
            modal.id = 'mdl-modal-view';
            modal.innerHTML = `
                <div id="mdl-modal-content">
                    <h2> AI Summary </h2>
                    <p>${summary}</p>
                    <div id="mdl-content-item">
                        <button id="close-modal">Close</button>
                    </div>
                </div>`
            
            
            document.body.appendChild(modal);
            
            modal.querySelector('#mdl-content-item').addEventListener('click', () => {
                modal.style.display = 'none';
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }

    
})();