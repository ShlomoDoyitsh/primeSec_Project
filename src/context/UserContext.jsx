import React, { createContext, useContext, useState } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);

    // מוסיף משימה חדשה (הקצאה)
    const addTask = newTask => {
        setTasks(prev => [...prev, newTask]);
    };

    // מסמן משימה שהסתיימה במלואה
    const markTaskCompleted = task => {
        setCompletedTasks(prev => [...prev, task]);
        setTasks(prev => prev.filter(t => t !== task));
    };

    // רישום התקדמות חלקית במשימה
    const recordTaskProgress = (taskId, performer, hoursDone) => {
        // מוצאים את המשימה כדי לקרוא להיקף השעות
        const task = tasks.find(t => t.taskId === taskId);
        const hoursRequired = task?.hoursRequired || 0;

        // שומרים את החלק שנעשה
        setCompletedTasks(prev => [
            ...prev,
            {
                ...task,
                taskId,
                title: task.title,
                client: task.client,
                clientId: task.clientId,
                performer,
                hoursDone,
                hoursRequired
            }
        ]);

        // מחשבים את סך השעות שנעשו עד כה (כולל זה שנרשם כרגע)
        const totalDone = completedTasks
                .filter(e => e.taskId === taskId)
                .reduce((sum, e) => sum + e.hoursDone, 0)
            + hoursDone;

        // אם כבר הגיע ל־hoursRequired, מסירים אותה מטבלת המשימות לביצוע
        if (totalDone >= hoursRequired) {
            setTasks(prev => prev.filter(t => t.taskId !== taskId));
        }
    };

    return (
        <UserContext.Provider value={{
            user,
            setUser,
            tasks,
            addTask,
            completedTasks,
            markTaskCompleted,
            recordTaskProgress
        }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}
