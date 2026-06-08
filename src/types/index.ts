export type VenueType = 'classroom' | 'playground' | 'lecture_hall';

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  capacity: number;
  facilities: string[];
  building: string;
  floor: string;
}

export interface ActivityType {
  id: string;
  name: string;
  isLargeEvent: boolean;
  isActive: boolean;
  description: string;
}

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'revoked' | 'setup_completed';

export type SetupStatus = 'pending' | 'in_progress' | 'completed' | 'abnormal';

export interface Reservation {
  id: string;
  venueId: string;
  activityTypeId: string;
  activityName: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  contactName: string;
  contactPhone: string;
  remarks: string;
  status: ReservationStatus;
  setupStatus?: SetupStatus;
  safetyRecord: boolean;
  auditRemark: string;
  createdBy: string;
  createdAt: string;
  auditAt?: string;
  auditBy?: string;
}

export interface RevokeRecord {
  id: string;
  reservationId: string;
  reason: string;
  revokedBy: string;
  revokedAt: string;
}

export type UserRole = 'club_leader' | 'admin' | 'logistics';

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingReservation?: Reservation;
  venueName?: string;
  message: string;
}

export interface RoleInfo {
  key: UserRole;
  name: string;
  description: string;
  icon: string;
}

export const ROLE_INFO: Record<UserRole, RoleInfo> = {
  club_leader: {
    key: 'club_leader',
    name: '社团负责人',
    description: '浏览场地日历、提交预约申请、撤销预约',
    icon: 'Users',
  },
  admin: {
    key: 'admin',
    name: '学生会管理员',
    description: '维护活动类型、审核预约队列',
    icon: 'ShieldCheck',
  },
  logistics: {
    key: 'logistics',
    name: '后勤人员',
    description: '查看布置清单、标记布置完成',
    icon: 'Wrench',
  },
};

export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  classroom: '教室',
  playground: '操场',
  lecture_hall: '报告厅',
};

export const STATUS_LABELS: Record<ReservationStatus, { label: string; color: string }> = {
  pending: { label: '待审核', color: 'bg-warning-100 text-warning-700' },
  approved: { label: '已通过', color: 'bg-success-100 text-success-700' },
  rejected: { label: '已驳回', color: 'bg-danger-100 text-danger-700' },
  revoked: { label: '已撤销', color: 'bg-gray-100 text-gray-600' },
  setup_completed: { label: '布置完成', color: 'bg-primary-100 text-primary-700' },
};

export const SETUP_STATUS_LABELS: Record<SetupStatus, { label: string; color: string; dotColor: string }> = {
  pending: { label: '待布置', color: 'bg-warning-100 text-warning-700', dotColor: 'bg-warning-500' },
  in_progress: { label: '布置中', color: 'bg-info-100 text-info-700', dotColor: 'bg-info-500' },
  completed: { label: '已完成', color: 'bg-success-100 text-success-700', dotColor: 'bg-success-500' },
  abnormal: { label: '异常', color: 'bg-danger-100 text-danger-700', dotColor: 'bg-danger-500' },
};
