import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './OperatingEnvironment.module.css';

const OperatingEnvironment = () => {
  const getInitialDisplayModes = () => {
    const savedDisplayModes = localStorage.getItem('displayModes');
    return savedDisplayModes ? JSON.parse(savedDisplayModes) : {
      Machine_1: 'minute',
      Machine_2: 'minute',
      Machine_3: 'minute',
      Machine_4: 'minute',
      Machine_5: 'minute',
    };
  };

  const getInitialStartDate = () => {
    const savedStartDate = localStorage.getItem('startDate');
    return savedStartDate ? new Date(savedStartDate) : moment().subtract(1, 'week').toDate();
  };

  const getInitialEndDate = () => {
    const savedEndDate = localStorage.getItem('endDate');
    return savedEndDate ? new Date(savedEndDate) : new Date();
  };

  const [chartData, setChartData] = useState([]);
  const [displayModes, setDisplayModes] = useState(getInitialDisplayModes);
  const [startDate, setStartDate] = useState(getInitialStartDate);
  const [endDate, setEndDate] = useState(getInitialEndDate);

  useEffect(() => {
    localStorage.setItem('displayModes', JSON.stringify(displayModes));
  }, [displayModes]);

  useEffect(() => {
    localStorage.setItem('startDate', startDate.toISOString());
  }, [startDate]);

  useEffect(() => {
    localStorage.setItem('endDate', endDate.toISOString());
  }, [endDate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://harveypredictive.work.gd:8080/data/');
        const result = await response.json();
        if (result.status === 'success' && Array.isArray(result.data)) {
          console.log('Fetched data:', result.data);
          setChartData(result.data);
        } else {
          console.error('Error: Data fetched is not an array:', result);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const filterDataByMachineAndMode = (machineName, mode) => {
    const filteredData = chartData.filter(entry => 
      entry.machine === machineName && 
      moment(entry.timestamp).isBetween(startDate, endDate, null, '[]')
    );
    console.log(`Filtered data for ${machineName}:`, filteredData);

    let formattedData;
    switch (mode) {
      case 'hour':
        formattedData = aggregateData(filteredData, 'hour');
        break;
      case 'day':
        formattedData = aggregateData(filteredData, 'day');
        break;
      case 'week':
        formattedData = aggregateData(filteredData, 'week');
        break;
      default:
        formattedData = aggregateData(filteredData, 'minute');
        break;
    }

    return formattedData;
  };

  const aggregateData = (data, period) => {
    const aggregatedData = {};

    data.forEach(item => {
      const key = moment(item.timestamp).startOf(period).format();
      if (!aggregatedData[key]) {
        aggregatedData[key] = {
          timestamp: key,
          vibration: 0,
          temperature: 0,
          noise_frequency: 0,
          count: 0
        };
      }
      aggregatedData[key].vibration += item.vibration;
      aggregatedData[key].temperature += item.temperature;
      aggregatedData[key].noise_frequency += item.noise_frequency;
      aggregatedData[key].count += 1;
    });

    return Object.values(aggregatedData).map(item => ({
      ...item,
      vibration: item.vibration / item.count,
      temperature: item.temperature / item.count,
      noise_frequency: item.noise_frequency / item.count,
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  const handleDisplayModeChange = (machineName, mode) => {
    setDisplayModes((prevModes) => ({ ...prevModes, [machineName]: mode }));
  };

  const formatXAxis = (timestamp, mode) => {
    const date = moment(timestamp);
    if (!date.isValid()) return '';

    switch (mode) {
      case 'hour':
        return date.format('HH:mm');
      case 'day':
        return date.format('MMM DD');
      case 'week':
        return date.format('MMM DD');
      default:
        return date.format('HH:mm:ss');
    }
  };

  return (
    <div>
      <h3>Operating Environment by Machine</h3>
      <div>
        <div className={styles.datePickers}>
          <label>
            Start Date:
            <DatePicker 
              selected={startDate} 
              onChange={date => setStartDate(date)} 
              showTimeSelect
              dateFormat="Pp"
            />
          </label>
          <label>
            End Date:
            <DatePicker 
              selected={endDate} 
              onChange={date => setEndDate(date)} 
              showTimeSelect
              dateFormat="Pp"
            />
          </label>
        </div>
        {['Machine_1', 'Machine_2', 'Machine_3', 'Machine_4', 'Machine_5'].map(machine => (
          <div key={machine}>
            <div className={styles.machineButton}>{machine}</div>
            <label className={styles.displayModeLabel}>
              Display Mode: 
              <select
                value={displayModes[machine]}
                onChange={(e) => handleDisplayModeChange(machine, e.target.value)}
              > 
                <option value="minute">Minute</option>
                <option value="hour">Hour</option>
                <option value="day">Day</option>
                <option value="week">Week</option>
              </select>
            </label>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={filterDataByMachineAndMode(machine, displayModes[machine])}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(tick) => formatXAxis(tick, displayModes[machine])}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  domain={[startDate.getTime(), endDate.getTime()]}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#8884d8" />
                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#82ca9d" />
                <Line yAxisId="left" type="monotone" dataKey="noise_frequency" stroke="#ffc658" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperatingEnvironment;
