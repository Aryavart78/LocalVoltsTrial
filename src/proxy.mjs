import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Global variable to store the fetched data
let cachedData = null;

// Function to calculate the current and previous 5-minute interval times in ISO format
const date = () => {
    const current = new Date();
    const roundedMinutes = Math.floor(current.getMinutes() / 5) * 5; // Round to nearest 5-minute interval
    current.setMinutes(roundedMinutes);
    current.setSeconds(0);
    
    const to = new Date(current); // Copy of current time
    current.setMinutes(current.getMinutes() - 5); // Subtract 5 minutes for "from" time
    
    const from = current.toISOString().slice(0, -5) + "Z"; // Remove milliseconds
    const toTime = to.toISOString().slice(0, -5) + "Z"; // Remove milliseconds

    return { from, to: toTime };
};

// Function to fetch the data from Localvolts API
const fetchData = async () => {
    try {
        // Get time intervals from date function
        const { from, to } = date();
        
        // Log URL for debugging
        console.log(`Requesting data from Localvolts API with URL: https://api.localvolts.com/v1/customer/interval?NMI=*&from=${from}&to=${to}`);

        const response = await fetch(`https://api.localvolts.com/v1/customer/interval?NMI=*&from=${from}&to=${to}`, {
            headers: {
                "Authorization": "apikey 05eb3badd072de87926216b6ef83071f",
                "partner": "7863"
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get detailed error message
            console.error(`Error fetching data: ${response.status} ${response.statusText} - ${errorText}`);
            return null; // Return null if there's an error
        }

        // Parse the data and store it in the global variable
        const data = await response.json();
        cachedData = data;  // Store fetched data for future use
        console.log('Data fetched successfully');
    } catch (error) {
        console.error('Error:', error);
    }
};

// Check every minute if it's time to update the data
const checkAndFetchData = () => {
    const currentMinute = new Date().getMinutes();
    const currentSeconds = new Date().getSeconds();
    if (currentMinute % 5 === 0 && currentSeconds == 0) { // Check if current minute is divisible by 5
        fetchData();
    }
};

// Initial fetch and set interval to check every minute
fetchData();
setInterval(checkAndFetchData, 60 * 1000); // Check every 60 seconds

// Use the CORS middleware
app.use(cors());

// Define the /proxy endpoint
app.get('/proxy', (req, res) => {
    if (cachedData) {
        // Serve cached data if available
        return res.json(cachedData);
    } else {
        // If no data is available, send a message
        res.status(500).json({ error: "Data is unavailable. Please try again later." });
    }
});

app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
