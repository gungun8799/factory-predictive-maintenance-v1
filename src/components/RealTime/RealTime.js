import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './RealTime.css';
import { Link } from 'react-router-dom';

const RealTime = () => {
  const [realTimeData, setRealTimeData] = useState({});
  const [highlightedFields, setHighlightedFields] = useState({});
  const [averages, setAverages] = useState({ oee: 0, cycle_time: 0, performance: 0 });

  useEffect(() => {
    const fetchKafkaData = () => {
      fetch('https://harveypredictive.work.gd:8081/kafka-data/?limit=10')
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            const parsedData = data.data.map(msg => JSON.parse(msg.value));
            updateRealTimeData(parsedData);
          } else {
            console.error('Failed to fetch data:', data);
          }
        })
        .catch(error => console.error('Error fetching Kafka data:', error));
    };

    fetchKafkaData(); // Initial fetch for Kafka data
    const intervalId = setInterval(fetchKafkaData, 3600000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  const updateRealTimeData = (data) => {
    const newData = {};
    const newHighlightedFields = {};

    data.forEach(item => {
      const machine = item.payload.machine;
      if (!newData[machine] || new Date(item.payload.timestamp) > new Date(newData[machine].timestamp)) {
        newData[machine] = item.payload;
        newHighlightedFields[machine] = true; // Mark as recently updated
      }
    });

    setRealTimeData(newData);
    setHighlightedFields(newHighlightedFields);

    // Calculate averages
    const machineCount = Object.keys(newData).length;
    if (machineCount > 0) {
      const totalOee = Object.values(newData).reduce((sum, item) => sum + item.oee, 0);
      const totalCycleTime = Object.values(newData).reduce((sum, item) => sum + item.cycle_time, 0);
      const totalPerformance = Object.values(newData).reduce((sum, item) => sum + item.performance, 0);

      setAverages({
        oee: (totalOee / machineCount) * 100,
        cycle_time: totalCycleTime / machineCount,
        performance: (totalPerformance / machineCount) * 100
      });
    }

    // Remove highlight after 5 seconds
    setTimeout(() => {
      setHighlightedFields({});
    }, 5000);
  };

  return (
<Link to="/RealTimeUpdate" className="link">
    <div className="real-time-RT">
      <h3>Real-Time Operating Status</h3>
      <table>
        <thead>
          <tr>
            <th>Machine</th>
            <th>Temp</th>
            <th>Good Count</th>
            <th>Cycle Time</th>
            <th>Performance</th>
            <th>OEE</th>
          </tr>
        </thead>
        <tbody>
          {['Machine_1', 'Machine_2', 'Machine_3', 'Machine_4', 'Machine_5'].map(machine => {
            const item = realTimeData[machine];
            if (!item) return null;

            return (
              <tr key={machine}>
                <td>{item.machine}</td>
                <td className={highlightedFields[machine] ? 'highlight' : ''}>{item.temperature.toFixed(2)}°</td>
                <td className={highlightedFields[machine] ? 'highlight' : ''}>{item.good_count}</td>
                <td className={highlightedFields[machine] ? 'highlight' : ''}>{item.cycle_time.toFixed(2)}</td>
                <td className={highlightedFields[machine] ? 'highlight' : ''}>{item.performance.toFixed(2)}%</td>
                <td className={highlightedFields[machine] ? 'highlight' : ''}>{item.oee.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="gauges">
        <div className="gauge">
          <h4>Avg OEE</h4>
          <CircularProgressbar
            value={averages.oee}
            text={`${averages.oee.toFixed(2)}%`}
            styles={buildStyles({
              textColor: 'black',
              pathColor: 'green',
              trailColor: '#f2f2f2'
            })}
          />
        </div>
        <div className="gauge">
          <h4>Avg Cycle Time</h4>
          <CircularProgressbar
            value={averages.cycle_time}
            text={`${averages.cycle_time.toFixed(2)}`}
            styles={buildStyles({
              textColor: 'black',
              pathColor: 'blue',
              trailColor: '#f2f2f2'
            })}
          />
        </div>
        <div className="gauge">
          <h4>Avg Performance</h4>
          <CircularProgressbar
            value={averages.performance}
            text={`${averages.performance.toFixed(2)}%`}
            styles={buildStyles({
              textColor: 'black',
              pathColor: 'orange',
              trailColor: '#f2f2f2'
            })}
          />
        </div>
      </div>
    </div>
    </Link>
  );

};

export default RealTime;
