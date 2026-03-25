import './App.css';
import MainApp from './app/Home';
import {LoginPage,MainPage,SingupPage} from './pages';
import {Route, Routes} from 'react-router-dom';


function App() {
  return (
    <div className="App">
      
       <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SingupPage />} />
        <Route path="/main/*" element={<MainPage/>} />
      </Routes>
    
    </div>
  );
}

export default App;
