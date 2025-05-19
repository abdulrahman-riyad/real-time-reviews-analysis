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
                    console.error("Error sending message:", chrome.runtime.lastError);
                    return;
                }
                if (!response){
                    alert("Response is undefined");
                }

                // debugging
                if (response.data){
                    alert(`Response is found ${response.data}`);
                }
                const res = await fetch("http://localhost:5000/clean", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        data: response.data,
                    }),
                })

                if (!res.ok){
                    alert("Error sending data to the server");
                    return;
                }
            })
            setLoading(false);
            setDisabled(false);
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