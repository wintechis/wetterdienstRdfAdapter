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
 * @returns Promise containing RDF data as string
 */
export function stationsToRDF(response: StationsResponse): Promise<string> {
  const writer = new Writer({ prefixes: { 
    dwd: DWD_NAMESPACE,
    sosa: SOSA_NAMESPACE,
    rdf: RDF_NAMESPACE,
    rdfs: RDFS_NAMESPACE,
    xsd: XSD_NAMESPACE,
    wgs: GEO_NAMESPACE,
  }});
  
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
    writer.end((error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
}