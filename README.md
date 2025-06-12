# Real-Time Customer Reviews Analysis

Analyzes customer product reviews (scraped in real-time) using Aspect-Based Sentiment Analysis (ABSA) to extract and summarize product pros and cons based on specific features.

# Table of Content
1. [Architucture](#architecture)
2. [Aspect-Based Sentiment Analysis (ABSA)](#aspect-based-sentiment-analysis-absa)
2. [Technology and Frameworks](#technology-and-frameworks)
4. [Contribution](#contributors)
5. [Future Consideration](#future-considerations)

## Architecture
This project is aimed to provide a microservice to summarize the reviews of the customers for a specific product to extract some aspects that reflect their overall satisfaction about the product, representing it back to the user in a user-friendly small paragraph form. Currently it only designed for Amazon market and we are aiming to expand this project beyond this scope, check the [future considerations](#future-considerations) for more information.

For achieving this, we have implemented a 3-tiered application consisting of:
* Chrome Extension popup
* NodeJS Backend
* Fine-tuned BERT model clustier

These three tiers are stand-alone tiers communicating according to the following architecture.

<div align="center">
    <img src="public/architecture.png" width="70%">
</div>

The `background.js` injects runtime messages for later trigger using the extension when loading an Amazon product page. When a user requests a summary, extension triggers `chrome.tabs.onMessage` api to request the reviews innerHTML. The reviews is sent to the backend, cleaned and proceed by the fine-tuned BERT model for sentiment analysis. The model respond back to the backend with the followng json format
```json
{
    analysis results: [
        {
            review_text:
            aspects_extracted
        },
        ...
    ],
    final_summary:{
        pros: [
            ...
        ]
        cons:[
            ...
        ]
    },
    summary_paragraph: ...,
}
```
The `summary_paragraph` is sent back to the front-end which triggers `chrome.runtime.onMessage(Modal)`, passing the paragraph to the content-scripts for injecting a modal in the webpage consisting the summary.

Here is a demo of the results

![Demo results](public/demo%20results.png)


## Aspect-Based Sentiment Analysis (ABSA)
The documentation for the work and outputs of the model is documented [Here](/services/ml-1/PBL_proj.pdf)

## Technology and Frameworks

### Frontend
* Vue.js
* Chrome Apis

### Backend
* NodeJS/Express
* Cheerio
* Vercel Deployment

### Machine Learning
* PyTorch
* BERT
* Hugging Face
* FastAPI


## Contributors

- [Abanoub Aziz](https://github.com/abanoub-samy-farhan) — Backend, Chrome Extension, Deployment
- [Abdallah Adel](https://github.com/abdallahade1) — Machine Learning
- [Abdelrahman Ryiad](https://github.com/abdulrahman-riyad) — Machine Learning
- [Shahd Ammar](https://github.com/ShahdAmmar) — Machine Learning
- [Yasmeen Sameh](https://github.com/Yasmeen55098) — Machine Learning

We worked collaboratively to build and refine this project.

## Future Considerations

We are aiming to expand the scope of this project beyond scraping specific domains to be a stand-alone reusable microservice with nessary configurations and APIs for businesses to use in their systems, providing a more native summary component in their E-commerce website.