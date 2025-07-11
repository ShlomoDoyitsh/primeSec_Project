import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import './AdminEditPages.css';

export default function AbilityEditPage() {
    const {
        abilities,
        tasks, setTasks,
        removeAbility
    } = useAppData();

    const [newAbility, setNewAbility] = useState('');

    const handleAddAbility = () => {
        const trimmed = newAbility.trim();
        if (!trimmed) return;
        if (!abilities.includes(trimmed)) {
            // להוסיף את היכולת באופן גלובלי
            // כאן ניתן לקרוא לפונקציה מותאמת אם רוצים שכל ההוספה תעבור דרכה
            setAbilities(prev => [...prev, trimmed]);
        }
        setNewAbility('');
    };

    const handleDeleteAbility = (ability) => {
        if (window.confirm(`האם למחוק את היכולת "${ability}"?`)) {
            // הסרה מ-workers ו-abilities
            removeAbility(ability);

            // הסרת הדרישה מ-tasks.requires
            setTasks(tasks.map(t => ({
                ...t,
                requires: t.requires.filter(r => r !== ability)
            })));
        }
    };

    return (
        <div className="admin-edit-background" dir="rtl">
            <div className="admin-edit-box">
                <h3>ניהול יכולות</h3>

                <div className="mb-3">
                    <label>יכולת חדשה:</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="הזן שם יכולת..."
                        value={newAbility}
                        onChange={e => setNewAbility(e.target.value)}
                    />
                </div>

                <button className="btn btn-success btn-center" onClick={handleAddAbility}>
                    הוסף יכולת
                </button>

                {abilities.length > 0 && (
                    <div>
                        <h4>יכולות קיימות:</h4>
                        <ul className="list-group">
                            {abilities.map((ability, idx) => (
                                <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                                    <span>{ability}</span>
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => handleDeleteAbility(ability)}
                                    >
                                        ×
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
