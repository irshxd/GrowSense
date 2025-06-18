import React, { useState, useEffect } from 'react';

// HardwareControl component for simulating hardware interactions
export default function HardwareControl() {
  // State for each individual hardware control's status (ON/OFF)
  // or intensity for dimmable devices.
  const [actuatorStates, setActuatorStates] = useState({
    waterPump: 'off',
    growLightPower: 'off', // ON/OFF for the light itself
    growLightIntensity: 50, // 0-100 for brightness
    ventilationFan: 'off',
    nutrientDispenser: 'off',
    mistingSystem: 'off',
    shadeControl: 'off',
    co2Injector: 'off',    // New actuator
    heatingPad: 'off',     // New actuator
  });
  const [loadingStates, setLoadingStates] = useState(true);
  const [error, setError] = useState(null);

  // Base URL for the backend API
  const BACKEND_URL = 'http://localhost:3001';

  // --- useEffect to fetch initial actuator states when component mounts ---
  useEffect(() => {
    const fetchActuatorStates = async () => {
      try {
        setLoadingStates(true);
        setError(null);
        console.log("HardwareControl: Fetching initial actuator states from backend...");
        const response = await fetch(`${BACKEND_URL}/api/hardware/states`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // Merge fetched states with default to ensure all keys are present
        setActuatorStates(prevStates => ({
          ...prevStates, // Keep initial defaults for missing keys if any
          ...data,       // Overwrite with fetched data
        }));
        console.log("HardwareControl: Successfully fetched actuator states:", data);
      } catch (e) {
        console.error("HardwareControl: Error fetching actuator states:", e);
        setError("Failed to load hardware states. Displaying default states.");
        // If error, component will remain with initial 'off'/'50' states
      } finally {
        setLoadingStates(false);
      }
    };

    fetchActuatorStates(); // Fetch states on initial mount
    // Polling for actuator states: If another source (e.g., automated system) can change states,
    // you might want to poll to keep UI in sync.
    // const intervalId = setInterval(fetchActuatorStates, 5000); 
    // return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this runs once on mount

  // --- Generic handler for ON/OFF controls via backend API ---
  const toggleOnOffControl = async (deviceName) => {
    console.log(`BUTTON PRESSED: Toggle ${deviceName}`); // Log button press
    const currentState = actuatorStates[deviceName];
    const newState = currentState === 'on' ? 'off' : 'on';

    try {
      setError(null); // Clear previous errors
      const apiEndpoint = `${BACKEND_URL}/api/hardware/control/${deviceName}`;
      const payload = { status: newState };
      console.log(`API Call: POST ${apiEndpoint} with payload: ${JSON.stringify(payload)}`);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Backend Response for ${deviceName}:`, result.message);

      setActuatorStates(prevStates => ({
        ...prevStates,
        [deviceName]: result.newState, // Use newState from backend for consistency
      }));
      console.log(`ACTION: ${deviceName} status updated to ${result.newState.toUpperCase()}`); // Log action taken

    } catch (e) {
      console.error(`ERROR: Failed to control ${deviceName}:`, e);
      setError(`Failed to control ${deviceName}. Check backend server.`);
    }
  };

  // --- Handler for Grow Light Intensity slider ---
  const handleLightIntensityChange = async (event) => {
    const newIntensity = parseInt(event.target.value, 10);
    console.log(`SLIDER ADJUSTED: Grow Light Intensity to ${newIntensity}%`); // Log slider adjustment

    // Optimistic UI update
    setActuatorStates(prevStates => ({
      ...prevStates,
      growLightIntensity: newIntensity, 
    }));

    try {
      setError(null);
      const apiEndpoint = `${BACKEND_URL}/api/hardware/control/growLightIntensity`;
      const payload = { intensity: newIntensity };
      console.log(`API Call: POST ${apiEndpoint} with payload: ${JSON.stringify(payload)}`);

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Backend Response for Grow Light Intensity:`, result.message);

      // Re-confirm state with backend's response if necessary (useful for real hardware feedback)
      setActuatorStates(prevStates => ({
        ...prevStates,
        growLightIntensity: result.newIntensity, // Use newIntensity from backend
      }));
      console.log(`ACTION: Grow Light Intensity set to ${result.newIntensity}%`); // Log action taken

    } catch (e) {
      console.error(`ERROR: Failed to set Grow Light Intensity:`, e);
      setError(`Failed to set Grow Light Intensity. Check backend server.`);
    }
  };


  if (loadingStates) {
    return (
      <section className="section hardware-control-section">
        <h2 className="section-title">Hardware Control Panel</h2>
        <p className="loading-message">Loading actuator states...</p>
      </section>
    );
  }

  return (
    <section className="section hardware-control-section">
      <h2 className="section-title">Hardware Control Panel</h2>
      {error && <p className="error-message">{error}</p>}

      <div className="control-grid">
        {/* Water Pump Control */}
        <div className="control-panel">
          <h3 className="panel-title">Water Pump</h3>
          <div className="control-buttons-group">
            <button
              onClick={() => toggleOnOffControl('waterPump')}
              className={`control-button ${actuatorStates.waterPump === 'on' ? 'red-button' : 'green-button'}`}
            >
              {actuatorStates.waterPump === 'on' ? 'Stop Watering' : 'Start Watering'}
            </button>
          </div>
          <p className="control-status">Status: {actuatorStates.waterPump.toUpperCase()}</p>
        </div>

        {/* Grow Light Power Control (ON/OFF) */}
        <div className="control-panel">
          <h3 className="panel-title">Grow Light Power</h3>
          <div className="control-buttons-group">
            <button
              onClick={() => toggleOnOffControl('growLightPower')}
              className={`control-button ${actuatorStates.growLightPower === 'on' ? 'red-button' : 'green-button'}`}
            >
              {actuatorStates.growLightPower === 'on' ? 'Turn OFF Light' : 'Turn ON Light'}
            </button>
          </div>
          <p className="control-status">Status: {actuatorStates.growLightPower.toUpperCase()}</p>
        </div>

        {/* Grow Light Intensity Control (Slider) */}
        <div className="control-panel">
          <h3 className="panel-title">Grow Light Intensity</h3>
          <div className="control-buttons-group">
            <input
              type="range"
              min="0"
              max="100"
              value={actuatorStates.growLightIntensity}
              onChange={handleLightIntensityChange}
              className="slider"
              style={{ width: '100%', accentColor: 'var(--text-highlight-green)' }}
            />
          </div>
          <p className="control-status">Intensity: {actuatorStates.growLightIntensity}%</p>
        </div>

        {/* Ventilation Fan Control */}
        <div className="control-panel">
          <h3 className="panel-title">Ventilation Fan</h3>
          <div className="control-buttons-group">
            <button
              onClick={() => toggleOnOffControl('ventilationFan')}
              className={`control-button ${actuatorStates.ventilationFan === 'on' ? 'red-button' : 'green-button'}`}
            >
              {actuatorStates.ventilationFan === 'on' ? 'Stop Fan' : 'Start Fan'}
            </button>
          </div>
          <p className="control-status">Status: {actuatorStates.ventilationFan.toUpperCase()}</p>
        </div>

        {/* Nutrient Dispenser Control */}
        <div className="control-panel">
          <h3 className="panel-title">Nutrient Dispenser</h3>
          <div className="control-buttons-group">
            <button
              onClick={() => toggleOnOffControl('nutrientDispenser')}
              className={`control-button ${actuatorStates.nutrientDispenser === 'on' ? 'red-button' : 'green-button'}`}
            >
              {actuatorStates.nutrientDispenser === 'on' ? 'Stop Dispensing' : 'Start Dispensing'}
            </button>
          </div>
          <p className="control-status">Status: {actuatorStates.nutrientDispenser.toUpperCase()}</p>
        </div>

        {/* Misting System Control */}
        <div className="control-panel">
          <h3 className="panel-title">Misting System</h3>
          <div className="control-buttons-group">
            <button
              onClick={() => toggleOnOffControl('mistingSystem')}
              className={`control-button ${actuatorStates.mistingSystem === 'on' ? 'red-button' : 'green-button'}`}
            >
              {actuatorStates.mistingSystem === 'on' ? 'Stop Misting' : 'Start Misting'}
            </button>
          </div>
          <p className="control-status">Status: {actuatorStates.mistingSystem.toUpperCase()}</p>
        </div>

        {/* Shade Control */}
        <div className="control-panel">
          <h3 className="panel-title">Shade Control</h3>
          <div className="control-buttons-group">
            <button
              onClick={() => toggleOnOffControl('shadeControl')}
              className={`control-button ${actuatorStates.shadeControl === 'on' ? 'red-button' : 'green-button'}`}
            >
              {actuatorStates.shadeControl === 'on' ? 'Close Shades' : 'Open Shades'}
            </button>
          </div>
          <p className="control-status">Status: {actuatorStates.shadeControl.toUpperCase()}</p>
        </div>

        {/* New Actuator: CO2 Injector */}
        <div className="control-panel">
          <h3 className="panel-title">CO2 Injector</h3>
          <div className="control-buttons-group">
            <button
              onClick={() => toggleOnOffControl('co2Injector')}
              className={`control-button ${actuatorStates.co2Injector === 'on' ? 'red-button' : 'green-button'}`}
            >
              {actuatorStates.co2Injector === 'on' ? 'Stop CO2' : 'Start CO2'}
            </button>
          </div>
          <p className="control-status">Status: {actuatorStates.co2Injector.toUpperCase()}</p>
        </div>

        {/* New Actuator: Heating Pad */}
        <div className="control-panel">
          <h3 className="panel-title">Heating Pad</h3>
          <div className="control-buttons-group">
            <button
              onClick={() => toggleOnOffControl('heatingPad')}
              className={`control-button ${actuatorStates.heatingPad === 'on' ? 'red-button' : 'green-button'}`}
            >
              {actuatorStates.heatingPad === 'on' ? 'Turn OFF Heater' : 'Turn ON Heater'}
            </button>
          </div>
          <p className="control-status">Status: {actuatorStates.heatingPad.toUpperCase()}</p>
        </div>

        {/* Placeholder or instructions */}
        <div className="control-panel full-width-panel placeholder-panel">
          <p className="placeholder-text">
            * These controls are currently simulated in the backend. In a full deployment, they would interact with real IoT hardware via the Node.js server.
          </p>
        </div>
      </div>
    </section>
  );
}
