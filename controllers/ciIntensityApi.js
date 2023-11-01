const fetch = require("node-fetch");

const BASE_URL = "https://api.carbonintensity.org.uk/intensity/";

async function fetchCiIntensityData(from, to) {
  const url = `${BASE_URL}${from}/${to}`;
  const headers = {
    Accept: "application/json",
  };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        `Error with CI Intensity API: Status Code ${response.status}`,
        data
      ); // print status code and response
      throw new Error("Network response was not ok");
    }

    return data;
  } catch (error) {
    console.error("Error fetching CI Intensity Data:", error);
    throw error;
  }
}

module.exports = fetchCiIntensityData;
