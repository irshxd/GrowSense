import React, { useState } from 'react';

export default function Automate() {
  const [plantName, setPlantName] = useState('');
  const [plantDetails, setPlantDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [automationStatus, setAutomationStatus] = useState('');

  const BACKEND_URL = 'http://localhost:3001';

  const handleAutomatePlant = async () => {
    if (plantName.trim() === '') {
      setError('Please enter a plant name.');
      return;
    }

    setLoading(true);
    setError(null);
    setPlantDetails(null);
    setAutomationStatus('');

    try {
      console.log(`Automate: Sending request for plant: ${plantName}`);
      const response = await fetch(`${BACKEND_URL}/api/plant-automation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plantName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Automate: Received data from backend:', data);
      
      setPlantDetails(data); // This will contain description, optimal metrics, etc.
      setAutomationStatus(data.automationMessage || 'Automation process initiated.');

    } catch (e) {
      console.error('Automate: Error during plant automation:', e);
      setError(`Failed to fetch plant details or automate: ${e.message}`);
      setPlantDetails(null);
      setAutomationStatus('Automation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section automate-section">
      <h2 className="section-title">Plant Automation Hub</h2>
      <p className="section-description">
        Enter your plant's name to get detailed information about its optimal growing conditions and automatically adjust your GrowSense hardware.
      </p>

      <div className="automate-input-area">
        <input
          type="text"
          className="automate-plant-input"
          placeholder="e.g., Basil, Orchid, Tomato Plant"
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleAutomatePlant();
          }}
          disabled={loading}
        />
        <button
          onClick={handleAutomatePlant}
          className="automate-button green-button"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Get Info & Automate'}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
      {automationStatus && <p className="success-message">{automationStatus}</p>}

      {plantDetails && (
        <div className="plant-details-output mt-8">
          {plantDetails.description && (
            <div className="detail-card mb-4">
              <h3 className="panel-title">About {plantName}</h3>
              <p>{plantDetails.description}</p>
            </div>
          )}

          {plantDetails.optimalMetrics && (
            <div className="detail-card">
              <h3 className="panel-title">Optimal Growing Conditions for {plantName}</h3>
              <div className="metrics-grid">
                <p><strong>Temperature:</strong> {plantDetails.optimalMetrics.temperature}</p>
                <p><strong>Humidity:</strong> {plantDetails.optimalMetrics.humidity}</p>
                <p><strong>Soil Moisture:</strong> {plantDetails.optimalMetrics.soilMoisture}</p>
                <p><strong>Light Intensity:</strong> {plantDetails.optimalMetrics.lightIntensity}</p>
                <p><strong>Soil pH:</strong> {plantDetails.optimalMetrics.soilPh}</p>
                <p><strong>Nutrient Level:</strong> {plantDetails.optimalMetrics.nutrientLevel}</p>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                These are recommended values. Actual hardware adjustments depend on your current setup.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
