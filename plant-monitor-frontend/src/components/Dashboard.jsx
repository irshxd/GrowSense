import React, { useState, useEffect } from 'react';
import Plant3DModel from './Plant3DModel'; // This path expects Plant3DModel.jsx in the same folder

// Helper function to generate dynamic-looking placeholder data
// This function now generates 8 parameters, consistent with server.cjs output.
const generatePlaceholderData = () => {
  const temperature = (Math.random() * (26 - 22) + 22).toFixed(1); // 22.0 - 26.0 °C
  const humidity = (Math.random() * (70 - 60) + 60).toFixed(0);     // 60 - 70 %
  const soilMoisture = (Math.random() * (85 - 75) + 75).toFixed(0); // 75 - 85 %
  const lightIntensity = (Math.random() * (4500 - 3500) + 3500).toFixed(0); // 3500 - 4500 Lux
  const soilPh = (Math.random() * (7.5 - 6.0) + 6.0).toFixed(1); // 6.0 - 7.5 pH
  const nutrientLevel = (Math.random() * (1000 - 400) + 400).toFixed(0); // 400 - 1000 PPM

  const soilFertilityOptions = ['Optimal', 'Good', 'Fair'];
  const soilFertility = soilFertilityOptions[Math.floor(Math.random() * soilFertilityOptions.length)];
  
  const lastWateredOptions = ['Less than 1 Day Ago', '1 Day Ago', '2 Days Ago'];
  const lastWatered = lastWateredOptions[Math.floor(Math.random() * lastWateredOptions.length)];

  return [
      { name: 'Temperature', value: `${temperature}°C`, icon: '🌡️' },
      { name: 'Humidity', value: `${humidity}%`, icon: '💧' },
      { name: 'Soil Moisture', value: `${soilMoisture}%`, icon: '🌿' },
      { name: 'Light Intensity', value: `${lightIntensity} Lux`, icon: '☀️' },
      { name: 'Soil pH', value: `${soilPh}`, icon: '🧪' }, // Consistent with server.cjs
      { name: 'Nutrient Level', value: `${nutrientLevel} PPM`, icon: '🔬' }, // Consistent with server.cjs
      { name: 'Soil Fertility', value: soilFertility, icon: '🌱' }, // Changed icon for distinction from nutrient
      { name: 'Last Watered', value: lastWatered, icon: '🗓️' },
  ];
};

// Dashboard component for displaying plant sensor data
export default function Dashboard() {
  // Initialize plantParameters with dynamic placeholder data
  const [plantParameters, setPlantParameters] = useState(generatePlaceholderData());
  const [loading, setLoading] = useState(true); // Still indicate loading for the actual fetch
  const [error, setError] = useState(null);

  // useEffect to fetch sensor data when the component mounts
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setLoading(true); // Indicate loading for the real data fetch
        setError(null);   // Clear any previous errors

        // Fetch data from our simulated backend
        const response = await fetch('http://localhost:3001/api/dashboard/sensor-data');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Crucially, ensure the fetched data is indeed an array of objects
        // and that its structure matches what we expect for display.
        if (Array.isArray(data) && data.length > 0) {
            setPlantParameters(data); // Update state with fetched data
            console.log("Successfully fetched data:", data); // Log success
        } else {
            console.warn("Fetched data is empty or not in expected format, using placeholder.");
            setPlantParameters(generatePlaceholderData()); // Fallback if fetched data is bad
        }
      } catch (e) {
        console.error("Error fetching sensor data:", e);
        setError("Failed to load live plant data. Displaying sample data."); // Update error message
        setPlantParameters(generatePlaceholderData()); // Fallback to placeholder data on error
      } finally {
        setLoading(false); // Set loading to false after fetch (success or failure)
      }
    };

    fetchSensorData(); // Call the fetch function immediately on mount

    // Polling for real-time like updates (e.g., every 5 seconds)
    const intervalId = setInterval(fetchSensorData, 5000); 

    // Cleanup function: clear interval when component unmounts to prevent memory leaks
    return () => clearInterval(intervalId); 
  }, []); // Empty dependency array ensures this effect runs once on mount and cleans up on unmount

  return (
    <section id="dashboard" className="section dashboard-section">
      <h2 className="section-title">Plant Dashboard</h2>
      {loading && <p className="loading-message">Loading live data...</p>}
      {error && <p className="error-message">{error}</p>} {/* Display error if it exists */}

      <div className="dashboard-content-wrapper">
        {/* Left column for displaying plant parameters */}
        <div className="parameter-boxes-left">
          {plantParameters.slice(0, Math.ceil(plantParameters.length / 2)).map((param, index) => (
            <div key={index} className="parameter-card">
              <span className="parameter-icon">{param.icon}</span>
              <p className="parameter-name">{param.name}</p>
              <p className="parameter-value">{param.value}</p>
            </div>
          ))}
        </div>

        {/* Central large box for the 3D plant model */}
        <div className="plant-picture-box"> {/* Keep this div for consistent styling */}
          <Plant3DModel /> {/* Render the 3D plant model here */}
          {/* Overlays for plant name and status - these can be passed as props to Plant3DModel or rendered outside it */}
          <div className="plant-info-overlay bottom-left">
            My Basil Plant
          </div>
          <div className="plant-info-overlay top-right">
            Status: Thriving 🌱
          </div>
        </div>

        {/* Right column for additional plant parameters */}
        <div className="parameter-boxes-right">
          {plantParameters.slice(Math.ceil(plantParameters.length / 2)).map((param, index) => (
            <div key={index} className="parameter-card">
              <span className="parameter-icon">{param.icon}</span>
              <p className="parameter-name">{param.name}</p>
              <p className="parameter-value">{param.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
