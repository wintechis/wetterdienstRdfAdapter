import { StationsResponse } from "./types.ts";
import { DataFactory, Writer } from "n3";
import { RDF_NAMESPACES } from "./config.ts";

const { namedNode, literal } = DataFactory;
const {
  BASE_STATION_URL,
  DWD_NAMESPACE,
  SOSA_NAMESPACE,
  RDF_NAMESPACE,
  RDFS_NAMESPACE,
  XSD_NAMESPACE,
  GEO_NAMESPACE
} = RDF_NAMESPACES;

/**
 * Converts stations response to RDF format
 * @param response The stations response from the API
 * @param contentType Optional content type for output format
 * @returns Promise containing RDF data as string
 */
export function stationsToRDF(
  response: StationsResponse, 
  contentType?: string
): Promise<string> {
  // Map content type to N3 format
  const format = mapContentTypeToFormat(contentType);
  const writer = new Writer({ 
    prefixes: { 
      dwd: DWD_NAMESPACE,
      sosa: SOSA_NAMESPACE,
      rdf: RDF_NAMESPACE,
      rdfs: RDFS_NAMESPACE,
      xsd: XSD_NAMESPACE,
      wgs: GEO_NAMESPACE,
    },
    format: format
  });
  
  // Add station data to writer
  response.stations.forEach(station => {
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
      namedNode(`${SOSA_NAMESPACE}Platform`)
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

    // Dataset information
    writer.addQuad(
      stationUri,
      namedNode(`${DWD_NAMESPACE}dataset`),
      literal(station.dataset)
    );
    
    // Time range
    writer.addQuad(
      stationUri,
      namedNode(`${DWD_NAMESPACE}start_date`),
      literal(station.start_date, namedNode(`${XSD_NAMESPACE}dateTime`))
    );
    
    writer.addQuad(
      stationUri,
      namedNode(`${DWD_NAMESPACE}end_date`),
      literal(station.end_date, namedNode(`${XSD_NAMESPACE}dateTime`))
    );
  });
  
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
