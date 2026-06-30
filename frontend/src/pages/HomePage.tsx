import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <section className="card">
      <h2>Welcome to Smart Todo</h2>
      <p>This placeholder home screen confirms the React + TypeScript scaffold is running.</p>
      <p>Use the navigation to open the tasks view and continue building features.</p>
      <Link className="button-link" to="/tasks">
        View tasks
      </Link>
    </section>
  );
}

export default HomePage;
