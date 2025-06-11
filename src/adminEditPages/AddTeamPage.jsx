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

        this.setState((prevState) => ({
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

    handleRemoveMemberField = (index) => {
        this.setState((prevState) => ({
            memberSelections: prevState.memberSelections.filter((_, i) => i !== index),
        }));
    };

    handleTeamLeaderChange = (selected) => {
        const selectedUsername = selected?.value;
        const filteredMembers = this.state.memberSelections.filter(
            (ms) => ms.selectedWorker?.value !== selectedUsername
        );
        this.setState({
            teamLeader: selected,
            memberSelections:
                filteredMembers.length > 0
                    ? filteredMembers
                    : [{ id: 1, selectedWorker: null }],
        });
    };

    handleCreateTeam = () => {
        const {
            workers,
            setWorkers,
            teams,
            setTeams,
            userList,
            setUserList,
        } = this.context;
        const { teamLeader, memberSelections } = this.state;

        if (!teamLeader) {
            alert('יש לבחור ראש צוות');
            return;
        }

        const newTeamId = Math.max(...teams.map((t) => t.id), 0) + 1;
        setTeams([...teams, { id: newTeamId, name: `צוות ${newTeamId}` }]);

        const selectedUsernames = [
            teamLeader.value,
            ...memberSelections
                .map((ms) => ms.selectedWorker?.value)
                .filter(Boolean),
        ];

        const updatedWorkers = workers.map((w) =>
            selectedUsernames.includes(w.username)
                ? { ...w, team: newTeamId }
                : w
        );
        setWorkers(updatedWorkers);

        const updatedUserList = userList.map((u) =>
            u.username === teamLeader.value ? { ...u, role: 'teamLeader' } : u
        );
        setUserList(updatedUserList);

        alert(`צוות חדש נוצר בהצלחה (ID: ${newTeamId})`);

        this.setState({
            teamLeader: null,
            memberSelections: [{ id: 1, selectedWorker: null }],
        });
    };

    getAvailableWorkerOptions = (excludeList = [], blockTeamLeaders = false) => {
        const { workers, userList } = this.context;

        const teamLeaders = new Set(
            userList
                .filter(
                    (u) => u.role === 'teamLeader' || u.role === 'admin'
                )
                .map((u) => u.username)
        );

        return workers
            .filter(
                (w) =>
                    !excludeList.includes(w.username) &&
                    (!blockTeamLeaders || !teamLeaders.has(w.username))
            )
            .map((w) => ({
                value: w.username,
                label: `${w.username} (צוות ${w.team})`,
            }));
    };

    render() {
        const { workers, userList } = this.context;
        const { teamLeader, memberSelections } = this.state;

        // בודק אם יש להציג X למחיקה: רק אם מעל שדה אחד
        const canRemove = memberSelections.length > 1;

        const teamLeaderOptions = this.getAvailableWorkerOptions(
            [],
            true // חוסם teamLeader ו-admin
        );

        return (
            <div className="admin-edit-background">
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
                            const excludedUsernames = [
                                teamLeader?.value,
                                ...memberSelections
                                    .filter((_, i) => i !== index)
                                    .map((ms) => ms.selectedWorker?.value),
                            ].filter(Boolean);

                            const availableOptions = this.getAvailableWorkerOptions(
                                excludedUsernames,
                                true // חוסם teamLeader ו-admin
                            );

                            return (
                                <div
                                    key={field.id}
                                    className="d-flex mb-2 align-items-center gap-2"
                                >
                                    <Select
                                        options={availableOptions}
                                        value={field.selectedWorker}
                                        onChange={(selected) =>
                                            this.handleMemberChange(index, selected)
                                        }
                                        placeholder="בחר עובד..."
                                        className="flex-grow-1"
                                    />
                                    {/* כפתור הסרה יופיע רק אם יש יותר משדה אחד */}
                                    {canRemove && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() => this.handleRemoveMemberField(index)}
                                        >
                                            ✖
                                        </button>
                                    )}
                                    {/* כפתור הוספה רק בשדה האחרון ובאם נבחר עובד */}
                                    {index === memberSelections.length - 1 &&
                                        field.selectedWorker && (
                                            <button
                                                type="button"
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
