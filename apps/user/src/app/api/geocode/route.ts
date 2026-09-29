import { NextResponse, type NextRequest } from "next/server";

export const runtime = "edge"; // High-performance edge routing & caching

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const query = searchParams.get("q");

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    "";

  // Handle Autocomplete Search Query
  if (query) {
    try {
      if (!apiKey) {
        return NextResponse.json([{ id: "1", primaryText: query, formattedAddress: query }]);
      }

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&components=country:in&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && Array.isArray(data.predictions)) {
        const predictions = data.predictions.map((p: any) => ({
          id: p.place_id,
          primaryText: p.structured_formatting?.main_text || p.description.split(",")[0],
          secondaryText: p.structured_formatting?.secondary_text || "",
          formattedAddress: p.description,
        }));
        return NextResponse.json(predictions, {
          headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400" },
        });
      }

      return NextResponse.json([]);
    } catch (err) {
      return NextResponse.json([]);
    }
  }

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat or lng parameters" }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return NextResponse.json({ error: "Invalid latitude or longitude coordinate boundary." }, { status: 400 });
  }

  try {
    if (!apiKey) {
      // Fallback format if API key is not yet set
      return NextResponse.json({
        formattedAddress: `Coordinates: ${latNum.toFixed(5)}, ${lngNum.toFixed(5)}`,
        locality: "Hyderabad",
        administrativeAreaLevel1: "Telangana",
        postalCode: "500081",
      });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latNum},${lngNum}&key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json({ error: `Google Geocoding HTTP Error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return NextResponse.json({ error: data.error_message || "No address found", status: data.status }, { status: 422 });
    }

    const result = data.results[0];
    const components = result.address_components || [];
    let streetNumber = "";
    let route = "";
    let locality = "";
    let adminArea2 = "";
    let adminArea1 = "";
    let country = "";
    let postalCode = "";

    for (const c of components) {
      const types = c.types || [];
      if (types.includes("street_number")) streetNumber = c.long_name;
      if (types.includes("route")) route = c.long_name;
      if (types.includes("locality") || types.includes("sublocality")) locality = c.long_name;
      if (types.includes("administrative_area_level_2")) adminArea2 = c.long_name;
      if (types.includes("administrative_area_level_1")) adminArea1 = c.long_name;
      if (types.includes("country")) country = c.long_name;
      if (types.includes("postal_code")) postalCode = c.long_name;
    }

    const parsed = {
      formattedAddress: result.formatted_address,
      streetNumber,
      route,
      locality,
      administrativeAreaLevel2: adminArea2,
      administrativeAreaLevel1: adminArea1,
      country,
      postalCode,
    };

    return NextResponse.json(parsed, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reverse geocode" },
      { status: 500 }
    );
  }
}
