import logo from './logo.svg';
import { useSelector } from 'react-redux';
import './App.css';

const App = () => {
  const { user, loading, error } = useSelector(state => state.auth);
  return (
    <div className="App">
      <div>
        { user ? "Logged in " : "Not logged in" }
      </div>
    </div>
  );
}

export default App;
