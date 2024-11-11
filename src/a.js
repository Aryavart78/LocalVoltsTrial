import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Function to log and retrieve the current date and time in ISO format
const getCurrentDateTime = () => {
    const currDateTime = new Date().toISOString(); // Format as YYYY-MM-DDTHH:MM:SSZ
    console.log("Current Date and Time:", currDateTime); // Log formatted date and time
    return currDateTime;
};

// Variables to store the latest and last fetched data
let latestData = null;
let lastFetchedData = null;

// Use the CORS middleware
app.use(cors());

// Function to fetch data from the Localvolts API
const fetchData = async () => {
    const currentDateTime = getCurrentDateTime(); // Get the current date and time

    try {
        const response = await fetch(`https://api.localvolts.com/v1/customer/interval?NMI=*&from=${currentDateTime}&to=${currentDateTime}`, {
            headers: {
                "Authorization": "apikey 05eb3badd072de87926216b6ef83071f",
                "partner": "7863"
            }
        });

        if (!response.ok) {
            console.error(`Error fetching data: ${response.status} ${response.statusText}`);
            return;
        }

        // Update both latest and last fetched data
        lastFetchedData = latestData; // Save the previous latest data
        latestData = await response.json(); // Update latest data
        console.log("Fetched data:", latestData);
    } catch (error) {
        console.error('Error:', error);
    }
};

// Function to check if the current minute is divisible by 5 and fetch data if so
const checkAndFetchData = () => {
    const currentMinute = new Date().getMinutes();
    if (currentMinute % 5 === 0) {
        fetchData();
    }
};

// Set interval to check the time every minute
setInterval(checkAndFetchData, 60 * 1000); // 1 minute in milliseconds

// Initial fetch to get data right away
fetchData();

// Define the /proxy endpoint
app.get('/proxy', (req, res) => {
    if (latestData) {
        res.json(latestData); // Send the latest data
    } else if (lastFetchedData) {
        res.json(lastFetchedData); // Send the last fetched data if latest is not available
    } else {
        res.status(503).json({ error: "Data not yet available. Please try again later." });
    }
});

app.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
