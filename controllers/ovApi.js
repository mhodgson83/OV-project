require("dotenv").config();
const fetch = require("node-fetch");

async function fetchOvApiData(meter_id, granularity, start_date, end_date) {
  const baseUrl = "https://api.openvolt.com/v1/interval-data";
  const url = `${baseUrl}?meter_id=${meter_id}&granularity=${granularity}&start_date=${start_date}&end_date=${end_date}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      "x-api-key": process.env.OVAPIKEY,
    },
  });
  const data = await response.json();
  return data;
}

module.exports = fetchOvApiData;
