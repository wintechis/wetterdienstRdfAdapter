# Wetterdienst RDF Adapter

This library provides a Deno-based interface to the Wetterdienst API with RDF conversion capabilities.

## Features

- Type-safe client for the Wetterdienst API
- Convert weather data to RDF format
- Support for standard weather parameters and units
- Configurable retry logic for API requests

## Usage

```typescript
import { wetterdienstClient } from "./client.ts";
import { valuesToRDF } from "./values.ts";
import { WeatherParameters } from "./parameter-types.ts";

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
  station: "04104",
  date: "2024-01-01",
});

// Convert values to RDF
const rdfData = await valuesToRDF(values);
console.log(rdfData);
```
The above code outputs the following RDF data:

```Turtle
@prefix dwd: <https://opendata.dwd.de/#>.
@prefix sosa: <http://www.w3.org/ns/sosa/>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>.
@prefix qudt: <http://qudt.org/1.1/schema/qudt#>.
@prefix qudt_unit: <http://qudt.org/1.1/vocab/unit#>.

<https://wetterdienst.eobs.org/station/04104> a dwd:WeatherStation, sosa:Sensor;
    dwd:station_id "04104";
    dwd:station_name "Regensburg";
    wgs:lat "49.0425"^^xsd:float;
    wgs:long "12.1019"^^xsd:float;
    dwd:elevation "365"^^xsd:int;
    dwd:state "Bayern".
<https://wetterdienst.eobs.org/observation/04104_sunshine_duration_1704067200000> a dwd:Observation, sosa:Observation;
    dwd:observation_station_id "04104";
    sosa:madeBySensor <https://wetterdienst.eobs.org/station/04104>;
    sosa:hasResult [
  a qudt:QuantityValue;
  qudt:numericValue 1531.7;
  qudt:unit qudt_unit:Hour
].
```

## Development

```
# Run tests
deno test

# Run development server with watch mode
deno task dev
```