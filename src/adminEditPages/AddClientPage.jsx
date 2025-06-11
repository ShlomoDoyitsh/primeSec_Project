import React, { Component } from 'react';
import Select from 'react-select';
import { AppDataContext } from '../context/AppDataContext';
import './AdminEditPages.css';

class AddClientPage extends Component {
    static contextType = AppDataContext;

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            defaultManager: ''
        };
    }

    handleChange = (e) => {
        this.setState({ [e.target.name]: e.target.value });
    };

    handleSelectManager = (selectedOption) => {
        this.setState({ defaultManager: selectedOption?.value || '' });
    };

    handleAddClient = () => {
        const { name, defaultManager } = this.state;
        const { clients, setClients, workers } = this.context;

        if (!name || !defaultManager) {
            alert('נא למלא את כל השדות');
            return;
        }

        const nextId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 101;

        const newClient = {
            id: nextId,
            name,
            defaultManager
        };

        setClients([...clients, newClient]);

        alert('לקוח נוסף בהצלחה!');
        this.setState({ name: '', defaultManager: '' });
    };

    render() {
        const { name, defaultManager } = this.state;
        const { workers } = this.context;

        const managerOptions = workers.map(w => ({
            value: w.username,
            label: w.username
        }));

        return (
            <div className="admin-edit-background" dir="rtl">
                <div className="admin-edit-box">
                <h3>הוספת לקוח חדש</h3>

                <div className="mb-3">
                    <label>שם הלקוח:</label>
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={this.handleChange}
                        className="form-control"
                    />
                </div>

                <div className="mb-3">
                    <label>מנהל הלקוח:</label>
                    <Select
                        options={managerOptions}
                        value={managerOptions.find(opt => opt.value === defaultManager) || null}
                        onChange={this.handleSelectManager}
                        placeholder="בחר מנהל..."
                    />
                </div>

                <button className="btn btn-success btn-center" onClick={this.handleAddClient}>
                    הוסף לקוח
                </button>
            </div>
            </div>
        );
    }
}

export default AddClientPage;
