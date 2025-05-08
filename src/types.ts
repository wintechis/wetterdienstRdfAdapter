/**
 * Common type definitions for wetterdiensst API
 */

/**
 * Base parameters required for all station requests
 */
export interface RequestParams {
  provider: string;
  network: string;
  parameters: string;
  periods?: string;
}

/**
 * Filter options for stations
 */
export interface StationFilterParams {
  all?: boolean;
  station?: string | string[];
  name?: string;
  coordinates?: [number, number];
  rank?: number;
  distance?: number;
  bbox?: [number, number, number, number];
  sql?: string;
}

/**
 * Filter options for stations
 */
export interface ValuesFilterParams {
  station: string | string[];
  date?: string | string[];
  shape?: string;
  sql?: string;
}

/**
 * Provider information in response metadata
 */
export interface Provider {
  name_local: string;
  name_english: string;
  country: string;
  copyright: string;
  url: string;
}

/**
 * Producer information in response metadata
 */
export interface Producer {
  name: string;
  version: string;
  repository: string;
  documentation: string;
  doi: string;
}

/**
 * Metadata section of the response
 */
export interface ResponseMetadata {
  provider: Provider;
  producer: Producer;
}

/**
 * Weather station information
 */
export interface Station {
  resolution: string;
  dataset: string;
  station_id: string;
  start_date: string;
  end_date: string;
  latitude: number;
  longitude: number;
  height: number;
  name: string;
  state: string;
  distance?: number;
}

/**
 * Weather observation value
 */
export interface Value {
  station_id: string;
  resolution: string;
  dataset: string;
  parameter: string;
  date: string;
  value: number;
  quality: number;
}

/**
 * Response from the /stations endpoint
 */
export interface StationsResponse {
  metadata: ResponseMetadata;
  stations: Station[];
}

/**
 * Response from the /values endpoint
 */
export interface ValuesResponse {
  metadata: ResponseMetadata;
  stations: Station[];
  values: Value[];
}
