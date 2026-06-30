import { useEffect, useState } from 'react';
import { fetchTasks } from '../services/api';
import type { TodoItem } from '../types';

function TasksPage() {
  const [tasks, setTasks] = useState<TodoItem[]>([]);

  useEffect(() => {
    void fetchTasks().then(setTasks);
  }, []);

  return (
    <section className="card">
      <h2>Tasks</h2>
      <p>Placeholder task list powered by the frontend service layer.</p>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id}>
            <strong>{task.title}</strong>
            <span>{task.done ? 'Completed' : 'Pending'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default TasksPage;
