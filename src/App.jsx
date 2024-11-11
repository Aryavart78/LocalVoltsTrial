import './App.css';
import { useEffect, useState } from 'react';

const App = () => {
  const url = 'http://localhost:5000/proxy';
  const [data, setData] = useState([]);
  const [colour, setColour] = useState("");
  const [timer, setTimer] = useState(20); // Countdown timer starting at 20 seconds

  const getData = async () => {
    try {
      const response = await fetch(url);  
      const result = await response.json();
      setData(result);

      if (result.some(item => item.quality === 'Exp')) {
        setColour('green');
      } else if (result.some(item => item.quality === 'Fsct')) {
        setColour('red');
      }
      
      setTimer(20); // Reset the timer after fetching data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getData();
    const intervalId = setInterval(getData, 20000); // Update every 20 seconds
    const timerIntervalId = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 20));
    }, 1000);

    return () => {
      clearInterval(intervalId);
      clearInterval(timerIntervalId);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Local Volts</h1>
      <p>Next refresh in: {timer} seconds</p>
      <table style={{ borderCollapse: 'collapse', width: '80%', border: '2px solid black' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>NMI</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Interval End</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Earnings Flex Up</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Costs Flex Up</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Quality</th>
          </tr>
        </thead>
        <tbody>
          {data.map((curr, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{curr.NMI}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{curr.intervalEnd}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{curr.earningsFlexUp} {curr.earningsFlexUnits}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{curr.costsFlexUp} {curr.costsFlexUnits}</td>
              <td style={{ border: '1px solid black', padding: '8px', textAlign: 'center' }}>
                <div style={{ width: '20px', height: '20px', backgroundColor: colour, margin: 'auto' }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
