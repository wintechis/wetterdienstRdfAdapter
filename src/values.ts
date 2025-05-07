import { ValuesResponse, Station, Value } from "./types.ts";
import { DataFactory, Writer } from "n3";
import { RDF_NAMESPACES } from "./config.ts";

const { namedNode, literal, quad } = DataFactory;
const {
  BASE_STATION_URL,
  BASE_OBSERVATION_URL,
  DWD_NAMESPACE,
  SOSA_NAMESPACE,
  GEO_NAMESPACE,
  RDF_NAMESPACE,
  XSD_NAMESPACE,
  QUDT_NAMESPACE,
  QUDT_UNIT_NAMESPACE
} = RDF_NAMESPACES;

  /**
   * Maps weather parameters to their appropriate units and datatypes
   */
  export interface ParameterUnitMapping {
    unit: string;
    unitSymbol: string;
    xsdDatatype: "decimal" | "float" | "integer" | "string" | "dateTime";
    conversionFactor?: number;
    description?: string;
  }

  export type WeatherParameterKey = 
  | "sunshine_duration"
  | "temperature_air_mean_2m"
  | "temperature_air_max_2m"
  | "temperature_air_min_2m"
  | "precipitation_height"
  | "precipitation_duration"
  | "wind_speed"
  | "wind_direction"
  | "wind_force_beaufort"
  | "pressure_air_site"
  | "cloud_cover_total"
  | "humidity"
  | string; // Allow for extension
  
  // Parameter to unit/datatype mapping
  const parameterMappings: Record<WeatherParameterKey, ParameterUnitMapping> = {
    // Time-based parameters
    "sunshine_duration": { 
      unit: `${QUDT_UNIT_NAMESPACE}Hour`, 
      unitSymbol: "h", 
      xsdDatatype: "decimal",
      conversionFactor: 1/3600 // Convert seconds to hours
    },
    
    // Temperature parameters
    "temperature_air_mean_2m": { 
      unit: `${QUDT_UNIT_NAMESPACE}DegreeCelsius`, 
      unitSymbol: "°C", 
      xsdDatatype: "float",
      description: "Mean air temperature measured at 2m height"
    },
    "temperature_air_max_2m": { 
      unit: `${QUDT_UNIT_NAMESPACE}DegreeCelsius`, 
      unitSymbol: "°C", 
      xsdDatatype: "float",
      description: "Max air temperature measured at 2m height"
    },
    "temperature_air_min_2m": { 
      unit: `${QUDT_UNIT_NAMESPACE}DegreeCelsius`, 
      unitSymbol: "°C", 
      xsdDatatype: "float",
      description: "Min air temperature measured at 2m height"
    },
    
    // Precipitation parameters
    "precipitation_height": { 
      unit: `${QUDT_UNIT_NAMESPACE}Millimeter`, 
      unitSymbol: "mm", 
      xsdDatatype: "decimal"
    },
    "precipitation_duration": { 
      unit: `${QUDT_UNIT_NAMESPACE}Second`, 
      unitSymbol: "s", 
      xsdDatatype: "integer"
    },
    
    // Wind parameters
    "wind_speed": { 
      unit: `${QUDT_UNIT_NAMESPACE}MeterPerSecond`, 
      unitSymbol: "m/s", 
      xsdDatatype: "float"
    },
    "wind_direction": { 
      unit: `${QUDT_UNIT_NAMESPACE}DegreeAngle`, 
      unitSymbol: "°", 
      xsdDatatype: "integer" 
    },
    "wind_force_beaufort": { 
      unit: `${QUDT_UNIT_NAMESPACE}Beaufort`, 
      unitSymbol: "bft", 
      xsdDatatype: "integer"
    },
    
    // Pressure parameters
    "pressure_air_site": { 
      unit: `${QUDT_UNIT_NAMESPACE}Hectopascal`, 
      unitSymbol: "hPa", 
      xsdDatatype: "float"
    },
    
    // Cloudiness/humidity (fraction parameters)
    "cloud_cover_total": { 
      unit: `${QUDT_UNIT_NAMESPACE}Percent`, 
      unitSymbol: "%", 
      xsdDatatype: "integer" 
    },
    "humidity": { 
      unit: `${QUDT_UNIT_NAMESPACE}Percent`, 
      unitSymbol: "%", 
      xsdDatatype: "integer"
    }
  };
  
  // Default mapping for unknown parameters
  const defaultMapping: ParameterUnitMapping = {
    unit: `${QUDT_UNIT_NAMESPACE}Dimensionless`,
    unitSymbol: "-",
    xsdDatatype: "float"
  };  

/**
 * Converts a station to RDF quads
 */
