# Wetterdienst RDF Adapter

This library provides a Deno-based interface to the [Wetterdienst API](https://wetterdienst.eobs.org/) with RDF conversion capabilities.

## Usage

This library is can be used with Deno or via its REST API.

### Using the API

The REST API is available at `https://wetterdienst-rdf-adapter.deno.dev`.

#### Response Formats

The API supports content negotiation through the `Accept` header:

- Root endpoint (`/`): Only supports `application/json`
- Stations (`/stations`) and Values (`/values`) endpoints support:
  - `text/turtle` (default format when no specific format is requested)
  - `application/n-triples`
  - `application/n-quads`
  - `application/trig`
  - `text/n3`
  - `application/ld+json`
  - `application/json`

The `text/turtle` format is used as the default when no specific format is requested or when an unsupported format is specified.

#### Example Requests

```console
foo@bar:~$ curl -X GET -H "Accept: text/turtle" \
"https://wetterdienst-rdf-adapter.deno.dev/stations?provider=dwd&network=observation&parameters=annual%2Fclimate_summary%2Fsunshine_duration&periods=recent&coordinates=49.019533%2C12.097487&rank=1"
```

To query the values for annual sunshine duration observed by a given station `04104` in the year 2024 you can use the following URL:

```console
foo@bar:~$ curl -X GET -H "Accept: text/turtle" \
"https://wetterdienst-rdf-adapter.deno.dev/values?provider=dwd&network=observation&parameters=annual%2Fclimate_summary%2Fsunshine_duration&periods=recent&station=04104&date=2024-01-01"
```

### Using the Library

To use the library in your own Deno project first add it via

- deno: `deno add jsr:@wintechis/wetterdienst-rdf-adapter`
- npm: `npx jsr add @wintechis/wetterdienst-rdf-adapter`
- yarn: `yarn add jsr:@wintechis/wetterdienst-rdf-adapter`
- pnpm: `pnpm i jsr:@wintechis/wetterdienst-rdf-adapter`
- bun: `bunx jsr add @wintechis/wetterdienst-rdf-adapter`

Then you can use the library as follows:

```typescript
import {
  valuesToRDF,
  WeatherParameters,
  wetterdienstClient,
} from "@wintechis/wetterdienst-rdf-adapter";

// Get stations near a location
const stations = await wetterdienstClient.getStations({
  provider: "dwd",
  network: "observation",
  parameters: WeatherParameters.SUNSHINE_DURATION_ANNUAL,
  periods: "recent",
  coordinates: [49.019533, 12.097487],
  rank: 1,
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
