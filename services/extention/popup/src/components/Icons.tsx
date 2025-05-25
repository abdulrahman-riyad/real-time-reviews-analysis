import { FaGithub } from "react-icons/fa";
import "../styles/icons.css"

export default function GithubIcon () {
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