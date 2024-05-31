import React from 'react';
import './Card.css';

const Card = ({ status, statusText, text, goodCount, cycleTime, performance, oee, lastUpdate, vibration, temperature, noise_frequency }) => {
  return (
    <div className={`card status-${status}`}>
      <div className={`card-header status-${status}`}>
        <span>{statusText} - Last update: {lastUpdate}</span>
      </div>
      <div className="card-body">
        <h3>{text}</h3>
        <p><span className="data-label">Good Count:</span> {goodCount}</p>
        <p><span className="data-label">Cycle Time:</span> {cycleTime}</p>
        <p><span className="data-label">Performance:</span> {performance}</p>
        <p><span className="data-label">OEE:</span> {oee}</p>
        <p><span className="data-label">Vibration:</span> {vibration}</p>
        <p><span className="data-label">Temperature:</span> {temperature}</p>
        <p><span className="data-label">Noise Frequency:</span> {noise_frequency}</p>
      </div>
    </div>
  );
};

export default Card;
