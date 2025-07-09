import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext.jsx';
import { AppDataContext } from '../context/AppDataContext';
import { Navigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Select from 'react-select';
import './HomePage.css';

export default function HomePage() {
    const {
        user,
        tasks = [],
        completedTasks = [],
        markTaskCompleted,
        recordTaskProgress
    } = useContext(UserContext);
    const { workers } = useContext(AppDataContext);
    const [navigateToAssignment, setNavigateToAssignment] = useState(false);

    const [filters, setFilters] = useState({ title: [], client: [], assignedTo: [] });
    const [tempFilters, setTempFilters] = useState({ title: [], client: [], assignedTo: [] });
    const [openDropdown, setOpenDropdown] = useState(null);

    // partial hours input per task
    const [partialHours, setPartialHours] = useState({});
    // performer selection per task (for admin/leader)
    const [selectedPerformer, setSelectedPerformer] = useState({});

    useEffect(() => {
        const handleClickOutside = e => {
            const dropdown = document.querySelector('.floating-dropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                setOpenDropdown(null);
            }
        };
        if (openDropdown) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [openDropdown]);

    if (!user || !user.isLoggedIn) return <h2 className="text-center">עליך להתחבר קודם</h2>;
    if (navigateToAssignment) return <Navigate to="/task-assignment" />;

    // filter dropdown handlers
    const handleOpenFilter = (field, event) => {
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        setTempFilters(prev => ({ ...prev, [field]: filters[field] }));
        setOpenDropdown({ field, position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX } });
    };
    const toggleTempFilter = (field, value) => {
        setTempFilters(prev => {
            const curr = prev[field];
            return { ...prev, [field]: curr.includes(value) ? curr.filter(v => v !== value) : [...curr, value] };
        });
    };
    const applyTempFilter = field => { setFilters(prev => ({ ...prev, [field]: tempFilters[field] })); setOpenDropdown(null); };
    const clearTempFilter = field => { setTempFilters(prev => ({ ...prev, [field]: [] })); };

    // determine visible tasks by role
    const getVisible = list => {
        if (user.role === 'admin') return list;
        if (user.role === 'teamLeader') {
            const me = workers.find(w => w.username === user.username);
            const teamId = me?.team;
            const teamMembers = workers.filter(w => w.team === teamId).map(w => w.username);
            return list.filter(t =>
                Array.isArray(t.assignedTo)
                    ? t.assignedTo.includes(user.username) || t.assignedTo.some(a => teamMembers.includes(a))
                    : t.assignedTo === user.username || teamMembers.includes(t.assignedTo)
            );
        }
        return list.filter(t =>
            Array.isArray(t.assignedTo)
                ? t.assignedTo.includes(user.username)
                : t.assignedTo === user.username
        );
    };

    const pending = getVisible(tasks);
    const completedVisible = getVisible(completedTasks);

    const applyFilters = list => list.filter(task => {
        const name = task.title || `משימה ${task.taskId}`;
        const cli = task.client || `לקוח ${task.clientId}`;
        return (
            (!filters.title.length || filters.title.includes(name)) &&
            (!filters.client.length || filters.client.includes(cli)) &&
            (!filters.assignedTo.length ||
                (Array.isArray(task.assignedTo)
                    ? task.assignedTo.some(a => filters.assignedTo.includes(a))
                    : filters.assignedTo.includes(task.assignedTo))
            )
        );
    });

    const filteredPending = applyFilters(pending);
    const filteredCompleted = applyFilters(completedVisible);
    const showExport = user.role === 'admin' && filteredPending.length > 0;
    const topHas = filteredPending.length > 0;
    const sourceList = topHas ? [...filteredPending, ...filteredCompleted] : filteredCompleted;

    // options for filters
    const getOptions = (list, field) => list
        .map(task => {
            if (field === 'title') return task.title || `משימה ${task.taskId}`;
            if (field === 'client') return task.client || `לקוח ${task.clientId}`;
            return task.assignedTo;
        })
        .flat()
        .filter((val, idx, self) => self.indexOf(val) === idx);

    const titleOpts = getOptions(sourceList, 'title');
    const clientOpts = getOptions(sourceList, 'client');
    const workerOpts = getOptions(sourceList, 'assignedTo');

    // export handler unchanged
    const handleExport = () => {
        const data = applyFilters(tasks);
        if (!data.length) return alert('אין משימות לייצוא');
        const ws = XLSX.utils.json_to_sheet(
            data.map((task, i) => ({
                '#': i + 1,
                'שם משימה': task.title || `משימה ${task.taskId}`,
                'לקוח': task.client || `לקוח ${task.clientId}`,
                'מי מבצע': Array.isArray(task.assignedTo) ? task.assignedTo.join(', ') : task.assignedTo
            }))
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'משימות');
        XLSX.writeFile(wb, 'tasks.xlsx');
    };

    const renderHeader = (label, field) => (
        <th style={{ position: 'relative', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <div onClick={e => handleOpenFilter(field, e)}>
                {label} <span style={{ fontSize: '0.75em' }}>▼</span>
            </div>
        </th>
    );
    const renderPlain = text => <th>{text}</th>;

    // compute hoursDone for a task
    const getHoursDone = taskId =>
        completedTasks.filter(e => e.taskId === taskId)
            .reduce((sum, e) => sum + e.hoursDone, 0);

    return (
        <div className="homepage-background" dir="rtl">
            <div className="homepage-box">
                <h1 className="homepage-title">ברוך הבא, {user.username}</h1>

                <div className={showExport ? 'homepage-header' : 'homepage-header center-only'}>
                    <h3 className="m-0">משימות לביצוע:</h3>
                    {showExport && <button className="btn btn-success" onClick={handleExport}>ייצוא לאקסל</button>}
                </div>

                {openDropdown && (
                    <div className="floating-dropdown" style={{ position: 'absolute', top: openDropdown.position.top, left: openDropdown.position.left, background: 'white', border: '1px solid #ccc', padding: '0.5rem', zIndex: 9999, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', minWidth: '180px' }}>
                        {getOptions(sourceList, openDropdown.field).map((opt, idx) => (
                            <div key={idx} style={{ marginBottom: '0.25rem' }}>
                                <label>
                                    <input type="checkbox" checked={tempFilters[openDropdown.field].includes(opt)} onChange={() => toggleTempFilter(openDropdown.field, opt)} /> {opt}
                                </label>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid #ddd', paddingTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-sm btn-primary" onClick={() => applyTempFilter(openDropdown.field)}>אישור</button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => clearTempFilter(openDropdown.field)}>נקה</button>
                        </div>
                    </div>
                )}

                {(filters.title.length > 0 || filters.client.length > 0 || filters.assignedTo.length > 0) && (
                    <div className="text-end mb-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => setFilters({ title: [], client: [], assignedTo: [] })}>נקה סינונים</button>
                    </div>
                )}

                {filteredPending.length === 0 ? (
                    <>
                        <p className="text-center">אין משימות להצגה</p>
                        {user.role === 'admin' && (
                            <div className="text-center mt-3"><button className="btn btn-primary" onClick={() => setNavigateToAssignment(true)}>סידור משימות</button></div>
                        )}
                    </>
                ) : (
                    <table className="table table-bordered text-center">
                        <thead>
                        <tr>
                            <th>#</th>
                            {renderHeader('שם משימה', 'title')}
                            {renderHeader('לקוח', 'client')}
                            {renderHeader('מי מבצע', 'assignedTo')}
                            <th>התקדמות (שעות)</th>
                            <th>פעולה</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredPending.map((task, idx) => {
                            const hoursDone = getHoursDone(task.taskId);
                            const remaining = task.hoursRequired - hoursDone;
                            const isAdminOrLeader = user.role === 'admin' || user.role === 'teamLeader';
                            const performerOptions = Array.isArray(task.assignedTo) ? task.assignedTo : [task.assignedTo];
                            return (
                                <tr key={task.taskId || idx}>
                                    <td>{idx + 1}</td>
                                    <td>{task.title || `משימה ${task.taskId}`}</td>
                                    <td>{task.client || `לקוח ${task.clientId}`}</td>
                                    <td>{Array.isArray(task.assignedTo) ? task.assignedTo.join(', ') : task.assignedTo}</td>
                                    <td>{`${hoursDone}/${task.hoursRequired}`}</td>
                                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            max={remaining}
                                            placeholder={remaining}
                                            value={partialHours[task.taskId] || ''}
                                            onChange={e => setPartialHours(prev => ({ ...prev, [task.taskId]: e.target.value }))}
                                            style={{ width: '4em' }}
                                        />
                                        {isAdminOrLeader && (
                                            <Select
                                                options={performerOptions.map(u => ({ value: u, label: u }))}
                                                value={selectedPerformer[task.taskId] || null}
                                                onChange={opt => setSelectedPerformer(prev => ({ ...prev, [task.taskId]: opt }))}
                                                placeholder="מבצע..."
                                                className="react-select-container"
                                                classNamePrefix="react-select"
                                                styles={{ container: base => ({ ...base, width: '8em' }) }}
                                            />
                                        )}
                                        <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={() => {
                                                const hours = parseFloat(partialHours[task.taskId]);
                                                if (!hours || hours <= 0 || hours > remaining) {
                                                    alert('הזן ערך תקין');
                                                    return;
                                                }
                                                const performer = isAdminOrLeader
                                                    ? selectedPerformer[task.taskId]?.value
                                                    : user.username;
                                                if (!performer) {
                                                    alert('בחר מבצע');
                                                    return;
                                                }
                                                recordTaskProgress(task.taskId, performer, hours);
                                                setPartialHours(prev => ({ ...prev, [task.taskId]: '' }));
                                                setSelectedPerformer(prev => ({ ...prev, [task.taskId]: null }));
                                            }}
                                        >
                                            שמור
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}

                <h3 className="text-center my-4">משימות שבוצעו:</h3>
                {filteredCompleted.length === 0 ? (
                    <p className="text-center">אין משימות שבוצעו</p>
                ) : (
                    <table className="table table-bordered text-center">
                        <thead>
                        <tr>
                            <th>#</th>
                            {!topHas ? renderHeader('שם משימה', 'title') : renderPlain('שם משימה')}
                            {!topHas ? renderHeader('לקוח', 'client') : renderPlain('לקוח')}
                            {!topHas ? renderHeader('מי ביצע', 'assignedTo') : renderPlain('מי ביצע')}
                            <th>שעות שבוצעו</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredCompleted.map((ev, idx) => (
                            <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>{ev.title || `משימה ${ev.taskId}`}</td>
                                <td>{ev.client || `לקוח ${ev.clientId}`}</td>
                                <td>{ev.performer}</td>
                                <td>{`${ev.hoursDone}/${ev.hoursRequired}`}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
