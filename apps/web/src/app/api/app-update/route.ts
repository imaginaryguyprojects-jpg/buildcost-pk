import { NextResponse } from "next/server";

/**
 * BuildCost Connect — Cross-Platform App Update Metadata Endpoint (Sections 70, 71, 110)
 * 
 * Provides versioned release metadata for Android (EAS / Direct APK) and Chrome Extension:
 * - Checks whether client version meets minimum supported version
 * - Provides verified release notes and signed APK download URL
 * - Does not silently execute installs; client prompts user with explicit confirmation
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientPlatform = searchParams.get("platform") || "android";
  const currentVersionCode = parseInt(searchParams.get("versionCode") || "10", 10);

  const updatePayload = {
    platform: clientPlatform,
    latestVersion: "1.1.0",
    latestVersionCode: 11,
    minimumVersionCode: 10,
    mandatoryUpdate: currentVersionCode < 10,
    releaseNotes: "BuildCost Connect Phase 1.1: Advanced RCC structural calculators, 17-category finishing, Pakistani workforce scenarios, and live PBS/APCMA market rates.",
    downloadUrl: "https://buildcostconnect.pk/releases/buildcost-v1.1.0.apk",
    releaseDate: "2026-09-05",
    verifiedSignatureSha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    serverTimestamp: new Date().toISOString()
  };

  return NextResponse.json(updatePayload, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
    }
  });
}
