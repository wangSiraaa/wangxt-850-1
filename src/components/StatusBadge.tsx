import { ReservationStatus, STATUS_LABELS } from '@/types';
import { AlertCircle, CheckCircle, XCircle, RotateCcw, Wrench } from 'lucide-react';

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
