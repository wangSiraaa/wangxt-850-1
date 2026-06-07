import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { VENUE_TYPE_LABELS, ROLE_INFO } from '@/types';
import { formatDate, formatDateTime } from '@/utils/timeUtils';
import {
  RotateCcw,
  MapPin,
  Clock,
  Users,
  FileText,
  User,
  Calendar as CalendarIcon,
  Search,
  X,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function RevokePage() {
  const { venues, activityTypes, reservations, revokeRecords } = useAppStore();

  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const getReservationById = (id: string) => reservations.find((r) => r.id === id);
  const getVenueById = (id: string) => venues.find((v) => v.id === id);
  const getActivityTypeById = (id: string) => activityTypes.find((a) => a.id === id);

  const getRevokedByInfo = (key: string) => {
    return ROLE_INFO[key as keyof typeof ROLE_INFO]?.name || key;
  };

  const enrichedRecords = revokeRecords
    .map((record) => {
      const reservation = getReservationById(record.reservationId);
      const venue = reservation ? getVenueById(reservation.venueId) : undefined;
      const activityType = reservation
        ? getActivityTypeById(reservation.activityTypeId)
        : undefined;
      return {
        ...record,
        reservation,
        venue,
        activityType,
      };
    })
    .filter((record) => {
      if (!searchKeyword) return true;
      const keyword = searchKeyword.toLowerCase();
      const matchReason = record.reason.toLowerCase().includes(keyword);
      const matchActivity = record.reservation?.activityName.toLowerCase().includes(keyword);
      const matchVenue = record.venue?.name.toLowerCase().includes(keyword);
      return matchReason || matchActivity || matchVenue;
    })
    .sort((a, b) => new Date(b.revokedAt).getTime() - new Date(a.revokedAt).getTime());

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 stagger-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">撤销记录</h2>
          <p className="text-gray-500 text-sm mt-1">查看所有已撤销的预约记录</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg">
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm font-medium">共 {enrichedRecords.length} 条记录</span>
        </div>
      </div>

      <div className="stagger-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索撤销原因、活动名称、场地..."
            className="input-field pl-10"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4 stagger-3">
        {enrichedRecords.length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无撤销记录</h3>
            <p className="text-gray-500">
              {searchKeyword ? '没有找到匹配的撤销记录' : '还没有任何预约被撤销'}
            </p>
          </div>
        ) : (
          enrichedRecords.map((record) => {
            const isExpanded = selectedRecord === record.id;
            const { reservation, venue, activityType } = record;

            return (
              <div key={record.id} className="card overflow-hidden">
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => setSelectedRecord(isExpanded ? null : record.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <RotateCcw className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800">
                          {reservation?.activityName || '未知活动'}
                        </h4>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          撤销时间：{formatDateTime(record.revokedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 ml-13">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        {venue?.name || '未知场地'}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4 text-primary-500" />
                        {reservation ? formatDate(reservation.date, 'MM月dd日') : '未知日期'}{' '}
                        {reservation?.startTime} - {reservation?.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4 text-primary-500" />
                        {getRevokedByInfo(record.revokedBy)}
                      </span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">撤销原因</p>
                          <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                              <p className="text-warning-800">{record.reason}</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">原预约信息</p>
                          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">活动名称</span>
                              <span className="font-medium text-gray-800">
                                {reservation?.activityName}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">活动类型</span>
                              <span className="font-medium text-gray-800">
                                {activityType?.name}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">预约状态</span>
                              <StatusBadge status={reservation?.status || 'revoked'} />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">参与人数</span>
                              <span className="font-medium text-gray-800">
                                {reservation?.participants} 人
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">场地信息</p>
                          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">场地名称</span>
                              <span className="font-medium text-gray-800">{venue?.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">场地类型</span>
                              <span className="font-medium text-gray-800">
                                {VENUE_TYPE_LABELS[venue?.type || 'classroom']}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">位置</span>
                              <span className="font-medium text-gray-800">
                                {venue?.building} {venue?.floor}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">场地容量</span>
                              <span className="font-medium text-gray-800">
                                {venue?.capacity} 人
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">负责人信息</p>
                          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">负责人</span>
                              <span className="font-medium text-gray-800">
                                {reservation?.contactName}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">联系电话</span>
                              <span className="font-medium text-gray-800">
                                {reservation?.contactPhone}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">创建时间</span>
                              <span className="font-medium text-gray-800">
                                {reservation ? formatDateTime(reservation.createdAt) : '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                        {reservation?.remarks && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">备注说明</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                              {reservation.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FileText className="w-4 h-4" />
                        <span>
                          该预约已于 {formatDateTime(record.revokedAt)} 由{' '}
                          <span className="font-medium text-gray-700">
                            {getRevokedByInfo(record.revokedBy)}
                          </span>{' '}
                          撤销，场地已释放。
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
