import { fetchCatalogPhotos } from "@/lib/catalogPhotos.server";

export async function GET() {
  try {
    const photos = await fetchCatalogPhotos();
    return Response.json(
      { photos },
      {
        headers: {
          "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch {
    return Response.json({ photos: [] }, { status: 502 });
  }
}
