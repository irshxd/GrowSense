import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

// Insights component for displaying ML-powered insights and an AI assistant
export default function Insights() {
  // State to hold the dynamic plant parameters, which will drive the insights
  const [plantParameters, setPlantParameters] = useState([]);
  const [loadingParameters, setLoadingParameters] = useState(true);
  const [errorParameters, setErrorParameters] = useState(null);

  // States for the AI Chatbot functionality
  const [chatHistory, setChatHistory] = useState([]); // Stores all messages (user and AI)
  const [chatInput, setChatInput] = useState('');     // Stores the current text in the input field
  const [isTyping, setIsTyping] = useState(false);     // Boolean to indicate if the AI is "typing"
  const chatHistoryRef = useRef(null); // Ref for auto-scrolling chat history

  // Helper function to generate dynamic-looking placeholder data (used as fallback here)
  const generatePlaceholderData = () => {
    const temperature = (Math.random() * (28 - 20) + 20).toFixed(1); // 20.0 - 28.0 °C
    const humidity = (Math.random() * (75 - 55) + 55).toFixed(0);     // 55 - 75 %
    const soilMoisture = (Math.random() * (90 - 45) + 45).toFixed(0); // 45 - 90 %
    const lightIntensity = (Math.random() * (6000 - 3000) + 3000).toFixed(0); // 3000 - 6000 Lux
    const soilPh = (Math.random() * (7.5 - 6.0) + 6.0).toFixed(1); // 6.0 - 7.5 pH
    const nutrientLevel = (Math.random() * (1000 - 400) + 400).toFixed(0); // 400 - 1000 PPM

    const soilFertilityOptions = ['Optimal', 'Good', 'Fair', 'Low'];
    const soilFertility = soilFertilityOptions[Math.floor(Math.random() * soilFertilityOptions.length)];
    
    const lastWateredOptions = ['Less than 1 Day Ago', '1 Day Ago', '2 Days Ago', '3 Days Ago', '4 Days Ago'];
    const lastWatered = lastWateredOptions[Math.floor(Math.random() * lastWateredOptions.length)];

    return [
        { name: 'Temperature', value: `${temperature}°C`, icon: '🌡️' },
        { name: 'Humidity', value: `${humidity}%`, icon: '💧' },
        { name: 'Soil Moisture', value: `${soilMoisture}%`, icon: '🌿' },
        { name: 'Light Intensity', value: `${lightIntensity} Lux`, icon: '☀️' },
        { name: 'Soil pH', value: `${soilPh}`, icon: '🧪' },
        { name: 'Nutrient Level', value: `${nutrientLevel} PPM`, icon: '🔬' },
        { name: 'Soil Fertility', value: soilFertility, icon: '🌱' },
        { name: 'Last Watered', value: lastWatered, icon: '🗓️' },
    ];
  };

  // --- Dynamic Insight Generation (Simulated ML Algorithm) ---
  const generateInsights = (parameters) => {
    const insights = [];
    let healthScore = 100;
    let plantHealthStatus = 'Excellent!';
    let recommendations = [];

    const getParamValue = (params, name) => {
      const param = params.find(p => p.name === name);
      if (!param || param.value === 'N/A') return null;
      return parseFloat(param.value.replace(/[^0-9.]/g, ''));
    };
    
    const getParamString = (params, name) => {
      const param = params.find(p => p.name === name);
      return param ? param.value : null;
    };

    const temp = getParamValue(parameters, 'Temperature');
    const humidity = getParamValue(parameters, 'Humidity');
    const soilMoisture = getParamValue(parameters, 'Soil Moisture');
    const light = getParamValue(parameters, 'Light Intensity');
    const soilPh = getParamValue(parameters, 'Soil pH');
    const nutrientLevel = getParamValue(parameters, 'Nutrient Level');
    const soilFertility = getParamString(parameters, 'Soil Fertility');
    const lastWateredDays = getParamString(parameters, 'Last Watered')?.includes('Days Ago') ? 
                            parseInt(getParamString(parameters, 'Last Watered').split(' ')[0]) : null;

    // Rule 1: Temperature Check
    if (temp !== null) {
      if (temp < 20) {
        insights.push({ title: 'Temperature Alert:', text: 'Temperature is low. Consider warmer environment if plant is tropical.', type: 'alert' });
        healthScore -= 5;
      } else if (temp > 27) {
        insights.push({ title: 'Temperature Alert:', text: 'Temperature is high. Ensure good ventilation.', type: 'alert' });
        healthScore -= 5;
      } else {
        recommendations.push('Maintain optimal temperature range.');
      }
    }

    // Rule 2: Humidity Check
    if (humidity !== null) {
      if (humidity < 55) {
        insights.push({ title: 'Humidity Alert:', text: 'Humidity is low. Consider misting or a humidifier.', type: 'alert' });
        healthScore -= 5;
      } else if (humidity > 70) {
        insights.push({ title: 'Humidity Alert:', text: 'Humidity is high. Ensure good airflow to prevent mold.', type: 'alert' });
        healthScore -= 3;
      } else {
        recommendations.push('Maintain optimal humidity levels.');
      }
    }

    // Rule 3: Soil Moisture Check
    if (soilMoisture !== null) {
      if (soilMoisture < 45) {
        insights.push({ title: 'Watering Recommended:', text: 'Soil moisture is low. It\'s time to water your plant!', type: 'action' });
        healthScore -= 10;
        recommendations.push('Water your plant soon!');
      } else if (soilMoisture > 85) {
        insights.push({ title: 'Overwatering Alert:', text: 'Soil moisture is very high. Reduce watering to prevent root rot.', type: 'alert' });
        healthScore -= 8;
      } else {
        recommendations.push('Soil moisture is good. Continue monitoring.');
      }
    }

    // Rule 4: Light Intensity Check
    if (light !== null) {
      if (light < 3500) {
        insights.push({ title: 'Light Level:', text: 'Light intensity is low. Consider moving to a brighter spot or using a grow light.', type: 'info' });
        healthScore -= 5;
      } else if (light > 5500) {
        insights.push({ title: 'Light Level:', text: 'Light intensity is high. Ensure plant is not getting scorched.', type: 'info' });
        healthScore -= 3;
      } else {
        recommendations.push('Light conditions are good.');
      }
    }

    // Rule 5: Soil pH Check
    if (soilPh !== null) {
      if (soilPh < 6.0) {
        insights.push({ title: 'Soil pH Alert:', text: 'Soil pH is low. Consider adjusting to a more neutral range.', type: 'alert' });
        healthScore -= 7;
        recommendations.push('Adjust soil pH towards neutral (6.0-7.0).');
      } else if (soilPh > 7.0) {
        insights.push({ title: 'Soil pH Alert:', text: 'Soil pH is high. Consider adjusting to a more neutral range.', type: 'alert' });
        healthScore -= 7;
        recommendations.push('Adjust soil pH towards neutral (6.0-7.0).');
      } else {
        recommendations.push('Soil pH is within optimal range.');
      }
    }

    // Rule 6: Nutrient Level Check
    if (nutrientLevel !== null) {
      if (nutrientLevel < 500) {
        insights.push({ title: 'Nutrient Deficiency:', text: 'Nutrient level is low. Consider fertilizing your plant.', type: 'action' });
        healthScore -= 8;
        recommendations.push('Provide a balanced liquid fertilizer.');
      } else if (nutrientLevel > 900) {
        insights.push({ title: 'Nutrient Excess:', text: 'Nutient level is high. Consider flushing soil to prevent nutrient burn.', type: 'alert' });
        healthScore -= 5;
      } else {
        recommendations.push('Nutrient levels are adequate.');
      }
    }

    // Rule 7: Soil Fertility (Text-based, but also affects score)
    if (soilFertility === 'Low') {
      insights.push({ title: 'Soil Fertility Alert:', text: 'Soil fertility is low. Consider adding fertilizer.', type: 'action' });
      healthScore -= 7;
      recommendations.push('Consider fertilizing your plant.');
    } else if (soilFertility === 'Fair') {
      insights.push({ title: 'Soil Fertility:', text: 'Soil fertility is fair. Monitor or lightly fertilize.', type: 'info' });
      healthScore -= 3;
    } else {
      recommendations.push('Soil fertility is optimal.');
    }

    // Rule 8: Last Watered Check
    if (lastWateredDays !== null) {
      if (lastWateredDays >= 3 && soilMoisture < 60) {
        insights.push({ title: 'Watering Reminder:', text: `It's been ${lastWateredDays} days since last watered. Check soil moisture again.`, type: 'info' });
      }
      recommendations.push('Establish a consistent watering schedule.');
    }


    // Determine overall health status based on score
    healthScore = Math.max(0, healthScore);
    if (healthScore < 50) {
      plantHealthStatus = 'Critical! 🔴';
    } else if (healthScore < 70) {
      plantHealthStatus = 'Needs Attention! 🟠';
    } else if (healthScore < 90) {
      plantHealthStatus = 'Good. 🟡';
    } else {
      plantHealthStatus = 'Excellent! 🟢';
    }

    insights.unshift({ title: 'Overall Plant Health:', text: `Current status: ${plantHealthStatus} (Health Score: ${healthScore}%)`, type: 'summary' });
    
    // Add recommendations
    if (recommendations.length > 0) {
      insights.push({ title: 'General Recommendations:', list: recommendations, type: 'recommendation' });
    } else {
      insights.push({ title: 'General Recommendations:', text: 'No specific recommendations at this time. Your plant is doing great!', type: 'recommendation' });
    }

    return insights;
  };

  // --- Data Fetching for Parameters ---
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setLoadingParameters(true);
        setErrorParameters(null);

        const apiUrl = 'http://localhost:3001/api/dashboard/sensor-data';
        console.log(`Insights: Fetching sensor data from: ${apiUrl}`);
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
            setPlantParameters(data);
            console.log("Insights: Successfully fetched sensor data:", data);
        } else {
            console.warn("Insights: Fetched data is empty or not in expected format, using placeholder.");
            setPlantParameters(generatePlaceholderData());
        }
      } catch (e) {
        console.error("Insights: Error fetching sensor data:", e);
        setErrorParameters("Failed to load live plant data for insights. Displaying sample data.");
        setPlantParameters(generatePlaceholderData());
      } finally {
        setLoadingParameters(false);
      }
    };

    fetchSensorData();
    const intervalId = setInterval(fetchSensorData, 5000); 

    return () => clearInterval(intervalId); 
  }, []);

  // --- AI Chatbot Logic ---
  const handleChatSend = async () => {
    if (chatInput.trim() === '') return;

    const userMessage = { role: 'user', text: chatInput };
    setChatHistory((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    try {
      const prompt = `User asks: "${chatInput}". Respond as a helpful and knowledgeable plant expert chatbot. Keep your response concise and directly answer the question.`;
      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      };

      const apiKey = "AIzaSyDXfA6a2yQDSiWOXOui2TQl6dyvFIuQMns"; 
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
        try {
            text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            const parsedText = JSON.parse(text);
            if (parsedText && parsedText.response) {
                aiResponseText = parsedText.response;
            } else {
                aiResponseText = text;
            }
        } catch (parseError) {
            aiResponseText = text;
        }
      }

      setChatHistory((prev) => [...prev, { role: 'ai', text: aiResponseText }]);
    } catch (error) {
      console.error('Insights: Error fetching chat response:', error);
      setChatHistory((prev) => [...prev, { role: 'ai', text: 'Error: Could not connect to the AI service.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Effect for auto-scrolling chat history
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Generate insights based on the fetched/dummy plant parameters
  const dynamicInsights = generateInsights(plantParameters);

  // Prepare data for the Bar Chart. Recharts typically expects an array of objects
  const barChartData = [
    {
      name: 'Current Readings', 
      Temperature: plantParameters.find(p => p.name === 'Temperature')?.value.replace(/[^0-9.]/g, '') || 0,
      Humidity: plantParameters.find(p => p.name === 'Humidity')?.value.replace(/[^0-9.]/g, '') || 0,
      'Soil Moisture': plantParameters.find(p => p.name === 'Soil Moisture')?.value.replace(/[^0-9.]/g, '') || 0,
      'Light Intensity': plantParameters.find(p => p.name === 'Light Intensity')?.value.replace(/[^0-9.]/g, '') || 0,
      'Soil pH': plantParameters.find(p => p.name === 'Soil pH')?.value.replace(/[^0-9.]/g, '') || 0,
      'Nutrient Level': plantParameters.find(p => p.name === 'Nutrient Level')?.value.replace(/[^0-9.]/g, '') || 0,
    }
  ];

  // Prepare data for the Pie Chart based on Overall Plant Health
  const overallHealthInsight = dynamicInsights.find(insight => insight.title === 'Overall Plant Health:');
  let healthScore = 0;
  if (overallHealthInsight) {
    const healthScoreMatch = overallHealthInsight.text.match(/Health Score: (\d+)%/);
    healthScore = healthScoreMatch ? parseInt(healthScoreMatch[1]) : 0;
  }

  const pieChartData = [
    { name: 'Current Health', value: healthScore, color: 'var(--chart-color-1)' },
    { name: 'Room for Improvement', value: 100 - healthScore, color: 'var(--chart-color-4)' },
  ];

  return (
    <section className="section ml-chat-section">
      <h2 className="section-title">Plant Insights & AI Assistant</h2>

      {loadingParameters && <p className="loading-message">Loading live plant data for insights...</p>}
      {errorParameters && <p className="error-message">{errorParameters}</p>}

      <div className="ml-chat-content-wrapper">
        {/* Left Column: Insights and Charts (stacked vertically) */}
        <div className="insights-and-chart-wrapper">
          {/* Panel displaying ML-powered insights */}
          <div className="ml-insights-panel">
            <h3 className="panel-title">ML-Powered Insights</h3>
            <div className="insights-list">
              {dynamicInsights.map((insight, index) => (
                <div key={index} className="insight-card">
                  <h4 className="insight-title">{insight.title}</h4>
                  {insight.list ? (
                    <ul className="insight-list">
                      {insight.list.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="insight-text">{insight.text}</p>
                  )}
                  {insight.type === 'summary' && insight.text.includes('Score:') && (
                    <p className="insight-subtext">{insight.text.split('(Health Score:')[1]?.replace(')', '')}</p>
                  )}
                </div>
              ))}
              {dynamicInsights.length === 0 && !loadingParameters && !errorParameters && (
                  <p className="insight-text">No insights available. Check sensor data.</p>
              )}
            </div>
          </div>

          {/* Chart Panel */}
          <div className="chart-panel">
            {/* Bar Chart */}
            <h3 className="panel-title">Sensor Data Visualization</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={barChartData}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }} 
                  labelStyle={{ color: 'var(--text-primary)' }} 
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend />
                <Bar dataKey="Temperature" fill="var(--chart-color-1)" />
                <Bar dataKey="Humidity" fill="var(--chart-color-2)" />
                <Bar dataKey="Soil Moisture" fill="var(--chart-color-3)" />
                <Bar dataKey="Light Intensity" fill="var(--chart-color-4)" />
                <Bar dataKey="Soil pH" fill="var(--chart-color-5)" />
                <Bar dataKey="Nutrient Level" fill="var(--chart-color-6)" />
              </BarChart>
            </ResponsiveContainer>
             {barChartData.length === 0 && !loadingParameters && <p className="insight-text text-center mt-4">No data available for bar chart.</p>}

            {/* Pie Chart */}
            <h3 className="panel-title mt-8">Overall Health Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-background)', borderColor: 'var(--border-color)', borderRadius: '0.5rem' }} 
                  labelStyle={{ color: 'var(--text-primary)' }} 
                  itemStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value, name) => [`${value}%`, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            {pieChartData.length === 0 && !loadingParameters && <p className="insight-text text-center mt-4">No data available for pie chart.</p>}
          </div>
        </div>

        {/* Right Column: Chatbot Panel */}
        <div className="chatbot-panel">
          <h3 className="panel-title">Ask Your Plant AI</h3>
          <div ref={chatHistoryRef} className="chat-history">
            {chatHistory.length === 0 ? (
              <p className="chat-placeholder">Start a conversation!</p>
            ) : (
              chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  <p className="message-role">{msg.role === 'user' ? 'You:' : 'AI:'}</p>
                  <p className="message-text">{msg.text}</p>
                </div>
              ))
            )}
            {isTyping && (
              <div className="chat-message ai-message">
                <p className="message-role">AI is typing...</p>
              </div>
            )}
          </div>
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Type your question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleChatSend();
              }}
              disabled={isTyping}
            />
            <button
              onClick={handleChatSend}
              className="chat-send-button"
              disabled={isTyping}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
