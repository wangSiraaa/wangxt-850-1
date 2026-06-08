import { ReservationStatus, STATUS_LABELS, SetupStatus, SETUP_STATUS_LABELS } from '@/types';
import { AlertCircle, CheckCircle, XCircle, RotateCcw, Wrench, Play, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: ReservationStatus;
  showIcon?: boolean;
}

const statusIcons: Record<ReservationStatus, React.ReactNode> = {
  pending: <AlertCircle className="w-3 h-3 mr-1" />,
  approved: <CheckCircle className="w-3 h-3 mr-1" />,
  rejected: <XCircle className="w-3 h-3 mr-1" />,
  revoked: <RotateCcw className="w-3 h-3 mr-1" />,
  setup_completed: <Wrench className="w-3 h-3 mr-1" />,
};

export default function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const { label, color } = STATUS_LABELS[status];
  return (
    <span className={`badge ${color}`}>
      {showIcon && statusIcons[status]}
      {label}
    </span>
  );
}

interface SetupStatusBadgeProps {
  status: SetupStatus;
  showIcon?: boolean;
}

const setupStatusIcons: Record<SetupStatus, React.ReactNode> = {
  pending: <AlertCircle className="w-3 h-3 mr-1" />,
  in_progress: <Play className="w-3 h-3 mr-1" />,
  completed: <CheckCircle className="w-3 h-3 mr-1" />,
  abnormal: <AlertTriangle className="w-3 h-3 mr-1" />,
};

export function SetupStatusBadge({ status, showIcon = true }: SetupStatusBadgeProps) {
  const { label, color } = SETUP_STATUS_LABELS[status];
  return (
    <span className={`badge ${color}`}>
      {showIcon && setupStatusIcons[status]}
      {label}
    </span>
  );
}

interface SetupStatusDotProps {
  status: SetupStatus;
}

export function SetupStatusDot({ status }: SetupStatusDotProps) {
  const { dotColor, label } = SETUP_STATUS_LABELS[status];
  return (
    <div className="flex items-center gap-1.5" title={label}>
      <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}
