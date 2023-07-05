
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './pages/Spotify/Login';
import Dashboard from './pages/Spotify/Dashboard';
const code=new URLSearchParams(window.location.search).get('code');

function App() {
  return (code ? <Dashboard code={code} /> : <Login />)
}

export default App;
