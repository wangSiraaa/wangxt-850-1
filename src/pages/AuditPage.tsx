import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { VENUE_TYPE_LABELS } from '@/types';
import { formatDate } from '@/utils/timeUtils';
import {
  FileCheck,
  MapPin,
  Clock,
  Users,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Tag,
  Plus,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  X,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface ActivityTypeForm {
  id?: string;
  name: string;
  description: string;
  isLargeEvent: boolean;
}

const initialFormData: ActivityTypeForm = {
  name: '',
  description: '',
  isLargeEvent: false,
};

export default function AuditPage() {
  const {
    venues,
    activityTypes,
    reservations,
    getPendingReservations,
    approveReservation,
    rejectReservation,
    toggleSafetyRecord,
    addActivityType,
    updateActivityType,
    toggleActivityTypeStatus,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'pending' | 'activityTypes'>('pending');
  const [selectedReservation, setSelectedReservation] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState<ActivityTypeForm>(initialFormData);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const pendingReservations = getPendingReservations();

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleApprove = (reservationId: string) => {
    const result = approveReservation(reservationId);
    if (result.success) {
      showMessage('success', result.message);
      setSelectedReservation(null);
    } else {
      showMessage('error', result.message);
    }
  };

  const handleReject = (reservationId: string) => {
    setSelectedReservation(reservationId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!selectedReservation) return;
    const result = rejectReservation(selectedReservation, rejectReason);
    if (result.success) {
      showMessage('success', result.message);
      setShowRejectModal(false);
      setSelectedReservation(null);
      setRejectReason('');
    } else {
      showMessage('error', result.message);
    }
  };

  const handleToggleSafety = (reservationId: string) => {
    toggleSafetyRecord(reservationId);
    showMessage('success', '安全备案状态已更新');
  };

  const openAddActivityType = () => {
    setActivityForm(initialFormData);
    setEditMode(false);
    setShowActivityModal(true);
  };

  const openEditActivityType = (type: typeof activityTypes[0]) => {
    setActivityForm({
      id: type.id,
      name: type.name,
      description: type.description,
      isLargeEvent: type.isLargeEvent,
    });
    setEditMode(true);
    setShowActivityModal(true);
  };

  const saveActivityType = () => {
    if (!activityForm.name.trim()) {
      showMessage('error', '请输入活动类型名称');
      return;
    }

    if (editMode && activityForm.id) {
      updateActivityType(activityForm.id, {
        name: activityForm.name,
        description: activityForm.description,
        isLargeEvent: activityForm.isLargeEvent,
      });
      showMessage('success', '活动类型已更新');
    } else {
      addActivityType({
        name: activityForm.name,
        description: activityForm.description,
        isLargeEvent: activityForm.isLargeEvent,
        isActive: true,
      });
      showMessage('success', '活动类型已添加');
    }
    setShowActivityModal(false);
    setActivityForm(initialFormData);
  };

  const handleToggleActivityStatus = (id: string) => {
    toggleActivityTypeStatus(id);
    showMessage('success', '状态已更新');
  };

  const getVenueById = (id: string) => venues.find((v) => v.id === id);
  const getActivityTypeById = (id: string) => activityTypes.find((a) => a.id === id);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 stagger-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">审核队列</h2>
          <p className="text-gray-500 text-sm mt-1">审核预约申请，管理活动类型</p>
        </div>
        {activeTab === 'activityTypes' && (
          <button onClick={openAddActivityType} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加活动类型
          </button>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 animate-fade-in-up ${
            message.type === 'success'
              ? 'bg-success-50 border border-success-200'
              : 'bg-danger-50 border border-danger-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-danger-500 flex-shrink-0" />
          )}
          <p className={message.type === 'success' ? 'text-success-800' : 'text-danger-800'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="flex gap-2 stagger-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'pending'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          待审核 ({pendingReservations.length})
        </button>
        <button
          onClick={() => setActiveTab('activityTypes')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'activityTypes'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          活动类型 ({activityTypes.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <div className="space-y-4 stagger-3">
          {pendingReservations.length === 0 ? (
            <div className="card text-center py-16">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无待审核申请</h3>
              <p className="text-gray-500">所有预约申请已处理完毕</p>
            </div>
          ) : (
            pendingReservations.map((reservation) => {
              const venue = getVenueById(reservation.venueId);
              const activityType = getActivityTypeById(reservation.activityTypeId);
              const isExpanded = selectedReservation === reservation.id;
              const needsSafetyRecord = activityType?.isLargeEvent && !reservation.safetyRecord;

              return (
                <div key={reservation.id} className="card overflow-hidden">
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setSelectedReservation(isExpanded ? null : reservation.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {reservation.activityName}
                        </h3>
                        <StatusBadge status={reservation.status} />
                        {activityType?.isLargeEvent && (
                          <span className="px-2 py-0.5 bg-warning-100 text-warning-700 text-xs rounded-md">
                            大型活动
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-primary-500" />
                          {venue?.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-primary-500" />
                          {formatDate(reservation.date, 'MM月dd日')} {reservation.startTime}-
                          {reservation.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-primary-500" />
                          {reservation.participants}人
                        </span>
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4 text-primary-500" />
                          {activityType?.name}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">活动场地</p>
                            <p className="font-medium text-gray-800">
                              {venue?.name} ({VENUE_TYPE_LABELS[venue?.type || 'classroom']})
                            </p>
                            <p className="text-sm text-gray-500">
                              {venue?.building} {venue?.floor} · 容纳{venue?.capacity}人
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">活动时间</p>
                            <p className="font-medium text-gray-800">
                              {formatDate(reservation.date, 'yyyy年MM月dd日')}
                            </p>
                            <p className="text-sm text-gray-500">
                              {reservation.startTime} - {reservation.endTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">负责人</p>
                            <p className="font-medium text-gray-800">{reservation.contactName}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {reservation.contactPhone}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">活动类型</p>
                            <p className="font-medium text-gray-800 flex items-center gap-2">
                              {activityType?.name}
                              {activityType?.isLargeEvent && (
                                <span className="px-1.5 py-0.5 bg-warning-100 text-warning-700 text-xs rounded">
                                  大型
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">{activityType?.description}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">参与人数</p>
                            <p className="font-medium text-gray-800">{reservation.participants} 人</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">安全备案</p>
                            <div className="flex items-center justify-between">
                              <span
                                className={`font-medium flex items-center gap-1 ${
                                  reservation.safetyRecord ? 'text-success-600' : 'text-gray-500'
                                }`}
                              >
                                {reservation.safetyRecord ? (
                                  <>
                                    <ShieldCheck className="w-4 h-4" />
                                    已备案
                                  </>
                                ) : (
                                  <>
                                    <ShieldAlert className="w-4 h-4" />
                                    未备案
                                  </>
                                )}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSafety(reservation.id);
                                }}
                                className="text-xs text-primary-600 hover:text-primary-700"
                              >
                                切换状态
                              </button>
                            </div>
                          </div>
                          {reservation.remarks && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">备注说明</p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {reservation.remarks}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {needsSafetyRecord && (
                        <div className="mb-4 p-4 bg-warning-50 border border-warning-200 rounded-xl flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-warning-800">需要安全备案</p>
                            <p className="text-sm text-warning-600 mt-1">
                              该活动为大型活动，必须通过安全备案才能审核通过。请先切换备案状态。
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReject(reservation.id)}
                          className="flex-1 btn-secondary flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          驳回
                        </button>
                        <button
                          onClick={() => handleApprove(reservation.id)}
                          disabled={needsSafetyRecord}
                          className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          通过
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'activityTypes' && (
        <div className="card stagger-3">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">活动名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">类型</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">描述</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {activityTypes.map((type) => (
                  <tr key={type.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-800 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary-500" />
                        {type.name}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {type.isLargeEvent ? (
                        <span className="px-2 py-1 bg-warning-100 text-warning-700 text-xs rounded-md">
                          大型活动
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                          常规活动
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">{type.description}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-md ${
                          type.isActive
                            ? 'bg-success-100 text-success-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {type.isActive ? '启用' : '停用'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActivityStatus(type.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={type.isActive ? '停用' : '启用'}
                        >
                          {type.isActive ? (
                            <ToggleRight className="w-4 h-4 text-success-500" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => openEditActivityType(type)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">驳回预约</h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                驳回原因 <span className="text-danger-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请详细说明驳回原因..."
                rows={4}
                className="input-field resize-none"
              />
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 btn-danger"
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      )}

      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editMode ? '编辑活动类型' : '添加活动类型'}
                </h3>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动名称 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  value={activityForm.name}
                  onChange={(e) => setActivityForm({ ...activityForm, name: e.target.value })}
                  placeholder="请输入活动类型名称"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">描述说明</label>
                <textarea
                  value={activityForm.description}
                  onChange={(e) =>
                    setActivityForm({ ...activityForm, description: e.target.value })
                  }
                  placeholder="请输入活动类型描述"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={activityForm.isLargeEvent}
                    onChange={(e) =>
                      setActivityForm({ ...activityForm, isLargeEvent: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <p className="font-medium text-gray-800">大型活动</p>
                    <p className="text-sm text-gray-500">
                      大型活动需要通过安全备案才能审核通过
                    </p>
                  </div>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowActivityModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button onClick={saveActivityType} className="flex-1 btn-primary">
                {editMode ? '保存修改' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
