import React, { useState, useEffect } from 'react';
import './RealTimeUpdate.css';
import Card from './Card';

const RealTimeUpdate = () => {
  const [selectedZone, setSelectedZone] = useState('all');
  const [cardsData, setCardsData] = useState(() => {
    const savedData = localStorage.getItem('cardsData');
    return savedData ? JSON.parse(savedData) : [];
  });
  const [lastUpdate, setLastUpdate] = useState(() => {
    const savedTimestamp = localStorage.getItem('lastUpdate');
    return savedTimestamp ? savedTimestamp : '';
  });

  const initialCardsData = [
    { id: 'Machine_1_Equipment_1', machine: 'Machine_1', equipment: 'Machine_1_Equipment_1', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_1_Equipment_2', machine: 'Machine_1', equipment: 'Machine_1_Equipment_2', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_1_Equipment_3', machine: 'Machine_1', equipment: 'Machine_1_Equipment_3', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_2_Equipment_1', machine: 'Machine_2', equipment: 'Machine_2_Equipment_1', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_2_Equipment_2', machine: 'Machine_2', equipment: 'Machine_2_Equipment_2', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_2_Equipment_3', machine: 'Machine_2', equipment: 'Machine_2_Equipment_3', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_3_Equipment_1', machine: 'Machine_3', equipment: 'Machine_3_Equipment_1', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_3_Equipment_2', machine: 'Machine_3', equipment: 'Machine_3_Equipment_2', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_3_Equipment_3', machine: 'Machine_3', equipment: 'Machine_3_Equipment_3', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_4_Equipment_1', machine: 'Machine_4', equipment: 'Machine_4_Equipment_1', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_4_Equipment_2', machine: 'Machine_4', equipment: 'Machine_4_Equipment_2', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_4_Equipment_3', machine: 'Machine_4', equipment: 'Machine_4_Equipment_3', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_5_Equipment_1', machine: 'Machine_5', equipment: 'Machine_5_Equipment_1', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_5_Equipment_2', machine: 'Machine_5', equipment: 'Machine_5_Equipment_2', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
    { id: 'Machine_5_Equipment_3', machine: 'Machine_5', equipment: 'Machine_5_Equipment_3', status: 0, statusText: '', good_count: 0, cycle_time: 0, performance: 0, oee: 0 },
  ];

  useEffect(() => {
    const fetchKafkaData = () => {
      fetch('https://harveypredictive.work.gd:8081/kafka-data/')
        .then(response => response.json())
        .then(data => {
          console.log('Fetched data:', data);
          if (data.status === 'success') {
            const parsedData = data.data.map(msg => {
              const payload = JSON.parse(msg.value).payload;
              console.log('Parsed payload:', payload);
              return {
                id: payload.equipment, // Using the exact equipment ID from the payload
                machine: payload.machine,
                equipment: payload.equipment,
                operational_status: payload.operational_status,
                vibration: payload.vibration.toFixed(2), // Adjusting to 2 decimal places
                temperature: payload.temperature.toFixed(2), // Adjusting to 2 decimal places
                noise_frequency: payload.noise_frequency.toFixed(2), // Adjusting to 2 decimal places
                good_count: payload.good_count,
                cycle_time: payload.cycle_time.toFixed(2), // Adjusting to 2 decimal places
                performance: payload.performance.toFixed(2), // Adjusting to 2 decimal places
                oee: payload.oee.toFixed(2), // Adjusting to 2 decimal places
                status: payload.label,
                timestamp: payload.timestamp // Adding timestamp
              };
            });

            // Set the last update time to the current time
            const now = new Date().toLocaleString();
            setLastUpdate(now);
            localStorage.setItem('lastUpdate', now);

            // Merge the new data with initialCardsData
            const updatedData = initialCardsData.map(card => {
              const newData = parsedData.find(data => data.id === card.id);
              return newData ? { ...card, ...newData } : card;
            });

            console.log('Updated cards data:', updatedData);
            setCardsData(updatedData);
            localStorage.setItem('cardsData', JSON.stringify(updatedData));
          } else {
            console.error('Failed to fetch data:', data);
          }
        })
        .catch(error => console.error('Error fetching Kafka data:', error));
    };

    if (cardsData.length === 0) {
      fetchKafkaData(); // Initial fetch for Kafka data
    }

    const intervalId = setInterval(fetchKafkaData, 360000); // Fetch every hour

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [cardsData]);

  const zones = ['all', 'Machine_1', 'Machine_2', 'Machine_3', 'Machine_4', 'Machine_5'];

  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
  };

  const filteredCards = selectedZone === 'all' ? cardsData : cardsData.filter(card => card.machine === selectedZone);

  return (
    <div className="real-time-update">
      <div className="filter-container-RTU">
        <h3>Filter by Machine</h3>
        <ul>
          {zones.map((zone, index) => (
            <li key={index}>
              <button 
                onClick={() => handleZoneChange(zone)} 
                className={zone === selectedZone ? 'active' : ''}
              >
                {zone}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="content-container">
        <h2>Hourly real-time operating status</h2>
        <div className="cards-container">
          {filteredCards.map((card) => (
            <Card
              key={card.id}
              status={card.status}
              statusText={card.operational_status}
              text={card.equipment}
              goodCount={card.good_count}
              cycleTime={card.cycle_time}
              performance={card.performance}
              oee={card.oee}
              lastUpdate={lastUpdate} // Pass last update time to Card component
              vibration={card.vibration}
              temperature={card.temperature}
              noise_frequency={card.noise_frequency}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RealTimeUpdate;
