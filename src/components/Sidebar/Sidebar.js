import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EngineeringIcon from '@mui/icons-material/Engineering';
import BuildIcon from '@mui/icons-material/Build';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import logo from '../../assets/images/Thai_Summit_Group_Logo.svg.png';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="sidebar">
      <div className="logo-image-container">
        <img src={logo} alt="logo" className="sidebar-logo" />
      </div>
      <h2 className="sidebar-title">Predictive Maintenance</h2>
      <List>
        <ListItem button component={Link} to="/" className={currentPath === '/' ? 'selected' : ''}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button component={Link} to="/EquipmentConditionDetail" className={currentPath === '/EquipmentConditionDetail' ? 'selected' : ''}>
          <ListItemIcon><EngineeringIcon /></ListItemIcon>
          <ListItemText primary="Equipment Condition Details" />
        </ListItem>
        <ListItem button component={Link} to="/OperatingEnvironment" className={currentPath === '/OperatingEnvironment' ? 'selected' : ''}>
          <ListItemIcon><BuildIcon /></ListItemIcon>
          <ListItemText primary="Machine Condition" />
        </ListItem>
        <ListItem button component={Link} to="/RealTimeUpdate" className={currentPath === '/RealTimeUpdate' ? 'selected' : ''}>
          <ListItemIcon><ListAltIcon /></ListItemIcon>
          <ListItemText primary="Operation Status" />
        </ListItem>

      </List>
    </div>
  );
};

export default Sidebar;
