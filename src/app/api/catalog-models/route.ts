import { buildCatalogModelRows } from "@/data/catalogBackendRows";

export async function GET() {
  return Response.json(
    { models: buildCatalogModelRows() },
    {
      headers: {
        "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