function stationToRDF(station: Station, writer: Writer): void {
  const stationUri = namedNode(`${BASE_STATION_URL}${station.station_id}`);
  
  // Type definition
  writer.addQuad(
    stationUri,
    namedNode(`${RDF_NAMESPACE}type`),
    namedNode(`${DWD_NAMESPACE}WeatherStation`)
  );
  writer.addQuad(
    stationUri,
    namedNode(`${RDF_NAMESPACE}type`),
    namedNode(`${SOSA_NAMESPACE}Sensor`)
  );
  
  // Station properties
  writer.addQuad(
    stationUri,
    namedNode(`${DWD_NAMESPACE}station_id`),
    literal(station.station_id)
  );
  
  writer.addQuad(
    stationUri,
    namedNode(`${DWD_NAMESPACE}station_name`),
    literal(station.name)
  );
  
  // Geo coordinates
  writer.addQuad(
    stationUri,
    namedNode(`${GEO_NAMESPACE}lat`),
    literal(station.latitude.toString(), namedNode(`${XSD_NAMESPACE}float`))
  );
  
  writer.addQuad(
    stationUri,
    namedNode(`${GEO_NAMESPACE}long`),
    literal(station.longitude.toString(), namedNode(`${XSD_NAMESPACE}float`))
  );
  
  // Elevation (height)
  writer.addQuad(
    stationUri,
    namedNode(`${DWD_NAMESPACE}elevation`),
    literal(station.height.toString(), namedNode(`${XSD_NAMESPACE}int`))
  );
  
  // State information
  if (station.state) {
    writer.addQuad(
      stationUri,
      namedNode(`${DWD_NAMESPACE}state`),
      literal(station.state)
    );
  }
}

/**
 * Converts a weather value to RDF quads
 */
function valueToRDF(value: Value, writer: Writer): void {
  const obsId = `${value.station_id}_${value.parameter}_${new Date(value.date).getTime()}`;
  const observationUri = namedNode(`${BASE_OBSERVATION_URL}${obsId}`);
  const stationUri = namedNode(`${BASE_STATION_URL}${value.station_id}`);

  // Get parameter mapping information
  const parameterInfo = parameterMappings[value.parameter] || defaultMapping;
  
  // Convert value if necessary
  const convertedValue = parameterInfo.conversionFactor 
    ? value.value * parameterInfo.conversionFactor 
    : value.value;

  // Type definition for observation
  writer.addQuad(
    observationUri,
    namedNode(`${RDF_NAMESPACE}type`),
    namedNode(`${DWD_NAMESPACE}Observation`)
  );
  writer.addQuad(
    observationUri,
    namedNode(`${RDF_NAMESPACE}type`),
    namedNode(`${SOSA_NAMESPACE}Observation`)
  );
  
  // Link to station
  writer.addQuad(
    observationUri,
    namedNode(`${DWD_NAMESPACE}observation_station_id`),
    literal(value.station_id)
  );
  
  // Add link back to station
  writer.addQuad(
    observationUri,
    namedNode(`${SOSA_NAMESPACE}madeBySensor`),
    stationUri
  );

  // Add result with unit and datatype
  writer.addQuad(quad(
    observationUri,
    namedNode(`${SOSA_NAMESPACE}hasResult`),
    writer.blank([
      {
        predicate: namedNode(`${RDF_NAMESPACE}type`),
        object: namedNode(`${QUDT_NAMESPACE}QuantityValue`)
      }, 
      {
        predicate: namedNode(`${QUDT_NAMESPACE}numericValue`),
        object: literal(
          convertedValue.toString(), 
          namedNode(`${XSD_NAMESPACE}${parameterInfo.xsdDatatype}`)
        )
      },
      {
        predicate: namedNode(`${QUDT_NAMESPACE}unit`),
        object: namedNode(parameterInfo.unit)
      }
    ])
  ));
}

/**
 * Converts full values response to RDF
 * @param response The values response from the API
 * @param contentType Optional content type for output format
 * @returns Promise containing RDF data as string
 */
export function valuesToRDF(
  response: ValuesResponse, 
  contentType?: string
): Promise<string> {
  // Map content type to N3 format
  const format = mapContentTypeToFormat(contentType);
  
  const writer = new Writer({ 
    prefixes: { 
      dwd: DWD_NAMESPACE,
      sosa: SOSA_NAMESPACE,
      rdf: RDF_NAMESPACE,
      xsd: XSD_NAMESPACE,
      wgs: GEO_NAMESPACE,
      qudt: QUDT_NAMESPACE,
      qudt_unit: QUDT_UNIT_NAMESPACE
    },
    format: format
  });
  
  // Add station data
  response.stations.forEach(station => stationToRDF(station, writer));
  
  // Add observation values
  response.values.forEach(value => valueToRDF(value, writer));
  
  // Return serialized RDF
  return new Promise<string>((resolve, reject) => {
    writer.end((error: Error | null, result: string | PromiseLike<string>) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}

/**
 * Maps HTTP content type to N3 writer format
 * @param contentType HTTP content type
 * @returns N3 format string
 */
function mapContentTypeToFormat(contentType?: string): string | undefined {
  if (!contentType) return undefined; // Default to Turtle
  
  // Convert to lowercase for case-insensitive comparison
  const type = contentType.toLowerCase();
  
  switch (true) {
    case type.includes('application/n-triples'):
      return 'N-Triples';
    case type.includes('application/n-quads'):
      return 'N-Quads';
    case type.includes('application/trig'):
      return 'TriG';
    case type.includes('text/n3'):
      return 'N3';
    case type.includes('application/rdf+xml'):
      return 'RDF/XML'; // Note: N3.js might not directly support this
    case type.includes('application/json'):
    case type.includes('application/ld+json'):
      return 'application/ld+json'; // JSON-LD format
    default:
      return 'Turtle'; // Default to Turtle for text/turtle and other types
  }
}
