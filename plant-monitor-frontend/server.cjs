const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Middleware to enable CORS for all origins
app.use(cors());

// Middleware to parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Helper function to generate a single random sensor value ---
const generateRandomValue = (paramName) => {
    switch (paramName) {
        case 'temperature':
            return (Math.random() * (28 - 20) + 20).toFixed(1); // 20.0 - 28.0 °C
        case 'humidity':
            return (Math.random() * (75 - 55) + 55).toFixed(0); // 55 - 75 %
        case 'soilMoisture':
            return (Math.random() * (90 - 45) + 45).toFixed(0); // 45 - 90 %
        case 'lightIntensity':
            return (Math.random() * (6000 - 3000) + 3000).toFixed(0); // 3000 - 6000 Lux
        case 'soilPh':
            return (Math.random() * (7.5 - 6.0) + 6.0).toFixed(1); // 6.0 - 7.5 pH
        case 'nutrientLevel':
            return (Math.random() * (1000 - 400) + 400).toFixed(0); // 400 - 1000 PPM
        default:
            return 'N/A';
    }
};

// --- Initial / Default state for all core numerical sensor readings ---
let latestSensorReadings = {
    timestamp: new Date().toISOString(),
    temperature: parseFloat(generateRandomValue('temperature')),
    humidity: parseFloat(generateRandomValue('humidity')),
    soilMoisture: parseFloat(generateRandomValue('soilMoisture')),
    lightIntensity: parseFloat(generateRandomValue('lightIntensity')),
    soilPh: parseFloat(generateRandomValue('soilPh')),
    nutrientLevel: parseFloat(generateRandomValue('nutrientLevel'))
};

// --- Global variable to store the current state of actuators ---
let currentActuatorStates = {
    waterPump: 'off',
    growLightPower: 'off',
    growLightIntensity: 50,
    ventilationFan: 'off',
    nutrientDispenser: 'off',
    mistingSystem: 'off',
    shadeControl: 'off',
    co2Injector: 'off',
    heatingPad: 'off',
};


// --- API endpoint for "hardware" (ESP32/Python script) to send sensor data (POST request) ---
app.post('/api/hardware/sensor-update', (req, res) => {
    const receivedReadings = req.body;
    console.log('[POST /api/hardware/sensor-update] Received sensor data from "hardware":', receivedReadings);

    for (const key in receivedReadings) {
        if (latestSensorReadings.hasOwnProperty(key)) {
            latestSensorReadings[key] = parseFloat(receivedReadings[key]);
        }
    }
    latestSensorReadings.timestamp = new Date().toISOString();

    console.log('[POST /api/hardware/sensor-update] Latest combined sensor readings:', latestSensorReadings);

    res.status(200).json({ message: 'Sensor data updated successfully', data: latestSensorReadings });
});


// --- API endpoint for frontend to fetch dashboard sensor data (GET request) ---
app.get('/api/dashboard/sensor-data', (req, res) => {
    const currentCombinedReadings = { ...latestSensorReadings };
    const requiredParams = ['temperature', 'humidity', 'soilMoisture', 'lightIntensity', 'soilPh', 'nutrientLevel'];

    requiredParams.forEach(param => {
        if (currentCombinedReadings[param] === undefined || currentCombinedReadings[param] === null || isNaN(currentCombinedReadings[param])) {
            currentCombinedReadings[param] = parseFloat(generateRandomValue(param));
        }
    });

    const transformedData = [
        { name: 'Temperature', value: `${currentCombinedReadings.temperature}°C`, icon: '🌡️' },
        { name: 'Humidity', value: `${currentCombinedReadings.humidity}%`, icon: '💧' },
        { name: 'Soil Moisture', value: `${currentCombinedReadings.soilMoisture}%`, icon: '🌿' },
        { name: 'Light Intensity', value: `${currentCombinedReadings.lightIntensity} Lux`, icon: '☀️' },
        { name: 'Soil pH', value: `${currentCombinedReadings.soilPh}`, icon: '🧪' },
        { name: 'Nutrient Level', value: `${currentCombinedReadings.nutrientLevel} PPM`, icon: '🔬' },
        { name: 'Soil Fertility', value: currentCombinedReadings.soilMoisture > 70 ? 'Optimal' : currentCombinedReadings.soilMoisture > 50 ? 'Good' : 'Fair', icon: '🌱' },
        { name: 'Last Watered', value: 'Less than 1 Day Ago', icon: '🗓️' },
    ];
    res.json(transformedData);
});

