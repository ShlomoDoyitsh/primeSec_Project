import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import { AppDataContext } from '../context/AppDataContext';
import './PersonalDetailsPage.css';

export default function PersonalDetailsPage() {
    const { user, setUser } = useContext(UserContext);
    const { workers, setWorkers, clients, setClients, tasks, setTasks, userList, setUserList, teams } = useContext(AppDataContext);

    if (!user || !user.isLoggedIn) {
        return <h2 style={{ textAlign: 'center' }}>עליך להתחבר קודם</h2>;
    }

    const [username, setUsername] = useState(user.username);

    const handleSave = () => {
        if (!username.trim()) return alert('יש להזין שם משתמש');
        const oldUsername = user.username;
        const newUsername = username.trim();

        setUserList(userList.map(u =>
            u.username === oldUsername ? { ...u, username: newUsername } : u
        ));
        setUser({ ...user, username: newUsername });
        setWorkers(workers.map(w =>
            w.username === oldUsername ? { ...w, username: newUsername } : w
        ));
        setClients(clients.map(c =>
            c.defaultManager === oldUsername ? { ...c, defaultManager: newUsername } : c
        ));
        setTasks(tasks.map(t =>
            t.assignedTo === oldUsername ? { ...t, assignedTo: newUsername } : t
        ));

        alert('הפרטים נשמרו בהצלחה');
    };

    const meWorker = workers.find(w => w.username === user.username) || {};
    const hoursWorked = meWorker.hoursWorked || 0;
    const abilities = meWorker.abilities || [];
    const myClients = clients.filter(c => c.defaultManager === user.username).map(c => c.name);
    const myTeam = teams.find(t => t.id === meWorker.team);
    const teamMembers = workers.filter(w => w.team === meWorker.team).map(w => w.username);
    const isLeader = user.role === 'teamLeader';

    return (
        <>
            <div className="personal-details-background"></div>
            <div className="personal-details-container">
                <div className="personal-details-box">
                    <h2>פרטים אישיים</h2>

                    <div className="mb-3">
                        <label>שם משתמש:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-primary btn-save" onClick={handleSave}>
                        שמור שינויים
                    </button>

                    <h3>תחומי ההתמחות שלי</h3>
                    <ul>
                        {abilities.length > 0
                            ? abilities.map(a => <li key={a}>{a}</li>)
                            : <li>אין נתונים</li>}
                    </ul>

                    <h3>לקוחות קבועים שלי</h3>
                    <ul>
                        {myClients.length > 0
                            ? myClients.map(c => <li key={c}>{c}</li>)
                            : <li>אין לקוחות קבועים</li>}
                    </ul>

                    <h3>הצוות שלי</h3>
                    <p><strong>שם צוות:</strong> {myTeam?.name || 'לא משויך'}</p>
                    <p><strong>תפקיד:</strong> {isLeader ? 'ראש צוות' : 'חבר צוות'}</p>
                    <ul>
                        {teamMembers.length > 0
                            ? teamMembers.map(m => <li key={m}>{m}</li>)
                            : <li>אין חברים</li>}
                    </ul>

                    <h3>שעות עבודה</h3>
                    <p>{hoursWorked} שעות</p>
                </div>
            </div>
        </>
    );
}
