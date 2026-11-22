import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        error: 'GOOGLE_CLIENT_ID_MISSING',
        message: 'Le Client ID Google OAuth n\'est pas encore renseigné dans le fichier .env (GOOGLE_CLIENT_ID).',
      },
      { status: 400 }
    );
  }

  const host = req.headers.get('host') || 'localhost:3001';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/oauth/google/callback`;

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email&access_type=offline&prompt=consent`;

  return NextResponse.redirect(googleAuthUrl);
}