// --- API endpoint for frontend to get all actuator states (GET request) ---
app.get('/api/hardware/states', (req, res) => {
    console.log('[GET /api/hardware/states] Frontend requested initial actuator states. Sending:', currentActuatorStates);
    res.json(currentActuatorStates);
});

// --- API endpoint for frontend to control a specific actuator (POST request) ---
app.post('/api/hardware/control/:deviceName', (req, res) => {
    const { deviceName } = req.params;
    console.log(`[POST /api/hardware/control/${deviceName}] Received control command.`);

    if (deviceName === 'growLightIntensity') {
        const { intensity } = req.body;
        console.log(`  - For device: '${deviceName}', desired intensity: ${intensity}`);

        if (intensity === undefined || typeof intensity !== 'number' || intensity < 0 || intensity > 100) {
            console.warn(`[POST /api/hardware/control/${deviceName}] Invalid intensity value received: ${intensity}`);
            return res.status(400).json({ error: 'Intensity must be a number between 0 and 100.' });
        }
        currentActuatorStates.growLightIntensity = intensity;
        console.log(`  - Simulating physical control. New growLightIntensity: ${intensity}%`);
        return res.status(200).json({ 
            message: `Grow light intensity updated to ${intensity}%.`,
            newIntensity: currentActuatorStates.growLightIntensity
        });

    } else {
        const { status } = req.body;
        console.log(`  - For device: '${deviceName}', desired status: ${status}`);

        if (!currentActuatorStates.hasOwnProperty(deviceName)) {
            console.warn(`[POST /api/hardware/control/${deviceName}] Device '${deviceName}' not found in actuator states.`);
            return res.status(404).json({ error: `Device '${deviceName}' not found.` });
        }
        if (!['on', 'off'].includes(status)) {
            console.warn(`[POST /api/hardware/control/${deviceName}] Invalid status value received: ${status}`);
            return res.status(400).json({ error: 'Status must be "on" or "off".' });
        }

        currentActuatorStates[deviceName] = status;
        console.log(`  - Simulating physical control of ${deviceName}. New state: ${status}`);

        res.status(200).json({ 
            message: `${deviceName} status updated to ${status}.`,
            newState: currentActuatorStates[deviceName]
        });
    }
});


