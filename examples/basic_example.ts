import { wetterdienstClient } from "../src/client.ts";
import { valuesToRDF } from "../src/values.ts";
import { WeatherParameters } from "../src/parameter-types.ts";

// Get stations near a location
const stations = await wetterdienstClient.getStations({
  provider: "dwd",
  network: "observation",
  parameters: WeatherParameters.SUNSHINE_DURATION_ANNUAL,
  periods: "recent",
  coordinates: [49.019533, 12.097487],
  rank: 5,
});

// Get values for a specific station
const values = await wetterdienstClient.getValues({
  provider: "dwd",
  network: "observation",
  parameters: WeatherParameters.SUNSHINE_DURATION_ANNUAL,
  periods: "recent",
  station: stations.stations[0].station_id,
  date: "2024-01-01",
});

// Convert values to RDF
const rdfData = await valuesToRDF(values);
console.log(rdfData);
