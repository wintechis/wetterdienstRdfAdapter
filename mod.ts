/**
 * WetterdienstRdfAdapter
 *
 * A library for accessing the Wetterdienst API and converting results to RDF.
 */

// Re-export public API
export { wetterdienstClient } from "./src/client.ts";
export { valuesToRDF } from "./src/values.ts";
export { stationsToRDF } from "./src/stations.ts";
export {
  createParameterPath,
  WeatherParameters,
} from "./src/parameter-types.ts";
export type * from "./src/types.ts";
