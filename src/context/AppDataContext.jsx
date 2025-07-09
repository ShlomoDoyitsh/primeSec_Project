import React, { createContext, useContext, useState } from 'react';

export const AppDataContext = createContext();

export function AppDataProvider({ children }) {
    const [workers, setWorkers] = useState([
        { username: 'ran', abilities: ['linux', 'networking', 'pentest'], team: 1, hoursWorked: 12 },
        { username: 'shlomo', abilities: ['pentest'], team: 1, hoursWorked: 9 },
        { username: 'david', abilities: ['linux'], team: 2, hoursWorked: 6 },
        { username: 'michal', abilities: ['networking', 'pentest'], team: 2, hoursWorked: 14 },
        { username: 'liran', abilities: ['linux', 'networking'], team: 2, hoursWorked: 8 },
    ]);

    const [clients, setClients] = useState([
        { id: 101, name: 'חברת ביטוח A', defaultManager: 'ran' },
        { id: 102, name: 'חברת תקשורת B', defaultManager: 'shlomo' },
        { id: 103, name: 'חברת נדל"ן C', defaultManager: 'david' },
        { id: 104, name: 'חברת רכב D', defaultManager: 'michal' },
        { id: 105, name: 'חברת מזון E', defaultManager: 'liran' },
        { id: 106, name: 'חברת בניה F', defaultManager: 'ran' },
        { id: 107, name: 'חברת תחבורה G', defaultManager: 'shlomo' },
        { id: 108, name: 'חברת אינטרנט H', defaultManager: 'david' },
        { id: 109, name: 'חברת ייעוץ I', defaultManager: 'michal' },
        { id: 110, name: 'חברת פרסום J', defaultManager: 'liran' },
        { id: 111, name: 'חברת חינוך K', defaultManager: 'ran' },
        { id: 112, name: 'חברת תרופות L', defaultManager: 'shlomo' },
        { id: 113, name: 'חברת ספורט M', defaultManager: 'david' },
        { id: 114, name: 'חברת לוגיסטיקה N', defaultManager: 'michal' },
        { id: 115, name: 'חברת עיצוב O', defaultManager: 'liran' },
    ]);

    const [tasks, setTasks] = useState([
        { id: 1, name: 'הקשחת שרתים', requires: ['linux', 'networking'], avgHours: 4 },
        { id: 2, name: 'בדיקת חדירות', requires: ['pentest'], avgHours: 6 },
        { id: 3, name: 'בדיקת הרשאות משתמשים', requires: ['linux'], avgHours: 2 },
        { id: 4, name: 'הגדרת VPN', requires: ['networking'], avgHours: 3 },
        { id: 5, name: 'בדיקת firewall', requires: ['networking', 'pentest'], avgHours: 5 },
        { id: 6, name: 'הקשחת תחנות קצה', requires: ['linux'], avgHours: 2 },
        { id: 7, name: 'תחקור אירוע אבטחה', requires: ['pentest'], avgHours: 5 },
        { id: 8, name: 'התקנת אנטי וירוס', requires: ['linux'], avgHours: 1 },
        { id: 9, name: 'הגדרת משתמשים', requires: ['networking'], avgHours: 2 },
        { id: 10, name: 'בדיקת תאימות רגולטורית', requires: ['pentest', 'networking'], avgHours: 4 },
    ]);

    const [teams, setTeams] = useState([
        { id: 1, name: 'צוות 1' },
        { id: 2, name: 'צוות 2' },
    ]);

    const [abilities, setAbilities] = useState(['linux', 'networking', 'pentest']);

    const [userList, setUserList] = useState([
        { username: 'ran', password: '1234', role: 'admin' },
        { username: 'shlomo', password: '5678', role: 'teamLeader' },
        { username: 'david', password: '9999', role: 'teamLeader' },
    ]);

    const login = (username, password) => {
        return userList.find(u => u.username === username && u.password === password) || null;
    };

    function removeAbility(abilityName) {
        setAbilities(prev => prev.filter(a => a !== abilityName));
        setWorkers(prev =>
            prev.map(w => ({
                ...w,
                abilities: w.abilities.filter(a => a !== abilityName)
            }))
        );
    }

    function updateUserRole(username, newRole) {
        setUserList(prev =>
            prev.map(u =>
                u.username === username
                    ? { ...u, role: newRole }
                    : u
            )
        );
    }

    function changeTeamLeader(teamId, newLeaderUsername) {
        // 1. מציאת מנהל צוות ישן (אם קיים)
        const oldLeader = userList.find(u => {
            if (u.role !== 'teamLeader') return false;
            const w = workers.find(w => w.username === u.username);
            return w && w.team === teamId;
        });

        // 2. עדכון userList: הורדה של התפקיד מהישן וקידום לחדש
        setUserList(prev =>
            prev.map(u => {
                if (oldLeader && u.username === oldLeader.username) {
                    return { ...u, role: 'user' };
                }
                if (u.username === newLeaderUsername) {
                    return { ...u, role: 'teamLeader' };
                }
                return u;
            })
        );

        // 3. עדכון workers: שייכות העובד החדש לצוות
        setWorkers(prev =>
            prev.map(w =>
                w.username === newLeaderUsername
                    ? { ...w, team: teamId }
                    : w
            )
        );
    }


    return (
        <AppDataContext.Provider value={{
            workers, setWorkers,
            clients, setClients,
            tasks, setTasks,
            teams, setTeams,
            abilities, setAbilities,
            userList, setUserList,
            login,
            removeAbility,
            updateUserRole,
            changeTeamLeader,
        }}>
            {children}
        </AppDataContext.Provider>
    );
}

export function useAppData() {
    return useContext(AppDataContext);
}
