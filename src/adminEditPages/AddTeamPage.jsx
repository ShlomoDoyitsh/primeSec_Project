import React, { Component } from 'react';
import Select from 'react-select';
import { AppDataContext } from '../context/AppDataContext';
import './AdminEditPages.css'

class AddTeamPage extends Component {
    static contextType = AppDataContext;

    constructor(props) {
        super(props);
        this.state = {
            teamLeader: null,
            memberSelections: [{ id: 1, selectedWorker: null }],
        };
    }

    handleAddMemberField = () => {
        const last = this.state.memberSelections.at(-1);
        if (!last || !last.selectedWorker) return;

        this.setState(prevState => ({
            memberSelections: [
                ...prevState.memberSelections,
                { id: prevState.memberSelections.length + 1, selectedWorker: null },
            ],
        }));
    };

    handleMemberChange = (index, selectedOption) => {
        const updated = [...this.state.memberSelections];
        updated[index].selectedWorker = selectedOption;
        this.setState({ memberSelections: updated });
    };

    handleRemoveMemberField = index => {
        this.setState(prevState => ({
            memberSelections: prevState.memberSelections.filter((_, i) => i !== index),
        }));
    };

    handleTeamLeaderChange = selected => {
        const selectedUsername = selected?.value;
        const filtered = this.state.memberSelections.filter(
            ms => ms.selectedWorker?.value !== selectedUsername
        );
        this.setState({
            teamLeader: selected,
            memberSelections: filtered.length > 0
                ? filtered
                : [{ id: 1, selectedWorker: null }],
        });
    };

    handleCreateTeam = () => {
        const { workers, setWorkers, teams, setTeams, updateUserRole } = this.context;
        const { teamLeader, memberSelections } = this.state;

        if (!teamLeader) {
            alert('יש לבחור ראש צוות');
            return;
        }

        const newTeamId = Math.max(...teams.map(t => t.id), 0) + 1;
        setTeams([...teams, { id: newTeamId, name: `צוות ${newTeamId}` }]);

        const selectedUsers = [
            teamLeader.value,
            ...memberSelections
                .map(ms => ms.selectedWorker?.value)
                .filter(Boolean),
        ];

        setWorkers(
            workers.map(w =>
                selectedUsers.includes(w.username)
                    ? { ...w, team: newTeamId }
                    : w
            )
        );

        // עדכון הרשאה של ראש צוות
        updateUserRole(teamLeader.value, 'teamLeader');

        alert(`צוות חדש נוצר בהצלחה (ID: ${newTeamId})`);
        this.setState({ teamLeader: null, memberSelections: [{ id: 1, selectedWorker: null }] });
    };

    getAvailableWorkerOptions = (excludeList = []) => {
        const { workers, userList } = this.context;
        const leaders = new Set(
            userList.filter(u => u.role === 'teamLeader').map(u => u.username)
        );

        return workers
            .map(w => {
                const isLeader = leaders.has(w.username);
                const note = isLeader ? ` (מנהל צוות מספר ${w.team})` : '';
                return {
                    value: w.username,
                    label: `${w.username}${note}`,
                    isDisabled: isLeader,
                };
            })
            .filter(opt => !excludeList.includes(opt.value));
    };

    render() {
        const { teamLeader, memberSelections } = this.state;
        const canRemove = memberSelections.length > 1;

        const teamLeaderOptions = this.getAvailableWorkerOptions();

        return (
            <div className="admin-edit-background" dir="rtl">
                <div className="admin-edit-box">
                    <h3>יצירת צוות חדש</h3>

                    <div className="mb-3">
                        <label>בחר ראש צוות:</label>
                        <Select
                            options={teamLeaderOptions}
                            value={teamLeader}
                            onChange={this.handleTeamLeaderChange}
                            placeholder="בחר ראש צוות..."
                        />
                    </div>

                    <div className="mb-3">
                        <label>בחר חברי צוות:</label>
                        {memberSelections.map((field, index) => {
                            const excluded = [
                                teamLeader?.value,
                                ...memberSelections
                                    .filter((_, i) => i !== index)
                                    .map(ms => ms.selectedWorker?.value),
                            ].filter(Boolean);

                            const options = this.getAvailableWorkerOptions(excluded);

                            return (
                                <div key={field.id} className="d-flex mb-2 align-items-center gap-2">
                                    <Select
                                        options={options}
                                        value={field.selectedWorker}
                                        onChange={sel => this.handleMemberChange(index, sel)}
                                        placeholder="בחר עובד..."
                                        className="flex-grow-1"
                                    />
                                    {canRemove && (
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => this.handleRemoveMemberField(index)}
                                        >
                                            ✖
                                        </button>
                                    )}
                                    {index === memberSelections.length - 1 && field.selectedWorker && (
                                        <button
                                            className="btn btn-outline-success"
                                            onClick={this.handleAddMemberField}
                                        >
                                            +
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <button className="btn btn-success btn-center" onClick={this.handleCreateTeam}>
                        צור צוות חדש
                    </button>
                </div>
            </div>
        );
    }
}

export default AddTeamPage;
