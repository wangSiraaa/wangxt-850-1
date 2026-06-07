import { useAppStore } from '@/store/useAppStore';
import { AlertTriangle, X, Clock, MapPin } from 'lucide-react';

export default function ConflictAlert() {
  const { conflictInfo, setConflictInfo, venues } = useAppStore();

  if (!conflictInfo?.hasConflict || !conflictInfo.conflictingReservation) {
    return null;
  }

  const reservation = conflictInfo.conflictingReservation;
  const venue = venues.find((v) => v.id === reservation.venueId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-shake">
        <div className="bg-danger-500 text-white p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">预约冲突</h3>
                <p className="text-danger-100 text-sm mt-1">所选时段已被占用</p>
              </div>
            </div>
            <button
              onClick={() => setConflictInfo(null)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 mb-4">
            <p className="text-danger-800 font-medium">{conflictInfo.message}</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">冲突活动详情</h4>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                <span className="font-medium">{venue?.name || '未知场地'}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-primary-500" />
                <span>
                  {reservation.date} {reservation.startTime} - {reservation.endTime}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-800 font-medium">{reservation.activityName}</p>
                <p className="text-gray-500 text-sm mt-1">
                  负责人：{reservation.contactName} · {reservation.participants}人
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setConflictInfo(null)}
              className="flex-1 btn-secondary"
            >
              我知道了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