// --- NEW API endpoint for plant automation and getting optimal conditions ---
app.post('/api/plant-automation', async (req, res) => {
    const { plantName } = req.body;
    console.log(`[POST /api/plant-automation] Request for plant: ${plantName}`);

    if (!plantName) {
        return res.status(400).json({ error: 'Plant name is required.' });
    }

    let plantDescription = "Description not available."; // Default value
    let optimalMetrics = { // Default values to ensure structure
        temperature: 'N/A',
        humidity: 'N/A',
        soilMoisture: 'N/A',
        lightIntensity: 'N/A',
        soilPh: 'N/A',
        nutrientLevel: 'N/A',
    };
    let automationMessage = "Could not get full plant details from AI.";

    try {
        const prompt = `Provide a concise description of the ${plantName} plant (1-2 sentences). Then, list its optimal growing conditions.
        The output MUST be a JSON object ONLY, with NO additional text or markdown formatting (e.g., no \`\`\`json\`\`\`).
        The JSON object must have two top-level keys: "description" (string) and "optimalMetrics" (object).
        The "optimalMetrics" object must have keys: "temperature", "humidity", "soilMoisture", "lightIntensity", "soilPh", and "nutrientLevel".
        Provide values for optimalMetrics as a string representing the range or a descriptive term (e.g., "20-25°C", "60-70%", "Consistently moist", "Full sun", "6.0-6.5", "500-800 PPM").
        `;
        
        const payload = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                // Ensure strict JSON output, though sometimes AI still adds ```json
                responseMimeType: "application/json", 
                responseSchema: { 
                    type: "OBJECT",
                    properties: {
                        "description": { "type": "STRING" },
                        "optimalMetrics": {
                            "type": "OBJECT",
                            "properties": {
                                "temperature": { "type": "STRING" },
                                "humidity": { "type": "STRING" },
                                "soilMoisture": { "type": "STRING" },
                                "lightIntensity": { "type": "STRING" },
                                "soilPh": { "type": "STRING" },
                                "nutrientLevel": { "type": "STRING" }
                            },
                            "propertyOrdering": ["temperature", "humidity", "soilMoisture", "lightIntensity", "soilPh", "nutrientLevel"]
                        }
                    },
                    "propertyOrdering": ["description", "optimalMetrics"]
                }
            }
        };

        const apiKey = "AIzaSyDXfA6a2yQDSiWOXOui2TQl6dyvFIuQMns"; // API Key will be injected by Canvas environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        console.log(`[POST /api/plant-automation] Sending prompt to AI:`, prompt);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        console.log(`[POST /api/plant-automation] Raw AI API result:`, JSON.stringify(result, null, 2));

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            
            let jsonString = result.candidates[0].content.parts[0].text;
            console.log(`[POST /api/plant-automation] AI response text part (before cleaning):`, jsonString);

            // Robust parsing: Remove leading/trailing markdown code blocks if present
            jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            console.log(`[POST /api/plant-automation] Cleaned AI response string (for JSON.parse):`, jsonString);

            try {
                const parsedAiResponse = JSON.parse(jsonString);
                plantDescription = parsedAiResponse.description || "Description not available.";
                // Only assign optimalMetrics if it's an object and has properties
                if (parsedAiResponse.optimalMetrics && typeof parsedAiResponse.optimalMetrics === 'object' && Object.keys(parsedAiResponse.optimalMetrics).length > 0) {
                    optimalMetrics = parsedAiResponse.optimalMetrics;
                } else {
                    console.warn('[POST /api/plant-automation] AI provided optimalMetrics but it was empty or not an object.');
                }
                
                automationMessage = `Optimal conditions for ${plantName} fetched successfully!`;
                console.log(`[POST /api/plant-automation] Successfully parsed AI response.`);

                // Step 2: (Simulated) Adjust hardware control states based on optimal metrics
                // This is a simplified simulation. In a real system, you'd parse ranges and
                // calculate target values, then send commands to ESP32.
                // We will default to 'off' or 0 if a metric isn't provided or parsed.

                // Water Pump (based on soil moisture)
                if (optimalMetrics.soilMoisture && (optimalMetrics.soilMoisture.toLowerCase().includes('high') || optimalMetrics.soilMoisture.toLowerCase().includes('wet') || optimalMetrics.soilMoisture.toLowerCase().includes('moist'))) {
                    currentActuatorStates.waterPump = 'off';
                    automationMessage += " Water pump turned OFF (assuming moist soil).";
                } else if (optimalMetrics.soilMoisture && (optimalMetrics.soilMoisture.toLowerCase().includes('low') || optimalMetrics.soilMoisture.toLowerCase().includes('dry') || optimalMetrics.soilMoisture.toLowerCase().includes('medium'))) {
                    currentActuatorStates.waterPump = 'on';
                    automationMessage += " Water pump turned ON.";
                } else {
                    currentActuatorStates.waterPump = 'off'; // Default or no clear instruction
                }

                // Grow Light (based on light intensity)
                if (optimalMetrics.lightIntensity && (optimalMetrics.lightIntensity.toLowerCase().includes('high') || optimalMetrics.lightIntensity.toLowerCase().includes('full sun'))) {
                    currentActuatorStates.growLightPower = 'on';
                    currentActuatorStates.growLightIntensity = 80;
                    automationMessage += " Grow light set to ON/80%.";
                } else if (optimalMetrics.lightIntensity && (optimalMetrics.lightIntensity.toLowerCase().includes('medium') || optimalMetrics.lightIntensity.toLowerCase().includes('moderate'))) {
                    currentActuatorStates.growLightPower = 'on';
                    currentActuatorStates.growLightIntensity = 50;
                    automationMessage += " Grow light set to ON/50%.";
                } else if (optimalMetrics.lightIntensity && optimalMetrics.lightIntensity.toLowerCase().includes('low') || optimalMetrics.lightIntensity.toLowerCase().includes('indirect')) {
                     currentActuatorStates.growLightPower = 'on';
                     currentActuatorStates.growLightIntensity = 20;
                     automationMessage += " Grow light set to ON/20%.";
                } else {
                    currentActuatorStates.growLightPower = 'off';
                    currentActuatorStates.growLightIntensity = 0;
                }


                // CO2 Injector (often paired with light/temperature for fast growth)
                if (optimalMetrics.temperature && optimalMetrics.temperature.toLowerCase().includes('warm')) {
                    currentActuatorStates.co2Injector = 'on';
                    automationMessage += " CO2 Injector ON.";
                } else {
                    currentActuatorStates.co2Injector = 'off';
                }

                // Heating Pad (based on temperature)
                if (optimalMetrics.temperature && (optimalMetrics.temperature.toLowerCase().includes('warm') || optimalMetrics.temperature.toLowerCase().includes('tropical'))) {
                    currentActuatorStates.heatingPad = 'on';
                    automationMessage += " Heating Pad ON.";
                } else {
                    currentActuatorStates.heatingPad = 'off';
                }

                // Nutrient Dispenser (based on nutrient level - a simple example, real logic complex)
                if (optimalMetrics.nutrientLevel && (optimalMetrics.nutrientLevel.toLowerCase().includes('high') || optimalMetrics.nutrientLevel.toLowerCase().includes('abundant'))) {
                    currentActuatorStates.nutrientDispenser = 'off';
                } else if (optimalMetrics.nutrientLevel && (optimalMetrics.nutrientLevel.toLowerCase().includes('medium') || optimalMetrics.nutrientLevel.toLowerCase().includes('moderate'))) {
                    currentActuatorStates.nutrientDispenser = 'off';
                } else if (optimalMetrics.nutrientLevel && optimalMetrics.nutrientLevel.toLowerCase().includes('low')) {
                    currentActuatorStates.nutrientDispenser = 'on';
                    automationMessage += " Nutrient Dispenser ON.";
                } else {
                    currentActuatorStates.nutrientDispenser = 'off';
                }

                // Misting System (based on humidity)
                if (optimalMetrics.humidity && (optimalMetrics.humidity.toLowerCase().includes('high') || optimalMetrics.humidity.toLowerCase().includes('humid'))) {
                    currentActuatorStates.mistingSystem = 'off';
                } else if (optimalMetrics.humidity && (optimalMetrics.humidity.toLowerCase().includes('low') || optimalMetrics.humidity.toLowerCase().includes('dry'))) {
                    currentActuatorStates.mistingSystem = 'on';
                    automationMessage += " Misting System ON.";
                } else {
                    currentActuatorStates.mistingSystem = 'off';
                }
                 // Ventilation Fan (based on humidity/temp - if high humidity or temp, turn on fan)
                if ((optimalMetrics.humidity && optimalMetrics.humidity.toLowerCase().includes('low')) || (optimalMetrics.temperature && optimalMetrics.temperature.toLowerCase().includes('cool'))) {
                    currentActuatorStates.ventilationFan = 'off';
                } else { // Assume for high humidity/temp, or if not specified, keep off
                    currentActuatorStates.ventilationFan = 'on';
                    automationMessage += " Ventilation Fan ON.";
                }
                // Shade Control (based on light intensity - if low light, open shades)
                if (optimalMetrics.lightIntensity && (optimalMetrics.lightIntensity.toLowerCase().includes('low') || optimalMetrics.lightIntensity.toLowerCase().includes('indirect'))) {
                    currentActuatorStates.shadeControl = 'on'; // Open shades
                    automationMessage += " Shades OPEN.";
                } else if (optimalMetrics.lightIntensity && (optimalMetrics.lightIntensity.toLowerCase().includes('high') || optimalMetrics.lightIntensity.toLowerCase().includes('full sun'))) {
                    currentActuatorStates.shadeControl = 'off'; // Close shades (simulated)
                    automationMessage += " Shades CLOSED.";
                } else {
                    currentActuatorStates.shadeControl = 'off'; // Default to closed
                }


                console.log("[POST /api/plant-automation] Actuator states after simulated automation:", currentActuatorStates);

            } catch (parseError) {
                console.error('[POST /api/plant-automation] JSON parse error on cleaned string:', parseError);
                automationMessage = `AI response malformed. Please try again. Raw string was: ${jsonString.substring(0, 200)}...`; // Log snippet
                plantDescription = "Could not parse description from AI.";
                optimalMetrics = { // Ensure optimalMetrics is set to defaults on parse error
                    temperature: 'N/A', humidity: 'N/A', soilMoisture: 'N/A',
                    lightIntensity: 'N/A', soilPh: 'N/A', nutrientLevel: 'N/A',
                };
            }

        } else {
            console.warn('[POST /api/plant-automation] AI response candidates missing or empty. Full result:', JSON.stringify(result));
            automationMessage = "Could not get full plant details from AI (empty AI response).";
        }
    } catch (error) {
        console.error('[POST /api/plant-automation] Error processing plant automation (API call or general error):', error);
        automationMessage = `Failed to get plant details or automate due to network/API error: ${error.message}`;
    }

    res.json({
        description: plantDescription,
        optimalMetrics: optimalMetrics,
        automationMessage: automationMessage
    });
});


