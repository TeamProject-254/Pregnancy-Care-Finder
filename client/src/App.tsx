import './App.scss';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';

export const App = () => (
  <div className="App">
    <Routes>
      <Route path="/" element={<MainLayout />}></Route>
    </Routes>
  </div>
);