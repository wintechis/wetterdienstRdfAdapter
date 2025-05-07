import { Application, Context, Router } from "https://deno.land/x/oak/mod.ts";
import { stationsToRDF, valuesToRDF, wetterdienstClient } from "./mod.ts";
import { parseAcceptHeader } from "src/format-utils.ts";

// Create application
const app = new Application();
const router = new Router();

// Logger middleware
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.request.method} ${ctx.request.url.pathname} - ${ms}ms`);
});

// CORS middleware
app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Accept",
  );

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204; // No content
    return;
  }

  await next();
});

/**
 * Determines response format based on Accept header priority
 * @param ctx The context containing request headers
 * @returns Format type and content type
 */
function determineResponseFormat(ctx: Context): {
  format: "json" | "rdf";
  contentType: string;
} {
  const acceptHeader = ctx.request.headers.get("Accept") || "";

  // If no Accept header, default to JSON
  if (!acceptHeader) {
    return { format: "json", contentType: "application/json" };
  }

  // Parse and sort media types by quality parameter
  const mediaTypes = parseAcceptHeader(acceptHeader);

  // RDF media types that N3 library supports
  const rdfMediaTypes = [
    "text/turtle",
    "application/n-triples",
    "application/n-quads",
    "application/trig",
    "text/n3",
    "application/ld+json",
  ];

  // Check each media type in priority order
  for (const mediaType of mediaTypes) {
    // Check for JSON first
    if (mediaType === "application/json") {
      return { format: "json", contentType: "application/json" };
    }

    // Then check for supported RDF formats
    if (rdfMediaTypes.includes(mediaType)) {
      return { format: "rdf", contentType: mediaType };
    }

    // Special case for any JSON type or any type
    if (mediaType.endsWith("+json")) {
      return { format: "json", contentType: "application/json" };
    }
  }

  // Default to turtle if nothing else matches
  return { format: "rdf", contentType: "text/turtle" };
}

/**
 * GET /stations endpoint
 * Query parameters:
 * - provider (default: "dwd")
 * - network (default: "observation")
 * - parameters (required)
 * - periods (default: "recent")
 * - coordinates (optional, format: "lat,lon")
 * - rank (optional, default: 5)
 * - format (optional, default: "json", can be "rdf")
 */
router.get("/stations", async (ctx) => {
    try {
      const url = ctx.request.url;
      const provider = url.searchParams.get("provider") || "dwd";
      const network = url.searchParams.get("network") || "observation";
      const parameters = url.searchParams.get("parameters");
      const periods = url.searchParams.get("periods") || "recent";
      const { format, contentType } = determineResponseFormat(ctx);
  
      // Check required parameters
      if (!parameters) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Missing required parameter: parameters" };
        return;
      }
      
      // Check if location-based search is requested
      let coords: [number, number] | undefined = undefined;
      const coordinates = url.searchParams.get("coordinates");
      
      if (coordinates) {
        const [latStr, lonStr] = coordinates.split(",");
        const latNum = parseFloat(latStr);
        const lonNum = parseFloat(lonStr);
        
        if (isNaN(latNum) || isNaN(lonNum)) {
          ctx.response.status = 400;
          ctx.response.body = { error: "Invalid coordinates format. Expected: lat,lon" };
          return;
        }
        
        coords = [latNum, lonNum];
      }
  
      // Optional rank parameter for location-based searches
      const rankParam = url.searchParams.get("rank");
      const rank = rankParam ? parseInt(rankParam) : 5;
  
      // Fetch stations
      const stations = await wetterdienstClient.getStations({
        provider,
        network,
        parameters,
        periods,
        coordinates: coords,
        rank: coords ? rank : undefined,
      });

    // Return response in requested format
    if (format === "rdf") {
      const rdf = await stationsToRDF(stations, contentType);

      // Set the specific content type that was used
      ctx.response.headers.set(
        "Content-Type",
        contentType.includes(",")
          ? contentType.split(",")[0].trim() // Use first content type if multiple
          : contentType,
      );

      ctx.response.body = rdf;
    } else {
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = stations;
    }

    // Add Vary header to indicate response depends on Accept header
    ctx.response.headers.set("Vary", "Accept");
  } catch (error) {
    console.error("Error handling /stations request:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
});

/**
 * GET /values endpoint
 * Query parameters:
 * - provider (default: "dwd")
 * - network (default: "observation")
 * - parameters (required)
 * - periods (default: "recent")
 * - station (required)
 * - date (optional)
 * - format (optional, default: "json", can be "rdf")
 */
router.get("/values", async (ctx) => {
  try {
    const url = ctx.request.url;
    const provider = url.searchParams.get("provider") || "dwd";
    const network = url.searchParams.get("network") || "observation";
    const parameters = url.searchParams.get("parameters");
    const periods = url.searchParams.get("periods") || "recent";
    const station = url.searchParams.get("station");
    const date = url.searchParams.get("date") || undefined;
    const { format, contentType } = determineResponseFormat(ctx);

    // Check required parameters
    if (!parameters) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing required parameter: parameters" };
      return;
    }

    if (!station) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing required parameter: station" };
      return;
    }

    // Fetch values
    const values = await wetterdienstClient.getValues({
      provider,
      network,
      parameters,
      periods,
      station,
      date,
    });

    // Return response in requested format
    if (format === "rdf") {
      const rdf = await valuesToRDF(values, contentType);

      // Set the specific content type that was used
      ctx.response.headers.set(
        "Content-Type",
        contentType.includes(",")
          ? contentType.split(",")[0].trim()
          : contentType,
      );

      ctx.response.body = rdf;
    } else {
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = values;
    }

    // Add Vary header to indicate response depends on Accept header
    ctx.response.headers.set("Vary", "Accept");
  } catch (error) {
    console.error("Error handling /values request:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
});

// Add a simple status endpoint
router.get("/", (ctx) => {
  ctx.response.body = {
    status: "ok",
    service: "Wetterdienst RDF Adapter",
    endpoints: ["/stations", "/values"],
    version: "0.0.1",
  };
});

// Register router
app.use(router.routes());
app.use(router.allowedMethods());

// Error handling
app.addEventListener("error", (event) => {
  console.error("Server error:", event.error);
});

// Start the server
const port = parseInt(Deno.env.get("PORT") || "8000");
console.log(`Server running on http://localhost:${port}`);

// Start the application
await app.listen({ port });
