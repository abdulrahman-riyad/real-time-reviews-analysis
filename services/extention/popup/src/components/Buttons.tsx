import { useState } from "react"
import { FaShuffle } from "react-icons/fa6";
import { LuLoaderCircle } from "react-icons/lu";
import "../styles/buttons.css"

export default function GenerateButton() {
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const handleGenerate = () => {
        setLoading(true)
        setDisabled(true);
        
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const currentTab = tabs[0];

            if (!currentTab) {
                console.error("No active tab found");
                return;
            }
            chrome.tabs.sendMessage(currentTab.id ? currentTab.id : -1, { type: "REVIEWS"}, async (response) => {
                if (chrome.runtime.lastError){
                    alert("Ensure that you are on Amazon product and wait until the page is fully loaded, then try again.");
                    setLoading(false);
                    setDisabled(false);
                    return;
                }
                if (!response){
                    alert(`Response is undefined`);
                }

                fetch("https://real-time-analysis-app-api.vercel.app/generate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        data: response.data,
                    }),
                }).then(async (res) => {
                    if (!res.ok){
                        alert("An error occurred while cleaning the data ");
                        return;
                    }

                    const result = await res.json();
                    
                    chrome.tabs.sendMessage(currentTab.id ? currentTab.id : -1, 
                        { type: "MODAL", data: result.data.final_summary.summary_paragraph}, (response) => {
                        if (chrome.runtime.lastError){
                            console.log("An error occurred while sending the data to the content script");
                            return;
                        }
                        if (response === "error"){
                            alert("An error occurred while sending the data to the content script");
                            return;
                        }
                    })
                }).catch((error) => {
                    console.error("Error during fetch:", error);
                    alert("An error occurred while cleaning the data");
                }).finally(() => {
                    setLoading(false);
                    setDisabled(false);
                })
            })   
        });
    }
    return (
        <button onClick={() => handleGenerate()} disabled={disabled} className="generate-button">
                <div>
                    {loading ? (
                        <LuLoaderCircle className="loading-icon"/>
                    ): (
                        <FaShuffle className="generate-icon"/>
                    )}
                </div>
                <div>
                    {loading ? (
                        <span>Generating...</span>
                    ): (
                        <span>Generate Summary</span>
                    )}
                </div>
        </button>
    )
}