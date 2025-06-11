import React, { useState, useContext } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import { AppDataContext } from '../context/AppDataContext';
import './MyTeamPage.css';

export default function MyTeamPage() {
    const { user } = useContext(UserContext);
    const { workers, clients, tasks = [] } = useContext(AppDataContext);
    const [selectedMember, setSelectedMember] = useState(null);

    if (!user || user.role !== 'teamLeader') {
        return <h2 style={{ textAlign: 'center' }}>עמוד זה פתוח רק לראש צוות</h2>;
    }

    const me = workers.find(w => w.username === user.username) || {};
    const myTeamId = me.team;
    const teamMembers = workers.filter(w => w.team === myTeamId && w.username !== user.username);


    const handleSelect = member => setSelectedMember(member);

    const memberClients = selectedMember
        ? clients.filter(c => c.defaultManager === selectedMember.username)
        : [];

    const memberTasks = selectedMember
        ? tasks.filter(task => {
            if (Array.isArray(task.assignedTo)) {
                return task.assignedTo.includes(selectedMember.username);
            }
            return task.assignedTo === selectedMember.username;
        })
        : [];

    return (
        <>
            <div className="my-team-page-background"></div>
            <div className="my-team-page-container" dir="rtl">
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>הצוות שלי</h2>
                <div className="my-team-box">
                    <ul className="list-group team-list">
                        {teamMembers.map(member => (
                            <li
                                key={member.username}
                                className={`list-group-item ${selectedMember?.username === member.username ? 'active' : ''}`}
                                onClick={() => handleSelect(member)}
                            >
                                {member.username}
                            </li>
                        ))}
                    </ul>

                    {selectedMember && (
                        <>
                            <div className="member-details">
                                <div className="card">
                                    <div className="card-body">
                                        <h3 className="card-title">{selectedMember.username}</h3>
                                        <p><strong>שעות עבודה:</strong> {selectedMember.hoursWorked} שעות</p>
                                        <p><strong>לקוחות מנוהלים:</strong></p>
                                        {memberClients.length > 0 ? (
                                            <ul>
                                                {memberClients.map(c => <li key={c.id}>{c.name}</li>)}
                                            </ul>
                                        ) : (
                                            <p>אין לקוחות מנוהלים</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="member-tasks">
                                <div className="card">
                                    <div className="card-body">
                                        <h4 className="card-title">משימות לביצוע</h4>
                                        {memberTasks.length > 0 ? (
                                            <table className="table table-bordered text-center">
                                                <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>שם משימה</th>
                                                    <th>לקוח</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {memberTasks.map((task, idx) => (
                                                    <tr key={task.id || idx}>
                                                        <td>{idx + 1}</td>
                                                        <td>{task.title || `משימה ${task.taskId}`}</td>
                                                        <td>{task.client || `לקוח ${task.clientId}`}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        ) : (
                                            <p>אין משימות לביצוע</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
