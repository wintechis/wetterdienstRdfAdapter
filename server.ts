import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { wetterdienstClient, valuesToRDF, stationsToRDF } from "./mod.ts";

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
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204; // No content
    return;
  }
  
  await next();
});

/**
 * GET /stations endpoint
 * Query parameters:
 * - provider (default: "dwd")
 * - network (default: "observation")
 * - parameters (required)
 * - periods (default: "recent")
 * - lat (optional, requires lon)
 * - lon (optional, requires lat)
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
    const format = url.searchParams.get("format") || "json";
    
    // Check required parameters
    if (!parameters) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Missing required parameter: parameters" };
      return;
    }
    
    // Check if location-based search is requested
    let coords: [number, number] | undefined = undefined;
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    
    if (lat && lon) {
      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lon);
      
      if (isNaN(latNum) || isNaN(lonNum)) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Invalid lat/lon coordinates" };
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
      rank: coords ? rank : undefined
    });
    
    // Return response in requested format
    if (format === "rdf") {
      const rdf = await stationsToRDF(stations);
      ctx.response.headers.set("Content-Type", "text/turtle");
      ctx.response.body = rdf;
    } else {
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = stations;
    }
  } catch (error) {
    console.error("Error handling /stations request:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: error instanceof Error ? error.message : "Internal server error" };
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
    const format = url.searchParams.get("format") || "json";
    
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
      date
    });
    
    // Return response in requested format
    if (format === "rdf") {
      const rdf = await valuesToRDF(values);
      ctx.response.headers.set("Content-Type", "text/turtle");
      ctx.response.body = rdf;
    } else {
      ctx.response.headers.set("Content-Type", "application/json");
      ctx.response.body = values;
    }
  } catch (error) {
    console.error("Error handling /values request:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: error instanceof Error ? error.message : "Internal server error" };
  }
});

// Add a simple status endpoint
router.get("/", (ctx) => {
  ctx.response.body = { 
    status: "ok",
    service: "Wetterdienst RDF Adapter",
    endpoints: ["/stations", "/values"],
    version: "1.0.0"
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