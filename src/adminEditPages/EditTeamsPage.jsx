import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import { AppDataContext } from '../context/AppDataContext';
import './AdminEditPages.css'

export default function EditTeamsPage() {
    const { teams, setTeams, workers, setWorkers, userList, setUserList } = useContext(AppDataContext);
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
    const otherTeamOptions = teamOptions.filter(opt => selectedTeam && opt.value !== selectedTeam.value);

    useEffect(() => {
        if (selectedTeam) {
            setTeamName(selectedTeam.label);
            // Leader = userList with role teamLeader & worker.team === selectedTeam
            const leaderUser = userList.find(u => u.role === 'teamLeader' && workers.some(w => w.username === u.username && w.team === selectedTeam.value));
            setLeader(leaderUser ? { value: leaderUser.username, label: leaderUser.username } : null);
            // members
            const list = workers.filter(w => w.team === selectedTeam.value)
                .map(w => ({ value: w.username, label: w.username }));
            setMembers(list);
        } else {
            setTeamName(''); setLeader(null); setMembers([]);
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
        const teamId = selectedTeam.value;
        if (members.length) {
            alert('לא ניתן למחוק צוות עם עובדים משוייכים'); return;
        }
        if (window.confirm(`האם למחוק את הצוות "${selectedTeam.label}"?`)) {
            setTeams(teams.filter(t => t.id !== teamId));
            alert('הצוות נמחק');
            setSelectedTeam(null);
        }
    };

    const handleAddMember = () => {
        if (!newMember || !selectedTeam) return alert('בחר עובד');
        setWorkers(workers.map(w => w.username === newMember.value ? { ...w, team: selectedTeam.value } : w));
        alert('העובד נוסף לצוות');
    };

    const handleMoveMember = () => {
        const { moveMember } = this.state;
        if (moveMember && moveMember.value === this.state.leader?.value) {
            alert('לא ניתן להעביר את ראש הצוות לצוות אחר.');
            return;
        }
        if (!moveMember || !moveToTeam) return alert('בחר עובד וצוות יעד');
        setWorkers(workers.map(w => w.username === moveMember.value ? { ...w, team: moveToTeam.value } : w));
        alert('העובד הועבר');
    };

    const handleChangeLeader = () => {
        if (!newLeader || !selectedTeam) return alert('בחר ראש צוות חדש');
        const oldLeader = leader.value;
        // swap roles
        setUserList(userList.map(u => {
            if (u.username === oldLeader) return { ...u, role: 'worker' };
            if (u.username === newLeader.value) return { ...u, role: 'teamLeader' };
            return u;
        }));
        alert('ראש הצוות עודכן');
    };

    return (
        <div className="admin-edit-background">
            <div className="admin-edit-box">
                <h3>עריכת צוותים</h3>
                <div className="mb-3">
                    <label>בחר צוות:</label>
                    <Select options={teamOptions} value={selectedTeam} onChange={setSelectedTeam} placeholder="בחר צוות..." />
                </div>
                {selectedTeam && (
                    <>
                        <div className="mb-3">
                            <label>שם צוות:</label>
                            <input className="form-control" value={teamName} onChange={e => setTeamName(e.target.value)} />
                        </div>

                        <div className="mb-3">
                            <label>ראש צוות נוכחי:</label>
                            <Select isDisabled options={leader ? [leader] : []} value={leader} placeholder="לא נקבע" />
                        </div>

                        <div className="mb-3">
                            <label>שנה ראש צוות:</label>
                            <Select options={members.filter(m => m.value !== leader?.value)} value={newLeader} onChange={setNewLeader} placeholder="בחר ראש צוות חדש..." />
                            <button className="btn btn-secondary mt-2" onClick={handleChangeLeader}>אשר החלפת ראש צוות</button>
                        </div>

                        <div className="mb-3">
                            <label>חברי צוות:</label>
                            <ul>
                                {members.map(m => <li key={m.value}>{m.label}</li>)}
                            </ul>
                        </div>

                        <div className="mb-3">
                            <label>הוסף עובד לצוות:</label>
                            <Select options={workerOptions.filter(w => !members.some(m => m.value === w.value))} value={newMember} onChange={setNewMember} placeholder="בחר עובד..." />
                            <button className="btn btn-success btn-center" onClick={handleAddMember}>הוסף עובד</button>
                        </div>

                        <div className="mb-3">
                            <label>העבר עובד לצוות אחר:</label>
                            <Select options={members.filter(m => m.value !== leader?.value)} value={moveMember} onChange={setMoveMember} placeholder="בחר עובד..." />
                            <Select options={otherTeamOptions} value={moveToTeam} onChange={setMoveToTeam} placeholder="בחר צוות יעד..." className="mt-2" />
                            <button className="btn btn-warning mt-2" onClick={handleMoveMember}>העבר עובד</button>
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
