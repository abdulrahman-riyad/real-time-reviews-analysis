import { useState } from "react";
import "../output.css";
import { useNavigate } from 'react-router';
import { message } from "antd";

function SignUp() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [messageApi, contextHolder] = message.useMessage();

    const success = (msg:string) => {
        messageApi.open({
            type: 'success',
            content: msg,
        });
    }
    const error = (msg:string) => {
        messageApi.open({
            type: 'error',
            content: msg,
        });
    }

    const navigate = useNavigate();
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                firstname: firstName,
                lastname: lastName,
                email,
                password,
            }),
        });
        if (response.ok){
            success("Account created successfully! Please sign in.");
            navigate("/sign-in");
        }
        else {
            error("Failed to create account. Please try again.");
        }
        } catch (err) {
            error("An error occurred. Please try again.");
        }
    }
    return (
        <div className="flex items-center justify-center p-4">
            {contextHolder}
            <div className="absolute top-4 left-4 cursor-pointer 
            text-gray-400 hover:text-white" onClick={() => navigate("/")}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </div>
            <div className="w-full max-w-md">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Sign Up</h1>
                    <p className="text-gray-400 mb-8">Access your reviews dashboard</p>
                    
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="flex flex-row gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                                <input type="text" placeholder="John" className="w-full px-4 py-2 
                                border border-gray-600 rounded-lg 
                                text-white placeholder-gray-500 focus:outline-none 
                                focus:border-purple-500 transition"
                                onChange={(e) => setFirstName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                                <input type="text" placeholder="Doe" className="w-full px-4 py-2 
                                border border-gray-600 rounded-lg 
                                text-white placeholder-gray-500 focus:outline-none 
                                focus:border-purple-500 transition" 
                                onChange={(e) => setLastName(e.target.value)} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input type="email" placeholder="you@example.com" className="w-full px-4 py-2 
                            border border-gray-600 rounded-lg 
                            text-white placeholder-gray-500 focus:outline-none 
                            focus:border-purple-500 transition" 
                            onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input type="password" placeholder="••••••••" 
                            className="w-full px-4 py-2 border border-gray-600 rounded-lg 
                            text-white placeholder-gray-500 
                            focus:outline-none focus:border-purple-500 transition" 
                            onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        
                        <button type="submit">Sign Up</button>
                    </form>
                    <p className="text-center text-slate-400 text-sm mt-6">Have an account already? <a onClick={() => navigate("/sign-in")} className="text-blue-500 hover:text-blue-400 cursor-pointer">Sign in</a></p>
                </div>
            </div>
        </div>
    )
}

export default SignUp;