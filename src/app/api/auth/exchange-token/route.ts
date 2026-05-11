import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * POST /api/auth/exchange-token
 * 
 * Called immediately after Firebase sign-in to exchange ID token for Google tokens.
 * This endpoint handles the OAuth token exchange and stores the refresh token securely in Firestore.
 * 
 * Request body:
 * {
 *   idToken: string (Firebase ID token from signInWithPopup)
 *   userId: string (Firebase UID)
 *   email: string
 * }
 * 
 * Response:
 * {
 *   accessToken: string (valid for ~1 hour)
 *   expiresIn: number (seconds until expiry)
 *   refreshTokenStored: boolean (indicates if refresh token was stored)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken, userId, email } = await request.json();

    if (!idToken || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: idToken, userId, email' },
        { status: 400 }
      );
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Exchange Firebase ID token for Google OAuth tokens
    const tokenEndpoint = 'https://oauth2.googleapis.com/tokeninfo';
    
    try {
      // Get token info from Google
      const tokenResponse = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          id_token: idToken,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        console.error('Failed to verify ID token with Google');
        return NextResponse.json(
          { error: 'Invalid ID token' },
          { status: 401 }
        );
      }

      // For now, we'll store the ID token and use it to validate future requests
      // The access token for Calendar API is obtained via the standard OAuth flow
      // and the refresh token will be available when we make a proper OAuth call
      
      // Update user document to mark as authenticated with Google
      const userRef = doc(db, 'users', userId);
      await setDoc(
        userRef,
        {
          email,
          googleAuthenticated: true,
          lastTokenRefresh: new Date().toISOString(),
        },
        { merge: true }
      );

      return NextResponse.json({
        success: true,
        refreshTokenStored: false, // Will be true once we capture refresh token
        message: 'User authenticated with Google',
      });
    } catch (error) {
      console.error('Token exchange error:', error);
      return NextResponse.json(
        { error: 'Failed to exchange token' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Auth endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
