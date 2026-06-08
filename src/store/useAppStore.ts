import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Venue,
  ActivityType,
  Reservation,
  RevokeRecord,
  UserRole,
  ConflictInfo,
  ReservationStatus,
} from '@/types';
import {
  mockVenues,
  mockActivityTypes,
  mockReservations,
  mockRevokeRecords,
  mockCurrentRole,
} from '@/data/mockData';
import { checkConflict, canApproveReservation } from '@/utils/conflictUtils';
import { generateId, getTodayString } from '@/utils/timeUtils';

interface AppState {
  currentRole: UserRole;
  venues: Venue[];
  activityTypes: ActivityType[];
  reservations: Reservation[];
  revokeRecords: RevokeRecord[];
  selectedDate: string;
  selectedVenueId: string | null;
  conflictInfo: ConflictInfo | null;
  calendarView: 'day' | 'week' | 'month';
  venueTypeFilter: string | null;
  searchKeyword: string;

  setCurrentRole: (role: UserRole) => void;
  setSelectedDate: (date: string) => void;
  setSelectedVenueId: (id: string | null) => void;
  setCalendarView: (view: 'day' | 'week' | 'month') => void;
  setVenueTypeFilter: (type: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setConflictInfo: (info: ConflictInfo | null) => void;

  createReservation: (data: Omit<Reservation, 'id' | 'status' | 'createdAt' | 'createdBy' | 'auditRemark'>) => { success: boolean; message: string; reservation?: Reservation };
  checkAndSetConflict: (venueId: string, date: string, startTime: string, endTime: string, excludeId?: string) => ConflictInfo;
  approveReservation: (reservationId: string, auditRemark?: string) => { success: boolean; message: string };
  rejectReservation: (reservationId: string, auditRemark: string) => { success: boolean; message: string };
  revokeReservation: (reservationId: string, reason: string, revokedBy: string) => { success: boolean; message: string };
  markSetupCompleted: (reservationId: string) => { success: boolean; message: string };
  toggleSafetyRecord: (reservationId: string) => void;

  addActivityType: (data: Omit<ActivityType, 'id'>) => void;
  updateActivityType: (id: string, data: Partial<ActivityType>) => void;
  toggleActivityTypeStatus: (id: string) => void;

  getFilteredVenues: () => Venue[];
  getPendingReservations: () => Reservation[];
  getApprovedReservations: () => Reservation[];
  getSetupTasks: () => Reservation[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentRole: mockCurrentRole,
      venues: mockVenues,
      activityTypes: mockActivityTypes,
      reservations: mockReservations,
      revokeRecords: mockRevokeRecords,
      selectedDate: getTodayString(),
      selectedVenueId: null,
      conflictInfo: null,
      calendarView: 'week',
      venueTypeFilter: null,
      searchKeyword: '',

      setCurrentRole: (role) => set({ currentRole: role }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      setSelectedVenueId: (id) => set({ selectedVenueId: id }),
      setCalendarView: (view) => set({ calendarView: view }),
      setVenueTypeFilter: (type) => set({ venueTypeFilter: type }),
      setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
      setConflictInfo: (info) => set({ conflictInfo: info }),

      createReservation: (data) => {
        const state = get();
        const conflict = checkConflict(
          state.reservations,
          data.venueId,
          data.date,
          data.startTime,
          data.endTime
        );

        if (conflict.hasConflict) {
          set({ conflictInfo: conflict });
          return { success: false, message: conflict.message };
        }

        const newReservation: Reservation = {
          ...data,
          id: generateId(),
          status: 'pending',
          auditRemark: '',
          createdBy: state.currentRole,
          createdAt: new Date().toISOString(),
        };

        set({
          reservations: [...state.reservations, newReservation],
          conflictInfo: null,
        });

        return {
          success: true,
          message: '预约提交成功，等待审核',
          reservation: newReservation,
        };
      },

      checkAndSetConflict: (venueId, date, startTime, endTime, excludeId) => {
        const state = get();
        const conflict = checkConflict(
          state.reservations,
          venueId,
          date,
          startTime,
          endTime,
          excludeId
        );
        set({ conflictInfo: conflict });
        return conflict;
      },

      approveReservation: (reservationId, auditRemark = '') => {
        const state = get();
        const reservation = state.reservations.find((r) => r.id === reservationId);
        const activityType = state.activityTypes.find((a) => a.id === reservation?.activityTypeId);

        if (!reservation) {
          return { success: false, message: '预约记录不存在' };
        }

        const approvalCheck = canApproveReservation(reservation, activityType);
        if (!approvalCheck.allowed) {
          return { success: false, message: approvalCheck.reason };
        }

        set({
          reservations: state.reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: 'approved' as ReservationStatus,
                  auditRemark,
                  auditAt: new Date().toISOString(),
                  auditBy: state.currentRole,
                }
              : r
          ),
        });

        return { success: true, message: '审核通过' };
      },

      rejectReservation: (reservationId, auditRemark) => {
        const state = get();
        if (!auditRemark.trim()) {
          return { success: false, message: '请填写驳回原因' };
        }

        set({
          reservations: state.reservations.map((r) =>
            r.id === reservationId
              ? {
                  ...r,
                  status: 'rejected' as ReservationStatus,
                  auditRemark,
                  auditAt: new Date().toISOString(),
                  auditBy: state.currentRole,
                }
              : r
          ),
        });

        return { success: true, message: '已驳回预约' };
      },

      revokeReservation: (reservationId, reason, revokedBy) => {
        const state = get();
        const reservation = state.reservations.find((r) => r.id === reservationId);

        if (!reservation) {
          return { success: false, message: '预约记录不存在' };
        }

        const revokeRecord: RevokeRecord = {
          id: generateId(),
          reservationId,
          reason,
          revokedBy,
          revokedAt: new Date().toISOString(),
        };

        set({
          reservations: state.reservations.map((r) =>
            r.id === reservationId ? { ...r, status: 'revoked' as ReservationStatus } : r
          ),
          revokeRecords: [...state.revokeRecords, revokeRecord],
        });

        return { success: true, message: '预约已撤销，场地已释放' };
      },

      markSetupCompleted: (reservationId) => {
        const state = get();
        set({
          reservations: state.reservations.map((r) =>
            r.id === reservationId ? { ...r, status: 'setup_completed' as ReservationStatus } : r
          ),
        });
        return { success: true, message: '已标记为布置完成' };
      },

      toggleSafetyRecord: (reservationId) => {
        const state = get();
        set({
          reservations: state.reservations.map((r) =>
            r.id === reservationId ? { ...r, safetyRecord: !r.safetyRecord } : r
          ),
        });
      },

      addActivityType: (data) => {
        const state = get();
        const newType: ActivityType = {
          ...data,
          id: generateId(),
        };
        set({ activityTypes: [...state.activityTypes, newType] });
      },

      updateActivityType: (id, data) => {
        const state = get();
        set({
          activityTypes: state.activityTypes.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        });
      },

      toggleActivityTypeStatus: (id) => {
        const state = get();
        set({
          activityTypes: state.activityTypes.map((a) =>
            a.id === id ? { ...a, isActive: !a.isActive } : a
          ),
        });
      },

      getFilteredVenues: () => {
        const state = get();
        return state.venues.filter((v) => {
          const typeMatch = !state.venueTypeFilter || v.type === state.venueTypeFilter;
          const keywordMatch =
            !state.searchKeyword ||
            v.name.toLowerCase().includes(state.searchKeyword.toLowerCase()) ||
            v.building.toLowerCase().includes(state.searchKeyword.toLowerCase());
          return typeMatch && keywordMatch;
        });
      },

      getPendingReservations: () => {
        return get().reservations.filter((r) => r.status === 'pending');
      },

      getApprovedReservations: () => {
        return get().reservations.filter((r) => r.status === 'approved');
      },

      getSetupTasks: () => {
        return get()
          .reservations.filter((r) => r.status === 'approved')
          .sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
          });
      },
    }),
    {
      name: 'venue-reservation-storage-v4',
      partialize: (state) => ({
        currentRole: state.currentRole,
        reservations: state.reservations,
        activityTypes: state.activityTypes,
        revokeRecords: state.revokeRecords,
      }),
    }
  )
);
