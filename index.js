const express = require("express");
const bodyParser = require("body-parser");
const fetchOvApiData = require("./controllers/ovApi");
const fetchCiApiData = require("./controllers/ciApi");
const fetchCiIntensityData = require("./controllers/ciIntensityApi");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/results", async (req, res) => {
  const METER_ID = req.body.meterId;
  const GRANULARITY = req.body.granularity;
  const START_DATE = req.body.startDate;
  const END_DATE = req.body.endDate;

  try {
    const ovData = await fetchOvApiData(
      METER_ID,
      GRANULARITY,
      START_DATE,
      END_DATE
    );

    if (!ovData || !Array.isArray(ovData.data)) {
      throw new Error("Unexpected data structure from OV API");
    }

    const totalConsumption = ovData.data.reduce(
      (sum, item) => sum + parseFloat(item.consumption),
      0
    );

    const ciData = await fetchCiApiData(START_DATE, END_DATE);
    if (!ciData || !Array.isArray(ciData.data)) {
      throw new Error("Unexpected data structure from CI API");
    }

    let fuelMixKWh = {};
    ciData.data.forEach((interval, index) => {
      const consumptionForInterval = parseFloat(ovData.data[index].consumption);
      interval.generationmix.forEach((mix) => {
        if (!fuelMixKWh[mix.fuel]) {
          fuelMixKWh[mix.fuel] = 0;
        }
        fuelMixKWh[mix.fuel] += (mix.perc / 100) * consumptionForInterval;
      });
    });

    let monthlyFuelMixPerc = {};
    for (const fuel in fuelMixKWh) {
      monthlyFuelMixPerc[fuel] = (
        (fuelMixKWh[fuel] / totalConsumption) *
        100
      ).toFixed(3);
    }

    let totalIntensityConsumption = 0;
    for (let i = 0; i < ovData.data.length - 1; i++) {
      const from = ovData.data[i].start_interval;
      const to = ovData.data[i + 1].start_interval;

      const intensityData = await fetchCiIntensityData(from, to);
      const actualIntensity = intensityData.data[0].intensity.actual;
      const consumptionForInterval = parseFloat(ovData.data[i].consumption);
      const intensityConsumptionProduct =
        actualIntensity * consumptionForInterval;

      totalIntensityConsumption += intensityConsumptionProduct;
    }

    const totalIntensityInKilograms = totalIntensityConsumption / 1000;

    res.render("results", {
      totalConsumption: totalConsumption,
      monthlyFuelMixPerc: monthlyFuelMixPerc,
      totalIntensityInKilograms: totalIntensityInKilograms,
    });
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).send("Error processing data");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
