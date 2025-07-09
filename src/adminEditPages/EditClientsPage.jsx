import React, { useState, useEffect, useContext } from 'react';
import Select from 'react-select';
import { AppDataContext } from '../context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import './AdminEditPages.css'

export default function EditClientsPage() {
    const { clients, setClients, workers } = useContext(AppDataContext);
    const [selectedClient, setSelectedClient] = useState(null);
    const [name, setName] = useState('');
    const [originalManager, setOriginalManager] = useState(null);
    const [managerSelectValue, setManagerSelectValue] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedClient) {
            // set name
            setName(selectedClient.label);
            // set original manager for display
            const clientObj = clients.find(c => c.id === selectedClient.value);
            const mgr = clientObj?.defaultManager;
            setOriginalManager(mgr || null);
            // initialize select value to current manager
            setManagerSelectValue(
                mgr ? { value: mgr, label: mgr } : null
            );
        } else {
            setName('');
            setOriginalManager(null);
            setManagerSelectValue(null);
        }
    }, [selectedClient, clients]);

    const clientOptions = clients.map(c => ({ value: c.id, label: c.name }));
    const managerOptions = workers
        .filter(w => w.username !== originalManager)
        .map(w => ({ value: w.username, label: w.username }));

    const handleSave = () => {
        if (!selectedClient) return alert('בחר לקוח קודם');
        const trimmed = name.trim();
        if (!trimmed) return alert('יש להזין שם לקוח');
        if (!managerSelectValue) return alert('יש לבחור מנהל לקוח');

        setClients(
            clients.map(c =>
                c.id === selectedClient.value
                    ? { ...c, name: trimmed, defaultManager: managerSelectValue.value }
                    : c
            )
        );

        // update original display
        setOriginalManager(managerSelectValue.value);
        alert('הלקוח עודכן בהצלחה');
        setSelectedClient(null);
    };

    const handleDelete = () => {
        if (!selectedClient) return alert('אין לקוח למחיקה');
        const clientObj = clients.find(c => c.id === selectedClient.value);
        if (window.confirm(`האם למחוק את הלקוח "${clientObj.name}"?`)) {
            setClients(clients.filter(c => c.id !== clientObj.id));
            alert('הלקוח נמחק');
            setSelectedClient(null);
        }
    };

    return (
        <div className="admin-edit-background" dir="rtl">
            <div className="admin-edit-box">
                <h3>עריכת לקוח קיים</h3>

                <div className="mb-3">
                    <label>בחר לקוח:</label>
                    <Select
                        options={clientOptions}
                        value={selectedClient}
                        onChange={opt => setSelectedClient(opt)}
                        placeholder="בחר לקוח..."
                    />
                </div>

                {selectedClient && (
                    <>
                        <div className="mb-3">
                            <label>מנהל נוכחי:</label>
                            <span style={{ marginLeft: '8px' }}>
              {originalManager || 'לא נקבע'}
            </span>
                        </div>

                        <div className="mb-3">
                            <label>שם לקוח:</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label>שנה מנהל לקוח:</label>
                            <Select
                                options={managerOptions}
                                value={managerSelectValue}
                                onChange={opt => setManagerSelectValue(opt)}
                                placeholder="בחר מנהל חדש..."
                            />
                        </div>

                        <div className="d-flex justify-content-between">
                            <button className="btn btn-danger" onClick={handleDelete}>
                                מחק לקוח
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
