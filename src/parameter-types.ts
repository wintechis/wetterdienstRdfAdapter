/**
 * Weather parameter resolution
 */
export type Resolution =
  | "1_minute"
  | "5_minutes"
  | "10_minutes"
  | "hourly"
  | "subdaily"
  | "daily"
  | "monthly"
  | "annual";

/**
 * Dataset categories per resolution
 */
export type DatasetByResolution = {
  "1_minute": "precipitation";
  "5_minutes": "precipitation";
  "10_minutes":
    | "precipitation"
    | "solar"
    | "temperature_air"
    | "temperature_extreme"
    | "wind"
    | "wind_extreme";
  "hourly":
    | "cloud_type"
    | "cloudiness"
    | "dew_point"
    | "moisture"
    | "precipitation"
    | "pressure"
    | "solar"
    | "sun"
    | "temperature_air"
    | "temperature_soil"
    | "visibility"
    | "weather_phenomena"
    | "wind"
    | "wind_extreme"
    | "wind_synoptic"
    | "urban_precipitation"
    | "urban_pressure"
    | "urban_sun"
    | "urban_temperature_air"
    | "urban_temperature_soil"
    | "urban_wind";
  "subdaily":
    | "cloudiness"
    | "moisture"
    | "pressure"
    | "soil"
    | "temperature_air"
    | "visibility"
    | "wind"
    | "wind_extreme";
  "daily":
    | "climate_summary"
    | "precipitation_more"
    | "solar"
    | "temperature_soil"
    | "water_equivalent"
    | "weather_phenomena"
    | "weather_phenomena_more";
  "monthly": "climate_summary" | "precipitation_more" | "weather_phenomena";
  "annual": "climate_summary" | "precipitation_more" | "weather_phenomena";
};

/**
 * Parameters by dataset
 */
