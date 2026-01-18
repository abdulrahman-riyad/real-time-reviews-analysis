import { useState } from "react"
import { FaShuffle } from "react-icons/fa6";
import { LuLoaderCircle } from "react-icons/lu";
import { PiSignIn } from "react-icons/pi";
import {message} from "antd";

import "../styles/buttons.css"
import type { MessageInstance } from "antd/es/message/interface";

export function GenerateButton() {
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [api, contextHolder] = message.useMessage();
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
                    api.error("Ensure that you are on Amazon product and wait until the page is fully loaded, then try again.");
                    setLoading(false);
                    setDisabled(false);
                    return;
                }
                if (!response){
                    api.error(`Response is undefined`);
                }

                const token = localStorage.getItem("token");
                if (!token){
                    api.error("You must be signed in to generate summary.");
                    setLoading(false);
                    setDisabled(false);
                    return;
                }

                fetch(`${import.meta.env.VITE_SERVER_URL}/reviews/generate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        reviews: response.data.reviews,
                        title: response.data.title,
                        link: response.data.link,
                        product_id: response.data.product_id
                    }),
                }).then(async (res) => {
                    if (!res.ok){
                        api.error("An error occurred while cleaning the data ");
                        setLoading(false);
                        setDisabled(false);
                        return;
                    }

                    const result = await res.json();
                    api.success(result.message);
                    
                    
                    
                }).catch((error) => {
                    console.error("Error during fetch:", error);
                    api.info("An error occurred while generating the summary. Please try again.");
                }).finally(() => {
                    setLoading(false);
                    setDisabled(false);
                })
            })   
        });
    }
    return (
        <button onClick={() => handleGenerate()} disabled={disabled} className="generate-button">
                {contextHolder}
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

export const SigningButton = ({ text, handleClick }: { text: string; handleClick: () => void }) => {
  return (
    <button onClick={handleClick} style={{ 
        display: "flex",
        alignItems: "center",
        gap: "10px",
    }}>
        <PiSignIn  />
        {text}
    </button>
  );
};

export const OpenModalButton = ({summary, currentTabId, api}: {summary: string; currentTabId: number; api: MessageInstance}) => {
    const handleOpenModal = () => {
        chrome.tabs.sendMessage(currentTabId ? currentTabId : -1, 
        { type: "MODAL", data: summary}, (response) => {
        if (chrome.runtime.lastError){
            console.log("An error occurred while sending the data to the content script");
                    return;
        }
        if (response === "error"){
            api.error("An error occurred while sending the data to the content script");
                return;
            }
        })
    }

    return ((
        <button onClick={() => handleOpenModal()}>
            View Summary
        </button>
    ));
}