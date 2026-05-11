export async function addEventToGoogleCalendar(accessToken: string, event: {
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
}) {
  if (!accessToken) {
    throw new Error("No access token available. Please sign in with Google.");
  }

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    }),
  });

  if (!response.ok) {
    let errorBody: any = null;
    try {
      errorBody = await response.json();
    } catch {
      // ignore non-JSON error bodies
    }

    const message =
      errorBody?.error?.message ||
      `Google Calendar request failed (${response.status})`;

    const err: any = new Error(message);
    err.status = response.status;
    err.code = errorBody?.error?.code;
    err.details = errorBody;
    
    // Log full error details for debugging
    console.error("Google Calendar API Error:", {
      status: response.status,
      message,
      code: err.code,
      details: errorBody
    });
    
    throw err;
  }

  return response.json();
}

/**
 * Adds event to Google Calendar with automatic token refresh.
 * This is a wrapper that handles token expiry gracefully.
 * 
 * @param accessToken - Current access token (may be expired)
 * @param refreshFn - Function to refresh the access token
 * @param event - Event details to add to calendar
 * @param tokenExpiryTime - Optional token expiry timestamp in ms
 * @returns Event creation response or null if failed
 */
export async function addEventToGoogleCalendarWithRefresh(
  accessToken: string | null,
  refreshFn: () => Promise<string | null>,
  event: {
    title: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
  },
  tokenExpiryTime?: number | null
): Promise<any> {
  if (!accessToken) {
    console.warn("No access token available, attempting to refresh...");
    const newToken = await refreshFn();
    if (!newToken) {
      throw new Error("Could not obtain valid access token. Please sign in again with Google.");
    }
    return addEventToGoogleCalendar(newToken, event);
  }

  // Check if token is close to expiry (within 5 minutes)
  if (tokenExpiryTime && Date.now() > tokenExpiryTime - 5 * 60 * 1000) {
    console.log("Token expiring soon, refreshing...");
    const newToken = await refreshFn();
    if (newToken) {
      return addEventToGoogleCalendar(newToken, event);
    }
    // If refresh fails, try with current token anyway
  }

  try {
    return await addEventToGoogleCalendar(accessToken, event);
  } catch (error: any) {
    // If we get a 401, try refreshing the token
    if (error.status === 401) {
      console.warn("Access token expired (401), attempting to refresh...");
      const newToken = await refreshFn();
      if (newToken) {
        return addEventToGoogleCalendar(newToken, event);
      }
      throw new Error("Access token expired and could not be refreshed. Please sign in again with Google.");
    }
    throw error;
  }
}
