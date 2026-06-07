import { Reservation, ActivityType, ConflictInfo, Venue } from '@/types';
import { isTimeOverlap, isSameDate } from './timeUtils';

export function checkConflict(
  reservations: Reservation[],
  venueId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): ConflictInfo {
  const conflictingReservation = reservations.find((r) => {
    if (excludeId && r.id === excludeId) return false;
    if (r.status === 'revoked' || r.status === 'rejected') return false;
    if (r.venueId !== venueId) return false;
    if (!isSameDate(r.date, date)) return false;
    return isTimeOverlap(r.startTime, r.endTime, startTime, endTime);
  });

  if (conflictingReservation) {
    return {
      hasConflict: true,
      conflictingReservation,
      message: `该时段与"${conflictingReservation.activityName}"冲突 (${conflictingReservation.startTime}-${conflictingReservation.endTime})`,
    };
  }

  return {
    hasConflict: false,
    message: '该时段可用',
  };
}

export function canApproveReservation(
  reservation: Reservation,
  activityType: ActivityType | undefined
): { allowed: boolean; reason: string } {
  if (!activityType) {
    return { allowed: false, reason: '活动类型不存在' };
  }

  if (activityType.isLargeEvent && !reservation.safetyRecord) {
    return {
      allowed: false,
      reason: '大型活动必须通过安全备案才能审核通过',
    };
  }

  return { allowed: true, reason: '' };
}

export function getReservationsByVenueAndDate(
  reservations: Reservation[],
  venueId: string,
  date: string
): Reservation[] {
  return reservations.filter(
    (r) =>
      r.venueId === venueId &&
      isSameDate(r.date, date) &&
      r.status !== 'revoked' &&
      r.status !== 'rejected'
  );
}

export function getReservationsByVenue(
  reservations: Reservation[],
  venueId: string
): Reservation[] {
  return reservations.filter(
    (r) => r.venueId === venueId && r.status !== 'revoked' && r.status !== 'rejected'
  );
}

export function checkVenueAvailability(
  venue: Venue,
  date: string,
  reservations: Reservation[]
): { available: number; total: number; reservations: Reservation[] } {
  const dayReservations = getReservationsByVenueAndDate(reservations, venue.id, date);
  const totalSlots = 29;
  let occupiedSlots = 0;

  dayReservations.forEach((r) => {
    const startIdx = (parseInt(r.startTime.split(':')[0]) - 8) * 2 + (r.startTime.split(':')[1] === '30' ? 1 : 0);
    const endIdx = (parseInt(r.endTime.split(':')[0]) - 8) * 2 + (r.endTime.split(':')[1] === '30' ? 1 : 0);
    occupiedSlots += endIdx - startIdx;
  });

  return {
    available: totalSlots - occupiedSlots,
    total: totalSlots,
    reservations: dayReservations,
  };
}
