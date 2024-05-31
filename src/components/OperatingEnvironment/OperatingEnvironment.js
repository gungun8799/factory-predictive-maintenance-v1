import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
} from 'recharts';
import styles from './OperatingEnvironment.module.css'; // Import CSS module
import { format, subMinutes, subHours, subDays, subWeeks, subMonths, isValid } from 'date-fns';

const formatData = (data, displayOption) => {
  const now = new Date();
  switch (displayOption) {
    case 'minute':
      return data.filter((entry) => new Date(entry.timestamp) >= subMinutes(now, 60));
    case 'hourly':
      return data.filter((entry) => new Date(entry.timestamp) >= subHours(now, 24));
    case 'daily':
      return data.filter((entry) => new Date(entry.timestamp) >= subDays(now, 7));
    case 'weekly':
      return data.filter((entry) => new Date(entry.timestamp) >= subWeeks(now, 4));
    case 'monthly':
      return data.filter((entry) => new Date(entry.timestamp) >= subMonths(now, 12));
    default:
      return data;
  }
};

const MachineChart = ({ machineName, data, filters, onFilterChange, displayOption, onDisplayOptionChange }) => {
  const filterData = () => {
    const { startDate, endDate } = filters;
    let filteredData = data.filter((entry) => {
      const entryTime = new Date(entry.timestamp).getTime();
      const startTime = startDate ? new Date(startDate).getTime() : null;
      const endTime = endDate ? new Date(endDate).getTime() : null;

      return entry.machine === machineName && (!startTime || entryTime >= startTime) && (!endTime || entryTime <= endTime);
    });

    return formatData(filteredData, displayOption);
  };

  const filteredData = filterData();

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    if (!isValid(date)) return ''; // Return empty string if the date is invalid

    switch (displayOption) {
      case 'minute':
        return format(date, 'HH:mm');
      case 'hourly':
        return format(date, 'dd/MM HH:mm');
      case 'daily':
        return format(date, 'dd/MM');
      case 'weekly':
        return format(date, 'dd/MM');
      case 'monthly':
        return format(date, 'MMM yyyy');
      default:
        return tickItem;
    }
  };

  return (
    <div className={styles['machine-chart-wrapper']}>
      <div className={styles['filter-container']}>
        <label>
          Start Date:
          <input
            type="datetime-local"
            value={filters.startDate}
            onChange={(e) => onFilterChange(machineName, 'startDate', e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="datetime-local"
            value={filters.endDate}
            onChange={(e) => onFilterChange(machineName, 'endDate', e.target.value)}
          />
        </label>
      </div>
      <div className={styles['dropdown-container']}>
        <label htmlFor={`${machineName}-display-option`}>Display: </label>
        <select
          id={`${machineName}-display-option`}
          value={displayOption}
          onChange={(e) => onDisplayOptionChange(machineName, e.target.value)}
        >
          <option value="minute">Minute</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <h4>{machineName}</h4>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={filteredData} margin={{ top: 50, right: 0, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            domain={['auto', 'auto']}
          />
          <YAxis yAxisId="left" stroke="#8884d8" />
          <YAxis yAxisId="middle" orientation="right" stroke="#82ca9d" />
          <YAxis yAxisId="right" orientation="right" stroke="#ffc658" offset={80} />
          <Tooltip />
          <Legend />
          <Brush dataKey="timestamp" height={30} stroke="#8884d8" />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="vibration"
            stroke="#8884d8"
            name="Average Vibration"
            dot={false}
          />
          <Line
            yAxisId="middle"
            type="monotone"
            dataKey="temperature"
            stroke="#82ca9d"
            name="Average Temperature"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="noise_frequency"
            stroke="#ffc658"
            name="Average Noise Frequency"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const OperatingEnvironment = () => {
  const [chartData, setChartData] = useState(() => {
    const savedData = localStorage.getItem('chartData');
    return savedData ? JSON.parse(savedData) : [];
  });

  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('filters');
    return savedFilters ? JSON.parse(savedFilters) : {
      Machine_1: { startDate: '', endDate: '' },
      Machine_2: { startDate: '', endDate: '' },
      Machine_3: { startDate: '', endDate: '' },
      Machine_4: { startDate: '', endDate: '' },
      Machine_5: { startDate: '', endDate: '' },
    };
  });

  const [displayOptions, setDisplayOptions] = useState(() => {
    const savedDisplayOptions = localStorage.getItem('displayOptions');
    return savedDisplayOptions ? JSON.parse(savedDisplayOptions) : {
      Machine_1: 'hourly',
      Machine_2: 'hourly',
      Machine_3: 'hourly',
      Machine_4: 'hourly',
      Machine_5: 'hourly',
    };
  });

  const handleFilterChange = (machineName, type, value) => {
    setFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        [machineName]: {
          ...prevFilters[machineName],
          [type]: value,
        },
      };
      localStorage.setItem('filters', JSON.stringify(newFilters)); // Save filters to localStorage
      return newFilters;
    });
  };

  const handleDisplayOptionChange = (machineName, value) => {
    setDisplayOptions((prevOptions) => {
      const newDisplayOptions = {
        ...prevOptions,
        [machineName]: value,
      };
      localStorage.setItem('displayOptions', JSON.stringify(newDisplayOptions)); // Save display options to localStorage
      return newDisplayOptions;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://harveypredictive.work.gd:8080/data/');
        const result = await response.json();
        if (result.status === 'success' && Array.isArray(result.data)) {
          processData(result.data);
        } else {
          console.error('Error: Data fetched is not an array:', result);
        }
      } catch (error) {
        console.error('Error fetching data from Postgres:', error);
      }
    };

    const processData = (data) => {
      const processedData = data.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp).toISOString(), // Use ISO string for timestamp
      }));

      setChartData((prevChartData) => {
        const updatedData = [...processedData];
        localStorage.setItem('chartData', JSON.stringify(updatedData));
        return updatedData;
      });
    };

    fetchData();
  }, []);

  return (
    <div className={styles['operating-environment']}>
      <h3 className={styles['matrix-heading']}>Operating Environment by Machine</h3>
      {['Machine_1', 'Machine_2', 'Machine_3', 'Machine_4', 'Machine_5'].map((machine) => (
        <MachineChart
          key={machine}
          machineName={machine}
          data={chartData}
          filters={filters[machine]}
          onFilterChange={handleFilterChange}
          displayOption={displayOptions[machine]}
          onDisplayOptionChange={handleDisplayOptionChange}
        />
      ))}
    </div>
  );
};

export default OperatingEnvironment;