export type ParametersByDataset = {
  "precipitation":
    | "precipitation_height"
    | "precipitation_height_droplet"
    | "precipitation_height_rocker"
    | "precipitation_index"
    | "precipitation_duration"
    | "precipitation_form";
  "solar":
    | "radiation_sky_short_wave_diffuse"
    | "radiation_global"
    | "sunshine_duration"
    | "radiation_sky_long_wave"
    | "end_of_interval"
    | "sun_zenith_angle"
    | "true_local_time";
  "temperature_air":
    | "pressure_air_site"
    | "temperature_air_mean_2m"
    | "temperature_air_mean_0_05m"
    | "humidity"
    | "temperature_dew_point_mean_2m";
  "temperature_extreme":
    | "temperature_air_max_2m"
    | "temperature_air_max_0_05m"
    | "temperature_air_min_2m"
    | "temperature_air_min_0_05m";
  "wind": "wind_speed" | "wind_direction" | "wind_force_beaufort";
  "wind_extreme":
    | "wind_gust_max"
    | "wind_speed_min"
    | "wind_speed_rolling_mean_max"
    | "wind_direction_gust_max"
    | "wind_gust_max_last_3h"
    | "wind_gust_max_last_6h";
  "cloud_type":
    | "cloud_cover_total"
    | "cloud_cover_total_index"
    | "cloud_type_layer1"
    | "cloud_type_layer1_abbreviation"
    | "cloud_height_layer1"
    | "cloud_cover_layer1"
    | "cloud_type_layer2"
    | "cloud_type_layer2_abbreviation"
    | "cloud_height_layer2"
    | "cloud_cover_layer2"
    | "cloud_type_layer3"
    | "cloud_type_layer3_abbreviation"
    | "cloud_height_layer3"
    | "cloud_cover_layer3"
    | "cloud_type_layer4"
    | "cloud_type_layer4_abbreviation"
    | "cloud_height_layer4"
    | "cloud_cover_layer4";
  "cloudiness":
    | "cloud_cover_total_index"
    | "cloud_cover_total"
    | "cloud_density";
  "dew_point": "temperature_air_mean_2m" | "temperature_dew_point_mean_2m";
  "moisture":
    | "humidity_absolute"
    | "pressure_vapor"
    | "temperature_wet_mean_2m"
    | "pressure_air_site"
    | "temperature_air_mean_2m"
    | "humidity"
    | "temperature_dew_point_mean_2m"
    | "temperature_air_mean_0_05m";
  "pressure": "pressure_air_sea_level" | "pressure_air_site";
  "sun": "sunshine_duration";
  "temperature_soil":
    | "temperature_soil_mean_0_02m"
    | "temperature_soil_mean_0_05m"
    | "temperature_soil_mean_0_1m"
    | "temperature_soil_mean_0_2m"
    | "temperature_soil_mean_0_5m"
    | "temperature_soil_mean_1m";
  "visibility": "visibility_range_index" | "visibility_range";
  "weather_phenomena":
    | "weather"
    | "weather_text"
    | "count_weather_type_fog"
    | "count_weather_type_thunder"
    | "count_weather_type_storm_strong_wind"
    | "count_weather_type_storm_stormier_wind"
    | "count_weather_type_dew"
    | "count_weather_type_glaze"
    | "count_weather_type_ripe"
    | "count_weather_type_sleet"
    | "count_weather_type_hail";
  "wind_synoptic": "wind_speed" | "wind_direction";
  "urban_precipitation": "precipitation_height";
  "urban_pressure": "pressure_air_sea_level" | "pressure_air_site";
  "urban_sun": "sunshine_duration";
  "urban_temperature_air": "temperature_air_mean_2m" | "humidity";
  "urban_temperature_soil":
    | "temperature_soil_mean_0_05m"
    | "temperature_soil_mean_0_1m"
    | "temperature_soil_mean_0_2m"
    | "temperature_soil_mean_0_5m"
    | "temperature_soil_mean_1m";
  "urban_wind": "wind_speed" | "wind_direction";
  "soil": "temperature_soil_mean_0_05m";
  "climate_summary":
    | "wind_gust_max"
    | "wind_speed"
    | "precipitation_height"
    | "precipitation_form"
    | "sunshine_duration"
    | "snow_depth"
    | "cloud_cover_total"
    | "pressure_vapor"
    | "pressure_air_site"
    | "temperature_air_mean_2m"
    | "humidity"
    | "temperature_air_max_2m"
    | "temperature_air_min_2m"
    | "temperature_air_min_0_05m"
    | "temperature_air_max_2m_mean"
    | "temperature_air_min_2m_mean"
    | "wind_force_beaufort"
    | "precipitation_height_max";
  "precipitation_more":
    | "precipitation_height"
    | "precipitation_form"
    | "snow_depth"
    | "snow_depth_new"
    | "precipitation_height_max";
  "water_equivalent":
    | "snow_depth_excelled"
    | "snow_depth"
    | "water_equivalent_snow_depth"
    | "water_equivalent_snow_depth_excelled";
  "weather_phenomena_more":
    | "count_weather_type_sleet"
    | "count_weather_type_hail"
    | "count_weather_type_fog"
    | "count_weather_type_thunder";
};

/**
 * Helper type to validate parameter combinations
 */
export type ParameterPath<
  R extends Resolution,
  D extends DatasetByResolution[R],
  P extends ParametersByDataset[D],
> = `${R}/${D}/${P}`;

/**
 * Creates a type-safe parameter path
 */
export function createParameterPath<
  R extends Resolution,
  D extends DatasetByResolution[R],
  P extends ParametersByDataset[D],
>(resolution: R, dataset: D, parameter: P): ParameterPath<R, D, P> {
  return `${resolution}/${dataset}/${parameter}`;
}

/**
 * Pre-defined parameter paths for common weather data
 */
export const WeatherParameters = {
  SUNSHINE_DURATION_ANNUAL: "annual/climate_summary/sunshine_duration" as const,
  SUNSHINE_DURATION_DAILY: "daily/climate_summary/sunshine_duration" as const,
  SUNSHINE_DURATION_HOURLY: "hourly/sun/sunshine_duration" as const,
  TEMPERATURE_MEAN_ANNUAL:
    "annual/climate_summary/temperature_air_mean_2m" as const,
  PRECIPITATION_ANNUAL: "annual/climate_summary/precipitation_height" as const,
  CLOUD_COVER_DAILY: "daily/climate_summary/cloud_cover_total" as const,
};
