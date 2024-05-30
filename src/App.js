import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import EquipmentCondition from './components/EquipmentCondition/EquipmentCondition';
import EquipmentConditionDetail from './components/EquipmentConditionDetail/EquipmentConditionDetail';
import RealTimeUpdate from './components/RealTimeUpdate/RealTimeUpdate';
import OperatingEnvironment from './components/OperatingEnvironment/OperatingEnvironment';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  const basename = process.env.NODE_ENV === 'development' ? '/' : '/factory-predictive-maintenance-v1';

  return (
    <Router basename={basename}>
      <div className="App">
        <Sidebar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/equipment-condition" element={<EquipmentCondition />} />
            <Route path="/RealTimeUpdate" element={<RealTimeUpdate />} />
            <Route path="/EquipmentConditionDetail" element={<EquipmentConditionDetail />} />
            <Route path="/OperatingEnvironment" element={<OperatingEnvironment />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
