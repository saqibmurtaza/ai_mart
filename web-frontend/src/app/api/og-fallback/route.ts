import { NextResponse } from "next/server";

export async function GET() {
  return new NextResponse(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Curated Shop Australia</title>
<meta property="og:title" content="Curated Shop Australia"/>
<meta property="og:description" content="Soft PVC charms, anime badges, AFL team logos and more."/>
<meta property="og:url" content="https://curated-shop-australia.vercel.app"/>
<meta property="og:site_name" content="Curated Shop"/>
<meta property="og:image" content="https://cdn.sanity.io/images/fb3pwyau/production/e432035297f9bd6decd3c465632807545152128d-729x729.png"/>
<meta property="og:image:width" content="729"/>
<meta property="og:image:height" content="729"/>
<meta property="og:image:alt" content="Curated Shop Collection"/>
<meta property="og:type" content="website"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="Curated Shop Australia"/>
<meta name="twitter:description" content="Find unique products from across Australia."/>
</head>
<body>
Curated Shop Australia
</body>
</html>`, {
    headers: { "Content-Type": "text/html" }
  });
}
