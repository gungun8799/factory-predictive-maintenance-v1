import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import EquipmentCondition from '../EquipmentCondition/EquipmentCondition';
import StaticMatrix from '../StaticMatrix/StaticMatrix';
import RealTime from '../RealTime/RealTime';
import FactoryLayout from '../FactoryLayout/FactoryLayout';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [equipmentConditions, setEquipmentConditions] = useState([]);
  const [averageValues, setAverageValues] = useState({});
  const [realTimeData, setRealTimeData] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      fetch('https://harveypredictive.work.gd:8080/data/')
        .then(response => response.json())
        .then(data => {
          console.log('Fetched data from Postgres:', data); // Log fetched data from Postgres
          if (data && data.data) {
            setData(data.data);
            const conditions = processEquipmentConditions(data.data);
            console.log('Processed conditions:', conditions); // Log processed conditions
            setEquipmentConditions(conditions);
            const averages = calculateAverages(data.data);
            setAverageValues(averages);
          }
        })
        .catch(error => console.error('Error fetching data from Postgres:', error));
    };

    const fetchKafkaData = () => {
      fetch('https://harveypredictive.work.gd:8081/kafka-data/')
        .then(response => response.json())
        .then(data => {
          console.log('Fetched Kafka data:', data); // Log fetched Kafka data
          if (data && data.data) {
            setRealTimeData(data.data.map(msg => JSON.parse(msg.value)));
          }
        })
        .catch(error => console.error('Error fetching Kafka data:', error));
    };

    fetchData(); // Initial fetch
    fetchKafkaData(); // Initial fetch for Kafka data

    const intervalId = setInterval(() => {
      fetchData();
      fetchKafkaData();
    }, 3600000); // Fetch every 1 hour

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  const processEquipmentConditions = (data) => {
    const machineConditions = {};

    data.forEach(row => {
      const machine = row.machine;
      if (!machineConditions[machine]) {
        machineConditions[machine] = {
          machine,
          status: row.operational_status,
          predictions: [],
          condition: 'Normal'
        };
      }
      machineConditions[machine].predictions.push(row.prediction);
    });

    Object.values(machineConditions).forEach(condition => {
      const oneCount = condition.predictions.filter(prediction => prediction === 1).length;
      if (oneCount > (condition.predictions.length / 6)) {
        condition.condition = 'Attention Required';
      }
    });

    // Select machines from Machine_1 to Machine_5
    const selectedMachines = ['Machine_1', 'Machine_2', 'Machine_3', 'Machine_4', 'Machine_5'];
    return selectedMachines.map(machine => machineConditions[machine] || { machine, status: 'Unknown', condition: 'Unknown' });
  };

  const calculateAverages = (data) => {
    const machineData = {};

    data.forEach(row => {
      const machine = row.machine;
      if (!machineData[machine]) {
        machineData[machine] = { count: 0, vibration: 0, temperature: 0, noise_frequency: 0 };
      }
      machineData[machine].count += 1;
      machineData[machine].vibration += row.vibration;
      machineData[machine].temperature += row.temperature;
      machineData[machine].noise_frequency += row.noise_frequency;
    });

    const averages = {};
    for (const machine in machineData) {
      averages[machine] = {
        vibration: machineData[machine].vibration / machineData[machine].count,
        temperature: machineData[machine].temperature / machineData[machine].count,
        noise_frequency: machineData[machine].noise_frequency / machineData[machine].count,
      };
    }

    return averages;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Main Dashboard</h2>
      </div>
      <div className="dashboard-content">
        <EquipmentCondition data={equipmentConditions} />
        <StaticMatrix data={averageValues} />
        <RealTime data={realTimeData} />
        <FactoryLayout data={data} />
      </div>
    </div>
  );
};

export default Dashboard;
