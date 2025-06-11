import React, { useState, useContext, useEffect } from 'react';
import Select from 'react-select';
import { UserContext } from '../context/UserContext';
import { AppDataContext } from '../context/AppDataContext';
import './TaskAssignmentPage.css'; // קובץ העיצוב החדש

export default function TaskAssignmentPage() {
    const { user, addTask } = useContext(UserContext);
    const { workers, setWorkers, tasks, clients } = useContext(AppDataContext);

    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [selectedClientId, setSelectedClientId] = useState('');
    const [availableWorkers, setAvailableWorkers] = useState([]);
    const [customHours, setCustomHours] = useState('');
    const [selectedWorkers, setSelectedWorkers] = useState([]);

    useEffect(() => {
        const task = tasks.find(t => t.id === +selectedTaskId);
        if (task) {
            setCustomHours(task.avgHours);
        } else {
            setCustomHours('');
            setAvailableWorkers([]);
            setSelectedWorkers([]);
        }
    }, [selectedTaskId, tasks]);

    if (!user) return <div>טוען נתוני משתמש...</div>;
    if (user.role !== 'admin') return <h2>עמוד זה פתוח רק לאדמין</h2>;

    const selectedTaskOption = (() => {
        const t = tasks.find(t => t.id === +selectedTaskId);
        return t ? { value: t.id, label: t.name } : null;
    })();

    const selectedClientOption = (() => {
        const c = clients.find(c => c.id === +selectedClientId);
        return c ? { value: c.id, label: c.name } : null;
    })();

    const handleFindWorkers = () => {
        const task = tasks.find(t => t.id === +selectedTaskId);
        const client = clients.find(c => c.id === +selectedClientId);
        if (!task || !client) {
            alert('יש לבחור גם משימה וגם לקוח');
            return;
        }

        const required = task.requires || [];
        const canDo = w => required.every(r => w.abilities.includes(r));
        const manager = workers.find(w => w.username === client.defaultManager);

        const teamMems = workers.filter(w => w.team === manager?.team && w.username !== manager?.username);
        const notTeam = workers.filter(w => w.team !== manager?.team);

        const capableTeam = teamMems.filter(canDo).sort((a, b) => a.hoursWorked - b.hoursWorked);
        const capableNotTeam = notTeam.filter(canDo).sort((a, b) => a.hoursWorked - b.hoursWorked);

        const sorted = [];
        if (manager && canDo(manager)) {
            sorted.push({
                value: manager.username,
                label: `${manager.username} (מנהל לקוח)`
            });
        }
        capableTeam.forEach(w => {
            sorted.push({
                value: w.username,
                label: `${w.username} (חבר צוות | ${w.hoursWorked} שעות)`
            });
        });
        capableNotTeam.forEach(w => {
            sorted.push({
                value: w.username,
                label: `${w.username} (לא חבר צוות | ${w.hoursWorked} שעות)`
            });
        });

        setAvailableWorkers(sorted);
        setSelectedWorkers(sorted.length
            ? [{ value: sorted[0].value, label: sorted[0].label }]
            : []);
    };

    const handleAssignTask = () => {
        const task = tasks.find(t => t.id === +selectedTaskId);
        const client = clients.find(c => c.id === +selectedClientId);
        const hours = parseFloat(customHours) || 0;

        if (!task || !client || selectedWorkers.length === 0) {
            alert('יש לבחור משימה, לקוח, ועובד אחד לפחות');
            return;
        }

        setWorkers(ws =>
            ws.map(w => {
                const sel = selectedWorkers.find(sw => sw.value === w.username);
                return sel
                    ? { ...w, hoursWorked: w.hoursWorked + hours }
                    : w;
            })
        );

        addTask({
            taskId: task.id,
            title: task.name,
            clientId: client.id,
            client: client.name,
            assignedTo: selectedWorkers.map(sw => sw.value),
            hoursRequired: hours
        });

        alert('המשימה נוספה בהצלחה');

        setSelectedTaskId('');
        setSelectedClientId('');
        setSelectedWorkers([]);
        setCustomHours('');
        setAvailableWorkers([]);
    };

    return (
        <div className="task-assignment-background">
            <div className="task-assignment-container">

                    <h2>סידור משימה</h2>



                <div>
                    <label>בחר משימה:</label>
                    <Select
                        className="react-select-container"
                        classNamePrefix="react-select"
                        options={tasks.map(t => ({ value: t.id, label: t.name }))}
                        value={selectedTaskOption}
                        onChange={e => setSelectedTaskId(e?.value ?? '')}
                        placeholder="בחר משימה..."
                    />
                </div>

                <div>
                    <label>בחר לקוח:</label>
                    <Select
                        className="react-select-container"
                        classNamePrefix="react-select"
                        options={clients.map(c => ({ value: c.id, label: c.name }))}
                        value={selectedClientOption}
                        onChange={e => setSelectedClientId(e?.value ?? '')}
                        placeholder="בחר לקוח..."
                    />
                </div>

                <button  className="btn-primary-center" onClick={handleFindWorkers}>
                    מצא עובדים מתאימים
                </button>

                {availableWorkers.length > 0 && (
                    <>
                        <div className="mt-4">
                            <label>בחר עובדים (ניתן לבחור כמה):</label>
                            <Select
                                className="react-select-container"
                                classNamePrefix="react-select"
                                isMulti
                                options={availableWorkers}
                                value={selectedWorkers}
                                onChange={setSelectedWorkers}
                                placeholder="בחר עובדים..."
                            />
                        </div>

                        <div className="mt-3">
                            <label>שעות משוער (ברירת מחדל {customHours}):</label>
                            <input
                                type="number"
                                className="form-control"
                                value={customHours}
                                onChange={e => setCustomHours(e.target.value)}
                            />
                        </div>

                        <button className="btn btn-success btn-center" onClick={handleAssignTask}>
                            הוסף משימה
                        </button>
                    </>
                )}
            </div>
        </div>

    );
}
