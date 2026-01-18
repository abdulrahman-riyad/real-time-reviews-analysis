import './App.css'
import { 
  GenerateButton,
  OpenModalButton,
  SigningButton
} from './components/Buttons';
import Header from './components/Header';
import Footer from './components/Footer';
import { GithubIcon, LogoutIcon } from './components/Icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';
import { message } from "antd";


function App() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(auth?.user !== null);
  const [currentReview, setCurrentReview] = useState(null);
  const [currentTabId, setCurrentTabId] = useState<number | null>(null);
  const [api, contextHolder] = message.useMessage();

  useEffect(() => {
    setIsSignedIn(auth?.user !== null);
  }, [auth?.user]);

  // checking if the review for the current product is already generated
  useEffect(() => {
    async function checkIfGenerated() {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];
      if (!currentTab || !currentTab.id) {
          api.error("No active tab found");
          return;
      }

      setCurrentTabId(currentTab.id);

      try {
        const response = await chrome.tabs.sendMessage(currentTab.id ? currentTab.id : -1, {
          type: "PRODUCT_ID"
        });
        
        const product_id = response.data;
        if (!product_id) return;
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/reviews/summary/${product_id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (res.status == 202){
          api.info("a summary is being generated. Please wait...");
          return;
        }
        if (res.status == 200){
          const result = await res.json();
          setCurrentReview(result.summary);
        }
      } catch (error: any) {
        api.error(error.message || "An error occurred while checking for existing summary.");
      }
  }
  checkIfGenerated();
  }, []);
  return (
    <div className="flex flex-col gap-4">
      {contextHolder}
      <div className="flex justify-center gap-4">
        <GithubIcon />
        {isSignedIn && <LogoutIcon setIsSignedIn={setIsSignedIn} />}
      </div>
      <Header />
      {isSignedIn ? (
        <>
          <GenerateButton />
          {currentReview && currentTabId &&
           <OpenModalButton 
           summary={currentReview} 
           currentTabId={currentTabId} 
           api={api} />}
        </>
      ) : (
        <div className="mt-2 text-center gap-4 flex flex-col">
          <p>Please sign in to use the extension.</p>
          <SigningButton text="Sign In" handleClick={() => navigate("/sign-in")} />
        </div>
      )}
      <Footer />
    </div>
  )
}

export default App