// --- API endpoint for the AI Chatbot (existing) ---
app.post('/api/chat', async (req, res) => {
    const { prompt } = req.body;
    console.log('[POST /api/chat] Received chat prompt:', prompt);

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const payload = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        };

        const apiKey = "AIzaSyDXfA6a2yQDSiWOXOui2TQl6dyvFIuQMns"; // API Key will be injected by Canvas environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        let aiResponseText = "Sorry, I couldn't get a response from the AI. Please try again.";

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            let text = result.candidates[0].content.parts[0].text;
            // The AI is expected to return JSON here, so we must parse it if it's stringified JSON.
            try {
                // Also attempt to remove markdown block if AI wraps it
                text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
                const parsedText = JSON.parse(text); // Try parsing if AI returns stringified JSON
                if (parsedText && parsedText.response) { // Check for a 'response' field
                    aiResponseText = parsedText.response;
                } else {
                    aiResponseText = text; // If not stringified JSON, use as-is
                }
            } catch (parseError) {
                console.warn('[POST /api/chat] Chat AI response not perfect JSON, using raw text:', text);
                aiResponseText = text; // If parsing fails, use the raw text
            }
            console.log('[POST /api/chat] AI Response:', aiResponseText);
        } else {
            console.warn('[POST /api/chat] AI response structure unexpected or empty for chat:', result);
        }

        res.json({ response: aiResponseText });
    } catch (error) {
        console.error('[POST /api/chat] Error fetching chat response from Gemini API:', error);
        res.status(500).json({ error: 'Failed to get response from AI service.' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`GrowSense Backend server running on http://localhost:${port}`);
});

