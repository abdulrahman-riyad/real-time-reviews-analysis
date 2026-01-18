(() => {

  window.addEventListener("load", initProgram);

  function initProgram() {
    if (isAmazonProductPage()) {
      addListeners();
    }
  }

  function isAmazonProductPage() {
    return (
      window.location.hostname.includes("amazon.com") &&
      window.location.pathname.includes("/dp/")
    );
  }

  function addListeners() {

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

      // ---------- PRODUCT ID ----------
      if (request.type === "PRODUCT_ID") {
        const product_id =
          window.location.pathname.split("/dp/")[1]?.split("/")[0] ?? null;

        sendResponse({
          type: "PRODUCT_ID",
          data: product_id
        });

        return true;
      }

      // ---------- REVIEWS ----------
      if (request.type === "REVIEWS") {
        const reviews = document.getElementById("cm-cr-dp-review-list");
        const title = document.getElementById("title")?.textContent;
        const link = window.location.href;
        const product_id =
          window.location.pathname.split("/dp/")[1]?.split("/")[0];

        sendResponse({
          type: "REVIEWS",
          data: reviews
            ? {
                reviews: reviews.innerHTML,
                title,
                link,
                product_id
              }
            : null
        });

        return true;
      }

      // ---------- MODAL ----------
      if (request.type === "MODAL") {
        createModal(request.data);

        sendResponse({
          type: "MODAL",
          status: "success"
        });

        return true;
      }
    });
  }

  function createModal(summary) {
    let modal = document.getElementById("mdl-modal-view");

    if (!modal) {
      modal = document.createElement("div");
      modal.id = "mdl-modal-view";

      modal.innerHTML = `
        <div id="mdl-modal-content">
          <h2>AI Summary</h2>
          <p>${summary}</p>
          <div id="mdl-content-item">
            <button id="close-modal">Close</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      modal.addEventListener("click", e => {
        if (e.target === modal) modal.style.display = "none";
      });
    }

    modal.querySelector("#mdl-modal-content p").innerHTML = summary;
    modal.style.display = "flex";

    modal.querySelector("#close-modal").onclick = () => {
      modal.style.display = "none";
    };
  }

})();
