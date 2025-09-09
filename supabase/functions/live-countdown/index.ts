// supabase/functions/live-countdown/index.ts

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import "https://deno.land/x/dotenv@v3.2.2/load.ts";

// Load ENV
const SHEET_ID = Deno.env.get("SHEET_ID");
if (!SHEET_ID) throw new Error("Missing SHEET_ID in .env");

// Utils
function getSheetUrl(sheetId: string, tabName: string) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${tabName}`;
}

function parseCsv(text: string) {
  const [headerLine, ...lines] = text.trim().split("\n");
  const headers = headerLine.split(",");

  return lines.map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h.trim()] = values[i]?.trim() || "";
    });
    return row;
  });
}

// Server
serve(async (req) => {
  const { searchParams } = new URL(req.url);
  const year = searchParams.get("year");

  if (!year || !/^\d{4}$/.test(year)) {
    return new Response("Missing or invalid year param", { status: 400 });
  }

  const tabName = year;
  const url = getSheetUrl(SHEET_ID!, tabName);

  try {
    const csv = await fetch(url).then((res) => res.text());
    const rows = parseCsv(csv);

    return new Response(JSON.stringify({ year, rows }), {
	headers: {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
	},
});
  } catch (err) {
    console.error(err);
    return new Response("Failed to load sheet", { status: 500 });
  }
});
