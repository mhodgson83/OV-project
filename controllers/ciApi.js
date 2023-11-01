const fetch = require("node-fetch");

async function fetchCiApiData(from, to) {
  const baseUrl = "https://api.carbonintensity.org.uk/generation/";
  const url = `${baseUrl}from=${from}/to=${to}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  const data = await response.json();
  return data;
}

module.exports = fetchCiApiData;
