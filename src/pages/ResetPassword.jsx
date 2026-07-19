import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }

        const response = await fetch(
            `http://localhost:8000/api/reset-password/${token}`,
            {
                method: "POST",
                headers: {
                    "Content-type": "application/json", 
                },
                body: JSON.stringify({
                    password,
                }),
            }
        );

        const data = await response.json();

        if(response.ok){
            setMessage(data.message);
            setTimeout(() => {
                navigate("/");
            }, 2000);
        }else{
            setMessage(data.message);
        }
    }
    return(
        <div style={{padding: "40px" }}>
            <h1>Reset Password</h1>

            <form onSubmit={handleSubmit}>
                <input
                    type="password"
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <br />
                <br />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <br />
                <br />

                <button type="submit">
                    Reset Password
                </button>
            </form>

            <p>{message}</p>
        </div>
    );
}
export default ResetPassword;