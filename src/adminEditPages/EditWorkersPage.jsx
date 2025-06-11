import React, { Component } from 'react';
import Select from 'react-select';
import { AppDataContext } from '../context/AppDataContext';
import Card from '../components/Card';
import './AdminEditPages.css'

class EditWorkersPage extends Component {
    static contextType = AppDataContext;

    constructor(props) {
        super(props);
        this.state = {
            selectedWorker: null,
            selectedAbilities: [],
            selectedTeam: null,
            managedClientIds: [],
            availableClientIds: [],
            clientModal: null,
            modalValue: null,
        };
    }

    handleWorkerChange = (selectedOption) => {
        const { workers, clients } = this.context;
        const worker = workers.find(w => w.username === selectedOption.value);
        const managed = clients
            .filter(c => c.defaultManager === worker.username)
            .map(c => c.id);
        const available = clients
            .filter(c => !managed.includes(c.id))
            .map(c => c.id);
        this.setState({
            selectedWorker: selectedOption,
            selectedAbilities: worker?.abilities || [],
            selectedTeam: worker?.team || null,
            managedClientIds: managed,
            availableClientIds: available,
            clientModal: null,
            modalValue: null,
        });
    };

    handleAbilitiesChange = (opts) => {
        this.setState({ selectedAbilities: opts.map(o => o.value) });
    };

    handleTeamChange = (opt) => {
        this.setState({ selectedTeam: opt?.value || null });
    };

    openAddClient = () => {
        this.setState({ clientModal: 'add', modalValue: null });
    };

    openReassignClient = (clientId) => {
        this.setState({ clientModal: clientId, modalValue: null });
    };

    closeModal = () => {
        this.setState({ clientModal: null, modalValue: null });
    };

    handleModalChange = (opt) => {
        this.setState({ modalValue: opt });
    };

    handleModalConfirm = () => {
        const {
            clientModal,
            modalValue,
            selectedWorker,
            managedClientIds,
            availableClientIds,
        } = this.state;
        const { clients, setClients } = this.context;
        if (!modalValue) {
            alert('בחר פריט לפני אישור');
            return;
        }

        if (clientModal === 'add') {
            const clientId = modalValue.value;
            setClients(
                clients.map(c =>
                    c.id === clientId
                        ? { ...c, defaultManager: selectedWorker.value }
                        : c
                )
            );
            this.setState(prev => ({
                managedClientIds: [...prev.managedClientIds, clientId],
                availableClientIds: prev.availableClientIds.filter(id => id !== clientId),
                clientModal: null,
                modalValue: null,
            }));
        } else {
            const clientId = clientModal;
            const newManager = modalValue.value;
            setClients(
                clients.map(c =>
                    c.id === clientId
                        ? { ...c, defaultManager: newManager }
                        : c
                )
            );
            this.setState(prev => ({
                managedClientIds: prev.managedClientIds.filter(id => id !== clientId),
                availableClientIds: [...prev.availableClientIds, clientId],
                clientModal: null,
                modalValue: null,
            }));
        }
    };

    handleSave = () => {
        const { selectedWorker, selectedAbilities, selectedTeam } = this.state;
        const { workers, setWorkers } = this.context;

        setWorkers(
            workers.map(w =>
                w.username === selectedWorker.value
                    ? { ...w, abilities: selectedAbilities, team: selectedTeam }
                    : w
            )
        );

        alert('השינויים נשמרו בהצלחה!');

        this.setState({
            selectedWorker: null,
            selectedAbilities: [],
            selectedTeam: null,
            managedClientIds: [],
            availableClientIds: [],
            clientModal: null,
            modalValue: null,
        });
    };

    handleDeleteWorker = () => {
        const { selectedWorker, managedClientIds } = this.state;
        const {
            workers,
            setWorkers,
            clients,
            setClients,
            userList,
            setUserList,
            tasks,
            setTasks,
        } = this.context;
        const username = selectedWorker.value;

        const workerInfo = userList.find(u => u.username === username) || {};
        const isTeamLeader = workerInfo.role === 'teamLeader';
        const hasClients = managedClientIds.length > 0;
        const msgs = [];
        if (hasClients) msgs.push('יש להעביר את כל הלקוחות שלו לעובדים אחרים קודם');
        if (isTeamLeader) msgs.push('יש לבחור ראש צוות חדש עבור הצוות הזה קודם');
        if (msgs.length) {
            alert(msgs.join("\n"));
            return;
        }

        if (!window.confirm(`האם למחוק את העובד "${username}" מכל המערכת?`)) return;

        setWorkers(workers.filter(w => w.username !== username));
        setClients(
            clients.map(c =>
                c.defaultManager === username ? { ...c, defaultManager: '' } : c
            )
        );
        setUserList(userList.filter(u => u.username !== username));
        setTasks(tasks.filter(t => t.assignedTo !== username));

        alert('העובד נמחק מכל המערכת');
        this.setState({
            selectedWorker: null,
            selectedAbilities: [],
            selectedTeam: null,
            managedClientIds: [],
            availableClientIds: [],
            clientModal: null,
            modalValue: null,
        });
    };

