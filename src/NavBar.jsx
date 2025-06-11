import React from 'react';
import { NavLink } from 'react-router-dom';
import { UserContext } from './context/UserContext.jsx';
import './NavBar.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

class NavBar extends React.Component {
    static contextType = UserContext;

    state = {
        profileImage: "https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg",
    };

    handleLogout = () => {
        if (this.context.setUser) {
            this.context.setUser(null);
        }
        window.location.href = '/';
    };

    render() {
        const { user } = this.context;

        return (
            <>
                <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
                    <div className="container-fluid">
                        <img
                            src="https://images.cdn-files-a.com/uploads/909407/400_5e876acdaa8d2.png"
                            alt="Logo"
                            style={{ width: '141px', height: '40px', marginRight: '10px' }}
                        />

                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                            <span className="navbar-toggler-icon"></span>
                        </button>

                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav ms-auto">
                                {user && user.role === 'admin' && (
                                    <>
                                        <li className="nav-item">
                                            <NavLink className="nav-link d-flex align-items-center" to="/admin-edit">
                                                עריכת פרטים
                                            </NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink className="nav-link d-flex align-items-center" to="/task-assignment">
                                                סידור משימות
                                            </NavLink>
                                        </li>
                                    </>
                                )}

                                {user && user.role === 'teamLeader' && (
                                    <li className="nav-item">
                                        <NavLink className="nav-link d-flex align-items-center" to="/My-Team-Page">
                                            הצוות שלי
                                        </NavLink>
                                    </li>
                                )}

                                <li className="nav-item">
                                    <NavLink className="nav-link d-flex align-items-center" to="/home">
                                        בית
                                    </NavLink>
                                </li>

                                {/* תפריט פרופיל נפתח */}
                                <li className="nav-item dropdown">
                                    <button
                                        className="btn nav-link dropdown-toggle d-flex align-items-center"
                                        id="profileDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        style={{ border: 'none', background: 'transparent' }}
                                    >
                                        <img
                                            src={this.state.profileImage}
                                            alt="Profile"
                                            width="40"
                                            height="40"
                                            className="rounded-circle"
                                        />
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                                        <li>
                                            <NavLink className="dropdown-item rtl" to="/Personal-Details-Page">
                                                אזור אישי
                                            </NavLink>
                                        </li>
                                        <li>
                                            <button
                                                className="dropdown-item text-danger rtl"
                                                data-bs-toggle="modal"
                                                data-bs-target="#logoutModal"
                                            >
                                                התנתקות
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                {/* חלון אישור התנתקות */}
                <div className="modal fade" id="logoutModal" tabIndex="-1" aria-labelledby="logoutModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" dir="rtl">

                            {/* כותרת עם טקסט מצד ימין ואיקס מצד שמאל */}
                            <div className="modal-header d-flex justify-content-between">
                                <h5 className="modal-title" id="logoutModalLabel">אישור התנתקות</h5>
                               
                            </div>

                            {/* תוכן מיושר לימין */}
                            <div className="modal-body text-end">
                                האם אתה בטוח שברצונך להתנתק?
                            </div>

                            {/* שני כפתורים: התנתקות בימין, ביטול בשמאל */}
                            <div className="modal-footer d-flex justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    data-bs-dismiss="modal"
                                >
                                    ביטול
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={this.handleLogout}
                                >
                                    התנתק
                                </button>
                            </div>

                        </div>
                    </div>
                </div>


            </>
        );
    }
}

export default NavBar;
