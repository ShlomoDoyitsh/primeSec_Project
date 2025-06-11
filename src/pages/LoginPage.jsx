import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import Card from '../components/Card.jsx';
import { UserContext } from '../context/UserContext.jsx';
import { AppDataContext } from '../context/AppDataContext.jsx';
import './LoginPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function LoginPage() {
    const { setUser } = useContext(UserContext);
    const { userList } = useContext(AppDataContext);

    const [userNameInput, setUserNameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [redirect, setRedirect] = useState(false);

    const handleLogin = () => {
        const foundUser = userList.find(
            (u) => u.username === userNameInput && u.password === passwordInput
        );

        if (foundUser) {
            setUser({
                isLoggedIn: true,
                username: foundUser.username,
                role: foundUser.role,
            });
            setRedirect(true);
        } else {
            alert('שם משתמש או סיסמה שגויים');
        }
    };

    if (redirect) {
        return <Navigate to="/home" />;
    }

    return (
        <div className="login-page-container">
            <img
                src="https://images.cdn-files-a.com/uploads/909407/400_5e876acdaa8d2.png"
                alt="תמונת לוגו"
                width={300}
                height={300 * 0.2825241}
                style={{ display: "block", margin: "0 auto" }}
            />
            <br /><br />

            <Card width="30vw" height="60vh" color="white">
                <div style={{ gridRow: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <h3>כניסה למערכת</h3>
                </div>

                <div className="input-group mb-3" style={{ gridRow: 2 }}>
                    <input
                        type="text"
                        className="form-control rtl"
                        placeholder="שם משתמש"
                        value={userNameInput}
                        onChange={(e) => setUserNameInput(e.target.value)}
                    />
                </div>

                <div className="input-group mb-3" style={{ gridRow: 3 }}>
                    <input
                        type="password"
                        className="form-control rtl"
                        placeholder="סיסמא"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                    />
                </div>

                <div style={{ gridRow: 4, textAlign: 'center' }}>
                    <button
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '10px' }}
                        onClick={handleLogin}
                    >
                        התחבר
                    </button>
                    <div style={{ marginTop: '8px' }}>
                        <a href="#" style={{ fontSize: '0.9em', color: 'black', textDecoration: 'underline' }}>
                            שכחתי סיסמא
                        </a>
                    </div>
                </div>
            </Card>
            <br /><br />
        </div>
    );
}

export default LoginPage;
