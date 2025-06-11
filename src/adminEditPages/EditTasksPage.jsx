import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import { AppDataContext } from '../context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import './AdminEditPages.css'

export default function EditTasksPage() {
    const { tasks, setTasks, abilities } = useContext(AppDataContext);
    const [selectedTask, setSelectedTask] = useState(null);
    const [name, setName] = useState('');
    const [requires, setRequires] = useState([]);
    const [avgHours, setAvgHours] = useState('');
    const navigate = useNavigate();

    // initialize fields on select
    useEffect(() => {
        if (selectedTask) {
            const taskObj = tasks.find(t => t.id === selectedTask.value);
            setName(taskObj.name);
            setAvgHours(taskObj.avgHours);
            setRequires(
                taskObj.requires.map(r => ({ value: r, label: r }))
            );
        } else {
            setName('');
            setAvgHours('');
            setRequires([]);
        }
    }, [selectedTask, tasks]);

    const taskOptions = tasks.map(t => ({ value: t.id, label: t.name }));
    const abilityOptions = abilities.map(a => ({ value: a, label: a }));

    const handleSave = () => {
        if (!selectedTask) {
            alert('בחר משימה לעדכון');
            return;
        }
        const trimmed = name.trim();
        if (!trimmed) {
            alert('יש להזין שם משימה');
            return;
        }
        const hours = parseFloat(avgHours);
        if (isNaN(hours) || hours <= 0) {
            alert('יש להזין שעות ממוצעות תקינות');
            return;
        }
        setTasks(
            tasks.map(t =>
                t.id === selectedTask.value
                    ? { ...t, name: trimmed, avgHours: hours, requires: requires.map(r => r.value) }
                    : t
            )
        );
        alert('המשימה עודכנה בהצלחה');
        setSelectedTask(null);
    };

    const handleDelete = () => {
        if (!selectedTask) {
            alert('בחר משימה למחיקה');
            return;
        }
        const taskObj = tasks.find(t => t.id === selectedTask.value);
        if (window.confirm(`האם למחוק את המשימה "${taskObj.name}"?`)) {
            setTasks(tasks.filter(t => t.id !== taskObj.id));
            alert('המשימה נמחקה');
            setSelectedTask(null);
        }
    };

    return (
        <div className="admin-edit-background" dir="rtl">
            <div className="admin-edit-box">
            <h3>עריכת משימה קיימת</h3>

            <div className="mb-3">
                <label>בחר משימה:</label>
                <Select
                    options={taskOptions}
                    value={selectedTask}
                    onChange={opt => setSelectedTask(opt)}
                    placeholder="בחר משימה..."
                />
            </div>

            {selectedTask && (
                <>
                    <div className="mb-3">
                        <label>שם משימה:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="mb-3">
                        <label>יכולות נדרשות:</label>
                        <Select
                            options={abilityOptions}
                            isMulti
                            value={requires}
                            onChange={setRequires}
                            placeholder="בחר יכולות..."
                        />
                    </div>

                    <div className="mb-3">
                        <label>שעות ממוצעות:</label>
                        <input
                            type="number"
                            className="form-control"
                            value={avgHours}
                            onChange={e => setAvgHours(e.target.value)}
                        />
                    </div>

                    <div className="d-flex justify-content-between">
                        <button className="btn btn-danger" onClick={handleDelete}>
                            מחק משימה
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            שמור שינויים
                        </button>
                    </div>
                </>
            )}
        </div>
        </div>
    );
}
