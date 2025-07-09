import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import { AppDataContext } from '../context/AppDataContext';
import './AdminEditPages.css';

export default function EditTeamsPage() {
    const {
        teams,
        setTeams,
        workers,
        setWorkers,
        userList,
        changeTeamLeader    // פונקציה מרכזית בשינוי ראש צוות
    } = useContext(AppDataContext);

    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [leader, setLeader] = useState(null);
    const [members, setMembers] = useState([]);
    const [newMember, setNewMember] = useState(null);
    const [moveMember, setMoveMember] = useState(null);
    const [moveToTeam, setMoveToTeam] = useState(null);
    const [newLeader, setNewLeader] = useState(null);

    const teamOptions = teams.map(t => ({ value: t.id, label: t.name }));
    const workerOptions = workers.map(w => ({ value: w.username, label: w.username }));
    const otherTeamOptions = selectedTeam
        ? teamOptions.filter(opt => opt.value !== selectedTeam.value)
        : [];

    useEffect(() => {
        if (selectedTeam) {
            setTeamName(selectedTeam.label);
            // חברי הצוות
            const teamMembers = workers.filter(w => w.team === selectedTeam.value);
            setMembers(teamMembers.map(w => ({ value: w.username, label: w.username })));
            // מציאת המנהל מתוך חברי הצוות
            const leaderMember = teamMembers.find(w => {
                const u = userList.find(u => u.username === w.username);
                return u?.role === 'teamLeader';
            });
            setLeader(
                leaderMember
                    ? { value: leaderMember.username, label: leaderMember.username }
                    : null
            );
        } else {
            setTeamName('');
            setMembers([]);
            setLeader(null);
        }
        setNewMember(null);
        setMoveMember(null);
        setMoveToTeam(null);
        setNewLeader(null);
    }, [selectedTeam, workers, userList]);

    const handleSave = () => {
        if (!selectedTeam) return alert('בחר צוות קודם');
        const trimmed = teamName.trim();
        if (!trimmed) return alert('יש להזין שם צוות');
        setTeams(teams.map(t => t.id === selectedTeam.value ? { ...t, name: trimmed } : t));
        alert('הצוות עודכן');
        setSelectedTeam(null);
    };

    const handleDelete = () => {
        if (!selectedTeam) return alert('בחר צוות למחיקה');
        if (members.length) return alert('לא ניתן למחוק צוות עם עובדים משויכים');
        if (window.confirm(`למחוק את הצוות "${selectedTeam.label}"?`)) {
            setTeams(teams.filter(t => t.id !== selectedTeam.value));
            alert('הצוות נמחק');
            setSelectedTeam(null);
        }
    };

    const handleAddMember = () => {
        if (!newMember || !selectedTeam) return alert('בחר עובד');
        setWorkers(workers.map(w =>
            w.username === newMember.value ? { ...w, team: selectedTeam.value } : w
        ));
        alert('העובד נוסף לצוות');
    };

    const handleMoveMember = () => {
        if (!moveMember || !moveToTeam) return alert('בחר עובד וצוות יעד');
        if (moveMember.value === leader?.value) return alert('לא ניתן להעביר את ראש הצוות');
        setWorkers(workers.map(w =>
            w.username === moveMember.value ? { ...w, team: moveToTeam.value } : w
        ));
        alert('העובד הועבר');
    };

    const handleChangeLeader = () => {
        if (!newLeader || !selectedTeam) return alert('בחר ראש צוות חדש');
        changeTeamLeader(selectedTeam.value, newLeader.value);
        setLeader({ value: newLeader.value, label: newLeader.value });
        setNewLeader(null);
        alert('ראש הצוות עודכן');
    };

    return (
        <div className="admin-edit-background" dir="rtl">
            <div className="admin-edit-box">
                <h3>עריכת צוותים</h3>
                <div className="mb-3">
                    <label>בחר צוות:</label>
                    <Select
                        options={teamOptions}
                        value={selectedTeam}
                        onChange={setSelectedTeam}
                        placeholder="בחר צוות..."
                    />
                </div>
                {selectedTeam && (
                    <>
                        <div className="mb-3">
                            <label>שם צוות:</label>
                            <input
                                className="form-control"
                                value={teamName}
                                onChange={e => setTeamName(e.target.value)}
                            />
                        </div>
                        <div className="mb-3">
                            <label>ראש צוות נוכחי:</label>
                            <Select
                                isDisabled
                                options={leader ? [leader] : []}
                                value={leader}
                                placeholder="לא נקבע"
                            />
                        </div>
                        <div className="mb-3">
                            <label>שנה ראש צוות:</label>
                            <Select
                                options={members
                                    .filter(m => m.value !== leader?.value)
                                    .map(opt => {
                                        const u = userList.find(u => u.username === opt.value);
                                        const disabled = u?.role === 'teamLeader';
                                        const note = disabled ? ` (מנהל צוות)` : '';
                                        return {
                                            value: opt.value,
                                            label: opt.label + note,
                                            isDisabled: disabled
                                        };
                                    })}
                                value={newLeader}
                                onChange={setNewLeader}
                                isOptionDisabled={opt => opt.isDisabled}
                                placeholder="בחר ראש צוות חדש..."
                            />
                            <button className="btn btn-secondary mt-2" onClick={handleChangeLeader}>
                                אשר החלפת ראש צוות
                            </button>
                        </div>
                        <div className="mb-3">
                            <label>חברי צוות:</label>
                            <ul>{members.map(m => <li key={m.value}>{m.label}</li>)}</ul>
                        </div>
                        <div className="mb-3">
                            <label>הוסף עובד לצוות:</label>
                            <Select
                                options={workerOptions.filter(w => !members.some(m => m.value === w.value) &&
                                    userList.find(u => u.username === w.value)?.role !== 'teamLeader')}
                                value={newMember}
                                onChange={setNewMember}
                                placeholder="בחר עובד..."
                            />
                            <button className="btn btn-success btn-center" onClick={handleAddMember}>
                                הוסף עובד
                            </button>
                        </div>
                        <div className="mb-3">
                            <label>העבר עובד לצוות אחר:</label>
                            <Select
                                options={members.filter(m => m.value !== leader?.value)}
                                value={moveMember}
                                onChange={setMoveMember}
                                placeholder="בחר עובד..."
                            />
                            <Select
                                options={otherTeamOptions}
                                value={moveToTeam}
                                onChange={setMoveToTeam}
                                placeholder="בחר צוות יעד..."
                                className="mt-2"
                            />
                            <button className="btn btn-warning mt-2" onClick={handleMoveMember}>
                                העבר עובד
                            </button>
                        </div>
                        <div className="d-flex justify-content-between">
                            <button className="btn btn-danger" onClick={handleDelete}>מחק צוות</button>
                            <button className="btn btn-primary" onClick={handleSave}>שמור שינויים</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
