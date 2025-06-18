import requests
import json
import time
import os

# --- Configuration ---
NODEJS_BACKEND_URL = "http://localhost:3001/api/hardware/sensor-update"
FAKE_DATA_DIR = "fake_sensor_data" # Relative path to your fake data folder
SEND_INTERVAL_SECONDS = 5 # Time to wait between sending each dataset

# --- Function to send data to the Node.js backend ---
def send_sensor_data(data_payload):
    """
    Sends a single sensor data payload as a POST request to the Node.js backend.
    """
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(NODEJS_BACKEND_URL, headers=headers, json=data_payload)
        response.raise_for_status() # Raises HTTPError for bad responses (4xx or 5xx)
        print(f"Successfully sent data: Temp={data_payload.get('temperature')}°C, Moisture={data_payload.get('soilMoisture')}% etc.")
        # print(f"Server response: {response.json()}") # Uncomment for detailed server response
    except requests.exceptions.RequestException as e:
        print(f"Error sending data: {data_payload}. Error: {e}")

# --- Main execution loop ---
if __name__ == "__main__":
    print(f"Starting to send fake sensor data to: {NODEJS_BACKEND_URL}")
    print(f"Reading data from: {os.path.join(os.getcwd(), FAKE_DATA_DIR)}/")

    # Get a list of all .json files in the fake data directory
    json_files = [f for f in os.listdir(FAKE_DATA_DIR) if f.endswith('.json')]
    json_files.sort() # Optional: send in alphabetical order for consistent cycling

    if not json_files:
        print(f"No .json files found in '{FAKE_DATA_DIR}'. Please create some fake sensor data files.")
        print("Exiting script.")
    else:
        print(f"Found {len(json_files)} data files: {json_files}")
        
        file_index = 0
        while True: # Infinite loop to continuously cycle through data
            filename = json_files[file_index]
            file_path = os.path.join(FAKE_DATA_DIR, filename)
            
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                
                print(f"\n--- Sending data from {filename} (Cycle: {file_index + 1}/{len(json_files)}) ---")
                send_sensor_data(data)
                
                # Move to the next file, or loop back to the first if we reached the end
                file_index = (file_index + 1) % len(json_files)
                
                # Wait for a few seconds before sending the next dataset
                time.sleep(SEND_INTERVAL_SECONDS) 
                
            except FileNotFoundError:
                print(f"Error: File not found at {file_path}. Skipping.")
                # To prevent getting stuck on a missing file, advance index
                file_index = (file_index + 1) % len(json_files)
                time.sleep(SEND_INTERVAL_SECONDS)
            except json.JSONDecodeError:
                print(f"Error: Invalid JSON in file {file_path}. Skipping.")
                # To prevent getting stuck on a bad JSON file, advance index
                file_index = (file_index + 1) % len(json_files)
                time.sleep(SEND_INTERVAL_SECONDS)
            except KeyboardInterrupt:
                print("\nScript terminated by user (Ctrl+C).")
                break # Exit the loop if user presses Ctrl+C
            except Exception as e:
                print(f"An unexpected error occurred with file {file_path}: {e}. Skipping.")
                file_index = (file_index + 1) % len(json_files)
                time.sleep(SEND_INTERVAL_SECONDS)

