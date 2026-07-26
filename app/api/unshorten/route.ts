import { NextResponse } from "next/server";

const extractCoords = (text: string): { lat: string; lng: string } | null => {
  if (!text) return null;

  let decodedText = text;
  try {
    decodedText = decodeURIComponent(text);
  } catch (_) {}

  const normalizedText = decodedText.replace(/\+/g, " ");

  // 1. @lat,lng format e.g. /@17.965421,102.632145/
  const atMatch = normalizedText.match(/@(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (atMatch) {
    return {
      lat: parseFloat(atMatch[1]).toFixed(6),
      lng: parseFloat(atMatch[2]).toFixed(6),
    };
  }

  // 2. /maps/search/lat,lng or /maps/place/.../lat,lng
  const searchMatch = normalizedText.match(/\/maps\/search\/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (searchMatch) {
    return {
      lat: parseFloat(searchMatch[1]).toFixed(6),
      lng: parseFloat(searchMatch[2]).toFixed(6),
    };
  }

  // 3. ?q=lat,lng or &q=lat,lng or query=lat,lng or ll=lat,lng or center=lat,lng
  const qMatch = normalizedText.match(/[?&](?:q|query|ll|center)=(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
  if (qMatch) {
    return {
      lat: parseFloat(qMatch[1]).toFixed(6),
      lng: parseFloat(qMatch[2]).toFixed(6),
    };
  }

  // 4. !3dlat!4dlng (Google Maps data parameter)
  const dMatch = normalizedText.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dMatch) {
    return {
      lat: parseFloat(dMatch[1]).toFixed(6),
      lng: parseFloat(dMatch[2]).toFixed(6),
    };
  }

  // 5. Any pair of decimal coordinates lat, lng
  const genMatches = Array.from(normalizedText.matchAll(/(-?\d{1,2}\.\d+)\s*,\s*(-?\d{1,3}\.\d+)/g));
  for (const m of genMatches) {
    const lat = parseFloat(m[1]);
    const lng = parseFloat(m[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
    }
  }

  return null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // 1. Check raw URL string directly
  let coords = extractCoords(url);
  if (coords) {
    return NextResponse.json(coords);
  }

  try {
    // 2. Fetch with redirect: 'manual' (No User-Agent header forces Google Maps 302 Location header response)
    const res = await fetch(url, { method: "GET", redirect: "manual" });
    const location = res.headers.get("location");
    if (location) {
      coords = extractCoords(location);
      if (coords) {
        return NextResponse.json(coords);
      }
    }

    // 3. Fallback: follow redirect
    const followRes = await fetch(location || url, { method: "GET", redirect: "follow" });
    const finalUrl = followRes.url || "";
    coords = extractCoords(finalUrl);
    if (coords) {
      return NextResponse.json(coords);
    }

    let htmlText = "";
    try {
      htmlText = await followRes.text();
    } catch (_) {}

    coords = extractCoords(htmlText);
    if (coords) {
      return NextResponse.json(coords);
    }

    return NextResponse.json(
      { error: "ບໍ່ສາມາດດຶງພິກັດຈາກລິ້ງນີ້ໄດ້", location, finalUrl },
      { status: 422 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to resolve short URL" },
      { status: 500 }
    );
  }
}
