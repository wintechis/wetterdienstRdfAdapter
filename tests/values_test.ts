import { assert, assertEquals, assertExists } from "jsr:@std/assert";
import { valuesToRDF } from "../src/values.ts";

// Mock data for testing
const mockStation = {
  resolution: "hourly",
  dataset: "temperature_air",
  station_id: "01234",
  start_date: "2024-01-01",
  end_date: "2024-01-02",
  latitude: 52.5200,
  longitude: 13.4050,
  height: 100,
  name: "Berlin Mitte",
  state: "Berlin"
};

const mockValue = {
  station_id: "01234",
  resolution: "hourly",
  dataset: "temperature_air",
  parameter: "temperature_air_mean_2m",
  date: "2024-01-01T12:00:00",
  value: 21.5,
  quality: 1
};

const mockResponse = {
  metadata: {
    provider: {
      name_local: "Test Provider",
      name_english: "Test Provider",
      country: "DE",
      copyright: "Test Copyright",
      url: "https://example.com"
    },
    producer: {
      name: "Test Producer",
      version: "1.0.0",
      repository: "https://github.com/test/repo",
      documentation: "https://docs.example.com",
      doi: "10.1234/test"
    }
  },
  stations: [mockStation],
  values: [mockValue]
};

Deno.test("RDF conversion - should convert weather values to RDF", async () => {
  const rdf = await valuesToRDF(mockResponse);
  
  assertExists(rdf);
  assertEquals(typeof rdf, "string");
  
  // Test that the RDF contains expected triples
  const expectedStrings = [
    `<https://wetterdienst.eobs.org/station/01234>`,
    `<https://wetterdienst.eobs.org/observation/01234_temperature_air_mean_2m_`,
    `"21.5"^^xsd:float`,
    `qudt_unit:DegreeCelsius`,
  ];
  
  for (const expected of expectedStrings) {
    assert(rdf.includes(expected), `RDF should contain ${expected}`);
  }
});

// Add more tests for client.ts functionality
// Considers using a fetch mock library to test API calls