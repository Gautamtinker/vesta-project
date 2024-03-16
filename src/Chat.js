import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Chart from "chart.js/auto";

const Chat = () => {
  const [requestData, setRequestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRequests, setTotalRequests] = useState(0);
  const [uniqueDepartments, setUniqueDepartments] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://checkinn.co/api/v1/int/requests"
        );
        console.log(response.data.requests);
        setRequestData(response.data.requests);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (requestData.length > 0) {
      // Calculate total requests
      const total = requestData.length;
      setTotalRequests(total);

      // Extract unique department names
      const departments = requestData.reduce((acc, request) => {
        const departmentName = request.desk.name;
        if (!acc.includes(departmentName)) {
          acc.push(departmentName);
        }
        return acc;
      }, []);
      setUniqueDepartments(departments);

      if (chartInstance.current) {
        chartInstance.current.destroy(); // Destroy previous chart instance
      }

      // Count the number of requests per hotel
      const requestsPerHotel = {};
      requestData.forEach((request) => {
        const hotelName = request.hotel.shortname;
        if (requestsPerHotel[hotelName]) {
          requestsPerHotel[hotelName]++;
        } else {
          requestsPerHotel[hotelName] = 1;
        }
      });

      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "line", // Change type to "line"
        data: {
          labels: Object.keys(requestsPerHotel), // Hotel names as labels
          datasets: [
            {
              label: "Number of Requests",
              data: Object.values(requestsPerHotel), // Number of requests as data
              backgroundColor: "rgba(75, 192, 192, 0.4)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 7,
              fill: false, // Ensure data is not filled
            },
          ],
        },
        options: {
          scales: {
            y: {
              ticks: {
                min: 0,
                stepSize: 2,
                max: 8,
              },
            },
          },
        },
      });
    }
  }, [requestData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div style={{ width: "80%", maxWidth: "600px", marginBottom: "20px" }}>
        <h2>Request Per Hotel</h2>
        <canvas ref={chartRef} />
      </div>
      <div>
        <p>Total Requests: {totalRequests}</p>
        <p>List of Unique Departments:</p>
        <ul>
          {uniqueDepartments.map((department, index) => (
            <li key={index}>{department}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Chat;
