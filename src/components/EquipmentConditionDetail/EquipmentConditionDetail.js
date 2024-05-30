import React, { useState, useEffect } from 'react';
import './EquipmentConditionDetail.css';

const EquipmentConditionDetail = () => {
  const [data, setData] = useState([]);
  const [equipmentConditions, setEquipmentConditions] = useState({});
  const [filter, setFilter] = useState('');

  const fetchData = () => {
    fetch('https://harveypredictive.work.gd:8080/data/')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data from Postgres:', data);
        if (data && data.data) {
          setData(data.data);
          const conditions = processEquipmentConditions(data.data);
          console.log('Processed conditions:', conditions);
          setEquipmentConditions(conditions);
        }
      })
      .catch(error => console.error('Error fetching data from Postgres:', error));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Fetch data every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const processEquipmentConditions = (data) => {
    const conditions = {};
    for (let i = 1; i <= 5; i++) {
      for (let j = 1; j <= 3; j++) {
        const equipmentData = data.filter(d => d.machine === `Machine_${i}` && d.equipment === `Machine_${i}_Equipment_${j}`);
        const warningCount = equipmentData.filter(d => d.prediction === 1).length;
        const totalCount = equipmentData.length;
        const warningPercentage = (warningCount / totalCount) * 100;

        let status = 'Normal';
        if (warningPercentage > 50) {
          status = 'Critical (replace immediately)';
        } else if (warningPercentage > 30) {
          status = 'Warn off (Replace soon)';
        }

        conditions[`Machine_${i}_Equipment_${j}`] = {
          status,
          recommendation: getReplacementRecommendation(status),
        };
      }
    }
    return conditions;
  };

  const getReplacementRecommendation = (status) => {
    const today = new Date();
    if (status === 'Critical (replace immediately)') {
      const replacementDate = new Date(today.setDate(today.getDate() + 30));
      return `Please replace part by ${replacementDate.toDateString()}`;
    } else if (status === 'Warn off (Replace soon)') {
      const replacementDate = new Date(today.setDate(today.getDate() + 60));
      return `Please replace part by ${replacementDate.toDateString()}`;
    }
    return '';
  };

  const getStatusClass = (status) => {
    if (status === 'Critical (replace immediately)') {
      return 'status-critical';
    } else if (status === 'Warn off (Replace soon)') {
      return 'status-warn-off';
    } else if (status === 'Normal') {
      return 'status-normal';
    }
    return '';
  };

  const handleFilterChange = (status) => {
    setFilter(status);
  };

  const filteredConditions = filter
    ? Object.entries(equipmentConditions).filter(
        ([, condition]) => condition.status === filter
      )
    : Object.entries(equipmentConditions);

  return (
    <div className="container-ECD">
      <div className="filter-bar-ECD">
        <h4>Filter by Status</h4>
        <button className={filter === 'Normal' ? 'selected' : ''} onClick={() => handleFilterChange('Normal')}>
          Normal
        </button>
        <button className={filter === 'Critical (replace immediately)' ? 'selected' : ''} onClick={() => handleFilterChange('Critical (replace immediately)')}>
          Critical
        </button>
        <button className={filter === 'Warn off (Replace soon)' ? 'selected' : ''} onClick={() => handleFilterChange('Warn off (Replace soon)')}>
          Warn off
        </button>
        <button className={filter === '' ? 'selected' : ''} onClick={() => handleFilterChange('')}>
          Show All
        </button>
      </div>
      <div className="equipment-condition-detail">
        <table className="condition-table">
          <thead>
            <tr>
              <th>Machine</th>
              <th>Status</th>
              <th>Replacement Recommendation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredConditions.map(([key, condition]) => {
              const [machine, equipment] = key.split('_');
              return (
                <tr key={key}>
                  <td>{`${machine} ${equipment}`}</td>
                  <td className="status-cell">
                    <span className={`status-button ${getStatusClass(condition.status)}`}>
                      {condition.status}
                    </span>
                  </td>
                  <td>{condition.recommendation}</td>
                  <td>
                    {condition.status !== 'Normal' && (
                      <button className="appoint-technician-button">Appoint Technician</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipmentConditionDetail;