    render() {
        const { workers, abilities, teams, clients } = this.context;
        const {
            selectedWorker,
            selectedAbilities,
            selectedTeam,
            managedClientIds,
            availableClientIds,
            clientModal,
            modalValue,
        } = this.state;

        const workerOpts = workers.map(w => ({ value: w.username, label: w.username }));
        const abilityOpts = abilities.map(a => ({ value: a, label: a }));
        const teamOpts = teams.map(t => ({ value: t.id, label: t.name }));
        const clientOpts = clients.map(c => ({ value: c.id, label: c.name }));

        const modalClient =
            clientModal && clientModal !== 'add'
                ? clients.find(c => c.id === clientModal)
                : null;

        return (
            <div className="admin-edit-background" dir="rtl">
                <div className="admin-edit-box">
                <h3>עריכת עובד</h3>
                <Select
                    options={workerOpts}
                    value={selectedWorker}
                    onChange={this.handleWorkerChange}
                    placeholder="בחר עובד..."
                    className="mb-3"
                />
                {selectedWorker && (
                    <>
                        <Select
                            options={abilityOpts}
                            isMulti
                            value={abilityOpts.filter(opt => selectedAbilities.includes(opt.value))}
                            onChange={this.handleAbilitiesChange}
                            placeholder="בחר יכולות..."
                            className="mb-3"
                        />
                        {(() => {
                            const { userList } = this.context;
                            const isHead = userList.some(
                                u => u.username === selectedWorker.value && u.role === 'teamLeader'
                            );
                            const currentTeam = teams.find(t => t.id === selectedTeam);
                            return (
                                <div className="mb-3">
                                    <label>צוות נוכחי:</label>
                                    {isHead ? (
                                        <>
                                            <Select
                                                options={
                                                    currentTeam
                                                        ? [
                                                            { value: currentTeam.id, label: currentTeam.name + ' (מנהל צוות)' }
                                                        ]
                                                        : []
                                                }
                                                value={
                                                    currentTeam
                                                        ? { value: currentTeam.id, label: currentTeam.name + ' (מנהל צוות)' }
                                                        : null
                                                }
                                                isDisabled
                                            />
                                            <p style={{ color: 'red' }}>
                                                על מנת לשנות צוות, יש לבחור ראש צוות חדש עבור צוות זה קודם
                                            </p>
                                        </>
                                    ) : (
                                        <Select
                                            options={teamOpts}
                                            value={teamOpts.find(opt => opt.value === selectedTeam) || null}
                                            onChange={this.handleTeamChange}
                                            placeholder="בחר צוות..."
                                            className="mb-3"
                                        />
                                    )}
                                </div>
                            );
                        })()}
                        <h5>לקוחות מנוהלים:</h5>
                        {managedClientIds.map(id => {
                            const c = clients.find(cli => cli.id === id);
                            return (
                                <div key={id} className="d-flex justify-content-between mb-2">
                                    <span>{c.name}</span>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => this.openReassignClient(id)}
                                    >
                                        החלף מנהל
                                    </button>
                                </div>
                            );
                        })}
                        <button
                            className="btn btn-sm btn-outline-success mb-3"
                            onClick={this.openAddClient}
                        >
                            הוסף לקוח לניהול
                        </button>

                        <div className="d-flex justify-content-between">
                            <button className="btn btn-danger" onClick={this.handleDeleteWorker}>
                                מחק עובד
                            </button>
                            <button className="btn btn-primary" onClick={this.handleSave}>
                                שמור שינויים
                            </button>
                        </div>

                        {clientModal && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    background: 'rgba(0,0,0,0.5)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Card width="400px" color="#fff">
                                    {clientModal === 'add' ? (
                                        <>
                                            <h5>הוספת לקוח מנוהל</h5>
                                            <Select
                                                options={clientOpts.filter(opt => availableClientIds.includes(opt.value))}
                                                value={modalValue}
                                                onChange={this.handleModalChange}
                                                placeholder="בחר לקוח..."
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <h5>החלפת מנהל עבור {modalClient.name}</h5>
                                            <Select
                                                options={workerOpts}
                                                value={modalValue}
                                                onChange={this.handleModalChange}
                                                placeholder="בחר מנהל חדש..."
                                            />
                                        </>
                                    )}
                                    <div className="mt-3 d-flex justify-content-end">
                                        <button
                                            className="btn btn-sm btn-secondary me-2"
                                            onClick={this.closeModal}
                                        >
                                            בטל
                                        </button>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={this.handleModalConfirm}
                                        >
                                            אישור
                                        </button>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </>
                )}
            </div>
            </div>
        );
    }
}

export default EditWorkersPage;
