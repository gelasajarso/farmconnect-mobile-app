import api from './api';

/**
 * Update the authenticated delivery agent's location on the backend.
 * Called once when availability is set to AVAILABLE — no background tracking.
 *
 * POST /location/me
 */
export async function updateMyLocation(lat: number, lng: number): Promise<void> {
  await api.post('/location/me', { latitude: lat, longitude: lng });
}
