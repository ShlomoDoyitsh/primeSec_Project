import React, { Component } from 'react';
import Select from 'react-select';
import { AppDataContext } from '../context/AppDataContext';
import './AdminEditPages.css'

class AddWorkerPage extends Component {
    static contextType = AppDataContext;

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            fullName: '',
            selectedAbilities: [],
            selectedTeamId: '',
        };
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleAbilityChange = (selectedOptions) => {
        this.setState({ selectedAbilities: selectedOptions || [] });
    };

    handleAddWorker = () => {
        const { username, password, fullName, selectedAbilities, selectedTeamId } = this.state;
        const { workers, setWorkers, userList, setUserList } = this.context;

        if (!username || !password || !fullName || selectedAbilities.length === 0 || !selectedTeamId) {
            alert('אנא מלא את כל השדות');
            return;
        }

        if (workers.find(w => w.username === username)) {
            alert('שם המשתמש כבר קיים');
            return;
        }

        const newWorker = {
            username,
            abilities: selectedAbilities.map(opt => opt.value),
            team: parseInt(selectedTeamId),
            hoursWorked: 0,
        };

        const newUser = {
            username,
            password,
            role: 'user'
        };

        setWorkers([...workers, newWorker]);
        setUserList([...userList, newUser]);

        alert('העובד נוסף בהצלחה!');

        this.setState({
            username: '',
            password: '',
            fullName: '',
            selectedAbilities: [],
            selectedTeamId: ''
        });
    };

    render() {
        const { username, password, fullName, selectedAbilities, selectedTeamId } = this.state;
        const { abilities, teams } = this.context;

        const abilityOptions = abilities.map(a => ({ value: a, label: a }));
        const teamOptions = teams.map(t => ({ value: t.id, label: t.name }));

        return (
            <div className="admin-edit-background">
                <div className="admin-edit-box">
                <h3>הוספת עובד חדש</h3>

                <div className="mb-3">
                    <label>שם משתמש:</label>
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={this.handleChange}
                        className="form-control"
                    />
                </div>

                <div className="mb-3">
                    <label>סיסמא:</label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={this.handleChange}
                        className="form-control"
                    />
                </div>

                <div className="mb-3">
                    <label>שם העובד:</label>
                    <input
                        type="text"
                        name="fullName"
                        value={fullName}
                        onChange={this.handleChange}
                        className="form-control"
                    />
                </div>

                <div className="mb-3">
                    <label>יכולות:</label>
                    <Select
                        isMulti
                        options={abilityOptions}
                        value={selectedAbilities}
                        onChange={this.handleAbilityChange}
                        placeholder="בחר יכולות..."
                        className="basic-multi-select"
                        classNamePrefix="select"
                    />
                </div>

                <div className="mb-3">
                    <label>צוות:</label>
                    <Select
                        options={teamOptions}
                        value={teamOptions.find(t => t.value === parseInt(selectedTeamId)) || null}
                        onChange={(selected) =>
                            this.setState({ selectedTeamId: selected?.value || '' })
                        }
                        placeholder="בחר צוות..."
                    />
                </div>

                <button className="btn btn-success btn-center" onClick={this.handleAddWorker}>
                    הוסף עובד
                </button>
            </div>
            </div>
        );
    }
}

export default AddWorkerPage;
