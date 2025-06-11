import React, { Component } from 'react';
import AddWorkerPage from "../adminEditPages/AddWorkerPage.jsx";
import { UserContext } from '../context/UserContext'; // או הנתיב הרלוונטי
import AddClientPage from "../adminEditPages/AddClientPage.jsx";
import AddTeamPage from "../adminEditPages/AddTeamPage.jsx";
import EditWorkersPage from "../adminEditPages/EditWorkersPage.jsx";
import AbilityEditPage from "../adminEditPages/AbilityEditPage.jsx";
import TaskCreationPage from "../adminEditPages/TaskCreationPage.jsx";
import EditClientsPage from "../adminEditPages/EditClientsPage.jsx";
import EditTasksPage from "../adminEditPages/EditTasksPage.jsx";
import EditTeamsPage from "../adminEditPages/EditTeamsPage.jsx";
import './AdminEditPage.css';



class AdminEditPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedOption: null,
            options: [
                { value: 'addUser', label: 'הוספת עובד חדש' },
                { value: 'addClient', label: 'הוספת לקוח חדש' },
                { value: 'createNewTeam', label: 'יצירת צוות חדש' },
                { value: 'createNewTask', label: 'יצירת משימה חדשה' },
                { value: 'createAbilities', label: 'עריכת יכולות' },
                { value: 'editWorkers', label: 'עריכת עובדים' },
                { value: 'editClients', label: 'עריכת לקוחות קיימים' },
                { value: 'editTeams', label: 'עריכת צוותים' },
                { value: 'editTasks', label: 'עריכת משימות' },
            ],
        };
    }

    renderSelectedSection() {
        const { selectedOption } = this.state;
        switch (selectedOption?.value) {
            case 'addUser':
                return <div>
                    <AddWorkerPage/>
                </div>;
            case 'addClient':
                return <div>
                    <AddClientPage/>
                </div>;
            case 'createAbilities':
                return <div>
                    <AbilityEditPage/>
                </div>;
            case 'createNewTeam':
                return <div>
                    <AddTeamPage/>
                </div>;
            case 'createNewTask':
                return <div>
                    <TaskCreationPage/>
                </div>;
            case 'editWorkers':
                return <div>
                    <EditWorkersPage/>.
                </div>;
            case 'editClients':
                return <div>
                    <EditClientsPage/>
                </div>;
            case 'editTeams':
                return <div>
                    <EditTeamsPage/>
                </div>;
            case 'editTasks':
                return <div>
                    <EditTasksPage/>
                </div>;
            default:
                return (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <div className="admin-edit-background" />
                    </div>
                );


        }
    }

    render() {
        const { selectedOption, options } = this.state;

        return (
            <div style={{ display: 'flex', direction: 'rtl', height: '100vh' }}>
                {/* Sidebar */}
                <div style={{
                    width: '220px',
                    background: '#f8f9fa',
                    borderLeft: '1px solid #ddd',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                }}>
                    <h5 style={{ marginBottom: '1rem' }}>ניהול מערכת</h5>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            className={`btn ${selectedOption?.value === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => this.setState({ selectedOption: option })}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* תוכן */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                    {this.renderSelectedSection()}
                </div>
            </div>
        );
    }
}

export default AdminEditPage;
