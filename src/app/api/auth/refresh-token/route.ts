import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * POST /api/auth/refresh-token
 * 
 * Securely refreshes Google OAuth token using refresh token stored in Firestore.
 * Client secret is never exposed to the client.
 * 
 * Request body:
 * {
 *   userId: string (Firebase UID)
 * }
 * 
 * Response:
 * {
 *   accessToken: string
 *   expiresIn: number (seconds)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify environment variables
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Missing environment variables for token refresh');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Fetch user document to get refresh token
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const refreshToken = userData?.googleRefreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available. Please sign in again with Google.' },
        { status: 401 }
      );
    }

    // Create OAuth2 client with server-side credentials (client secret never exposed)
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      // Redirect URI must match what was used during initial sign-in
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
    );

    // Set the refresh token
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    // Get new access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    const newAccessToken = credentials.access_token;
    const expiresIn = credentials.expiry_date ? Math.floor((credentials.expiry_date - Date.now()) / 1000) : 3600;

    if (!newAccessToken) {
      return NextResponse.json(
        { error: 'Failed to refresh access token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      accessToken: newAccessToken,
      expiresIn, // in seconds
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);

    // Handle specific error cases
    if (error.message?.includes('invalid_grant')) {
      return NextResponse.json(
        { error: 'Refresh token expired or invalid. Please sign in again.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
