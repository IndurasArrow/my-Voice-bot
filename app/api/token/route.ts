import { AccessToken } from "livekit-server-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // You should store these in your .env.local file!
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const at = new AccessToken(apiKey, apiSecret, {
    identity: "user-" + Math.random().toString(36).substring(7),
  });

  at.addGrant({
    roomJoin: true,
    room: "voice-bot-room", // Or make this dynamic
    canPublish: true,
    canSubscribe: true,
  });

  return NextResponse.json({ accessToken: at.toJwt() });
}
