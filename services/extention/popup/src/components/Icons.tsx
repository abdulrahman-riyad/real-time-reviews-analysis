import { FaGithub } from "react-icons/fa";
import { IoIosLogOut } from "react-icons/io";
import "../styles/icons.css"

export function GithubIcon () {
    return (    
        <a 
        href="https://github.com/abdulrahman-riyad/real-time-reviews-analysis" 
        target="_blank"
        rel="noreferrer">
            <div className="icon-container">
                <FaGithub />
            </div>
        </a>
    )
}

export function LogoutIcon ({ setIsSignedIn }: { setIsSignedIn: React.Dispatch<React.SetStateAction<boolean>> }) {
    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsSignedIn(false);
    }
    return (
        <div className="icon-container" onClick={handleLogout}>
            <IoIosLogOut />
        </div>
    )
}
