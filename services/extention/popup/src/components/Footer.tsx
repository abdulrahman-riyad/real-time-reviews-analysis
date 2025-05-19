import "../styles/footer.css";

export default function Footer (){
    return (
        <footer>
            <div className="footer-content">
                <div className="author-header">
                    <p>Authered by: </p>
                </div>
                <div className="footer-text footer-text-names">
                    <a href="https://github.com/abanoub-samy-farhan" target="_blank" rel="noopener noreferrer">
                        Abanoub
                    </a>
                    <a href="https://github.com/abanoub-samy-farhan" target="_blank" rel="noopener noreferrer">
                        Riyad
                    </a>
                    <a href="https://github.com/abanoub-samy-farhan" target="_blank" rel="noopener noreferrer">
                        Abdallah
                    </a>
                    
                    <a href="https://github.com/abanoub-samy-farhan" target="_blank" rel="noopener noreferrer">
                        Shahd
                    </a>
                    
                    <a href="https://github.com/abanoub-samy-farhan" target="_blank" rel="noopener noreferrer">
                        Yasmeen
                    </a>
                </div>
            </div>
            <div className="footer-content version-info">
                <p>Version: 1.0</p>
            </div>
        </footer>
    )
}