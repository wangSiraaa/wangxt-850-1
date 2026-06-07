import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { VENUE_TYPE_LABELS, VenueType, Reservation } from '@/types';
import { generateTimeSlots, getTodayString, formatDate } from '@/utils/timeUtils';
import { checkConflict } from '@/utils/conflictUtils';
import {
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Phone,
  FileText,
  Tag,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  Info,
  Plus,
  Building2,
  ArrowLeft,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface FormData {
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
  safetyRecord: boolean;
}

const initialFormData: FormData = {
  venueId: '',
  activityTypeId: '',
  activityName: '',
  date: getTodayString(),
  startTime: '08:00',
  endTime: '10:00',
  participants: 10,
  contactName: '',
  contactPhone: '',
  remarks: '',
  safetyRecord: false,
};

export default function ReservePage() {
  const navigate = useNavigate();
  const {
    venues,
    activityTypes,
    reservations,
    createReservation,
    checkAndSetConflict,
    conflictInfo,
    setConflictInfo,
  } = useAppStore();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showVenueDropdown, setShowVenueDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [venueTypeFilter, setVenueTypeFilter] = useState<VenueType | 'all'>('all');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [liveConflict, setLiveConflict] = useState<{ hasConflict: boolean; message: string } | null>(null);

  const timeSlots = generateTimeSlots();
  const activeActivityTypes = activityTypes.filter((a) => a.isActive);
  const selectedVenue = venues.find((v) => v.id === formData.venueId);
  const selectedActivityType = activityTypes.find((a) => a.id === formData.activityTypeId);

  const filteredVenues =
    venueTypeFilter === 'all'
      ? venues
      : venues.filter((v) => v.type === venueTypeFilter);

  useEffect(() => {
    if (formData.venueId && formData.date && formData.startTime && formData.endTime) {
      const conflict = checkConflict(
        reservations,
        formData.venueId,
        formData.date,
        formData.startTime,
        formData.endTime
      );
      setLiveConflict(conflict.hasConflict ? conflict : null);
    } else {
      setLiveConflict(null);
    }
  }, [formData.venueId, formData.date, formData.startTime, formData.endTime, reservations]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.venueId) newErrors.venueId = '请选择场地';
    if (!formData.activityTypeId) newErrors.activityTypeId = '请选择活动类型';
    if (!formData.activityName.trim()) newErrors.activityName = '请输入活动名称';
    if (!formData.date) newErrors.date = '请选择日期';
    if (!formData.startTime) newErrors.startTime = '请选择开始时间';
    if (!formData.endTime) newErrors.endTime = '请选择结束时间';

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = '结束时间必须晚于开始时间';
    }

    if (formData.participants < 1) newErrors.participants = '参与人数必须大于0';
    if (selectedVenue && formData.participants > selectedVenue.capacity) {
      newErrors.participants = `参与人数不能超过场地容量(${selectedVenue.capacity}人)`;
    }

    if (!formData.contactName.trim()) newErrors.contactName = '请输入负责人姓名';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = '请输入联系电话';
    if (formData.contactPhone && !/^1[3-9]\d{9}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = '请输入正确的手机号';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (liveConflict?.hasConflict) {
      checkAndSetConflict(
        formData.venueId,
        formData.date,
        formData.startTime,
        formData.endTime
      );
      return;
    }

    if (selectedActivityType?.isLargeEvent && !formData.safetyRecord) {
      setErrors({
        ...errors,
        safetyRecord: '大型活动必须通过安全备案',
      });
      return;
    }

    const result = createReservation({
      venueId: formData.venueId,
      activityTypeId: formData.activityTypeId,
      activityName: formData.activityName,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      participants: formData.participants,
      contactName: formData.contactName,
      contactPhone: formData.contactPhone,
      remarks: formData.remarks,
      safetyRecord: formData.safetyRecord,
    });

    if (result.success) {
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  const getEndTimeOptions = () => {
    const startIdx = timeSlots.indexOf(formData.startTime);
    return timeSlots.slice(startIdx + 1);
  };

  if (submitSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center animate-fade-in-up">
        <div className="text-center">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">预约提交成功</h2>
          <p className="text-gray-500 mb-6">您的预约已提交，等待学生会审核</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            返回日历查看
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4 stagger-1">
        <button
          onClick={() => navigate('/')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">发起预约</h2>
          <p className="text-gray-500 text-sm mt-1">填写活动信息，提交预约申请</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 stagger-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              选择场地
            </h3>

            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                {(['all', 'classroom', 'playground', 'lecture_hall'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setVenueTypeFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      venueTypeFilter === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'all' ? '全部' : VENUE_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowVenueDropdown(!showVenueDropdown)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                    errors.venueId
                      ? 'border-danger-400 animate-pulse-border'
                      : selectedVenue
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selectedVenue ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-800">{selectedVenue.name}</p>
                        <p className="text-xs text-gray-500">
                          {VENUE_TYPE_LABELS[selectedVenue.type]} · {selectedVenue.building} {selectedVenue.floor} · 容纳{selectedVenue.capacity}人
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">请选择场地</span>
                  )}
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showVenueDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showVenueDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto z-30 animate-fade-in-up">
                    {filteredVenues.map((venue) => (
                      <button
                        key={venue.id}
                        onClick={() => {
                          setFormData({ ...formData, venueId: venue.id });
                          setShowVenueDropdown(false);
                          setErrors({ ...errors, venueId: undefined });
                        }}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                          formData.venueId === venue.id ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{venue.name}</p>
                              <p className="text-xs text-gray-500">
                                {VENUE_TYPE_LABELS[venue.type]} · {venue.building} {venue.floor}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {venue.capacity}人
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {venue.facilities.slice(0, 3).join('、')}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.venueId && <p className="text-danger-500 text-sm mt-2">{errors.venueId}</p>}
            </div>

            {selectedVenue && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">场地设施</p>
                <div className="flex flex-wrap gap-2">
                  {selectedVenue.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="px-2 py-1 bg-white rounded-md text-xs text-gray-600 border border-gray-200"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card stagger-3">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary-500" />
              选择时间
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预约日期
                </label>
                <input
                  type="date"
                  value={formData.date}
                  min={getTodayString()}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`input-field ${errors.date ? 'border-danger-400' : ''}`}
                />
                {errors.date && <p className="text-danger-500 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  开始时间
                </label>
                <select
                  value={formData.startTime}
                  onChange={(e) => {
                    const newStartTime = e.target.value;
                    const newEndTime = timeSlots[timeSlots.indexOf(newStartTime) + 2] || formData.endTime;
                    setFormData({ ...formData, startTime: newStartTime, endTime: newEndTime });
                  }}
                  className={`input-field ${errors.startTime ? 'border-danger-400' : ''}`}
                >
                  {timeSlots.slice(0, -1).map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {errors.startTime && <p className="text-danger-500 text-sm mt-1">{errors.startTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  结束时间
                </label>
                <select
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={`input-field ${errors.endTime ? 'border-danger-400' : ''}`}
                >
                  {getEndTimeOptions().map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {errors.endTime && <p className="text-danger-500 text-sm mt-1">{errors.endTime}</p>}
              </div>
            </div>

            {liveConflict && (
              <div className="mt-4 p-4 bg-danger-50 border border-danger-200 rounded-xl flex items-start gap-3 animate-pulse-border">
                <AlertTriangle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-danger-800">{liveConflict.message}</p>
                  <p className="text-sm text-danger-600 mt-1">请选择其他时段或场地</p>
                </div>
              </div>
            )}

            {!liveConflict && formData.venueId && formData.date && (
              <div className="mt-4 p-4 bg-success-50 border border-success-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-success-800">该时段可用</p>
                  <p className="text-sm text-success-600 mt-1">可以提交预约申请</p>
                </div>
              </div>
            )}
          </div>

          <div className="card stagger-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              活动信息
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动类型
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowActivityDropdown(!showActivityDropdown)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      errors.activityTypeId
                        ? 'border-danger-400 animate-pulse-border'
                        : selectedActivityType
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {selectedActivityType ? (
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedActivityType.isLargeEvent ? 'bg-warning-100' : 'bg-primary-100'}`}>
                          <Tag className={`w-5 h-5 ${selectedActivityType.isLargeEvent ? 'text-warning-600' : 'text-primary-600'}`} />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-800 flex items-center gap-2">
                            {selectedActivityType.name}
                            {selectedActivityType.isLargeEvent && (
                              <span className="px-1.5 py-0.5 bg-warning-100 text-warning-700 text-xs rounded-md">
                                大型活动
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{selectedActivityType.description}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">请选择活动类型</span>
                    )}
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showActivityDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showActivityDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-30 animate-fade-in-up">
                      {activeActivityTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => {
                            setFormData({ ...formData, activityTypeId: type.id });
                            setShowActivityDropdown(false);
                            setErrors({ ...errors, activityTypeId: undefined });
                          }}
                          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                            formData.activityTypeId === type.id ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${type.isLargeEvent ? 'bg-warning-100' : 'bg-primary-100'}`}>
                                <Tag className={`w-4 h-4 ${type.isLargeEvent ? 'text-warning-600' : 'text-primary-600'}`} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 flex items-center gap-2">
                                  {type.name}
                                  {type.isLargeEvent && (
                                    <span className="px-1.5 py-0.5 bg-warning-100 text-warning-700 text-xs rounded">
                                      大型
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">{type.description}</p>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.activityTypeId && <p className="text-danger-500 text-sm mt-2">{errors.activityTypeId}</p>}
              </div>

              {selectedActivityType?.isLargeEvent && (
                <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-warning-800">大型活动提示</p>
                      <p className="text-sm text-warning-600 mt-1 mb-3">
                        该活动类型为大型活动，必须通过安全备案才能提交预约
                      </p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.safetyRecord}
                          onChange={(e) => {
                            setFormData({ ...formData, safetyRecord: e.target.checked });
                            if (e.target.checked) {
                              setErrors({ ...errors, safetyRecord: undefined });
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-warning-600 focus:ring-warning-500"
                        />
                        <span className="text-sm text-gray-700">已通过安全备案</span>
                      </label>
                      {errors.safetyRecord && (
                        <p className="text-danger-500 text-sm mt-2">{errors.safetyRecord}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  活动名称
                </label>
                <input
                  type="text"
                  value={formData.activityName}
                  onChange={(e) => setFormData({ ...formData, activityName: e.target.value })}
                  placeholder="请输入活动名称"
                  className={`input-field ${errors.activityName ? 'border-danger-400' : ''}`}
                />
                {errors.activityName && <p className="text-danger-500 text-sm mt-1">{errors.activityName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  参与人数
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) || 0 })}
                    min="1"
                    max={selectedVenue?.capacity || 9999}
                    className={`input-field pl-10 ${errors.participants ? 'border-danger-400' : ''}`}
                  />
                  {selectedVenue && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                      / {selectedVenue.capacity} 人
                    </span>
                  )}
                </div>
                {errors.participants && <p className="text-danger-500 text-sm mt-1">{errors.participants}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    负责人姓名
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="请输入负责人姓名"
                    className={`input-field ${errors.contactName ? 'border-danger-400' : ''}`}
                  />
                  {errors.contactName && <p className="text-danger-500 text-sm mt-1">{errors.contactName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系电话
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="请输入联系电话"
                      className={`input-field pl-10 ${errors.contactPhone ? 'border-danger-400' : ''}`}
                    />
                  </div>
                  {errors.contactPhone && <p className="text-danger-500 text-sm mt-1">{errors.contactPhone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注说明（选填）
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="请输入活动其他说明或特殊要求"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 stagger-5">
            <button
              onClick={() => navigate('/')}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={!!liveConflict}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              提交预约
            </button>
          </div>
        </div>

        <div className="space-y-6 stagger-3">
          <div className="card sticky top-28">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">预约预览</h3>

            <div className="space-y-4">
              <div className="p-4 bg-primary-50 rounded-xl">
                <p className="text-xs text-primary-500 font-medium mb-1">场地</p>
                <p className="font-medium text-primary-800">
                  {selectedVenue?.name || '未选择'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium mb-1">时间</p>
                <p className="font-medium text-gray-800">
                  {formData.date ? formatDate(formData.date, 'MM月dd日') : '未选择'}
                </p>
                <p className="text-sm text-gray-500">
                  {formData.startTime} - {formData.endTime}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium mb-1">活动</p>
                <p className="font-medium text-gray-800">
                  {formData.activityName || '未填写'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedActivityType?.name || '未选择类型'} · {formData.participants}人
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium mb-1">负责人</p>
                <p className="font-medium text-gray-800">
                  {formData.contactName || '未填写'}
                </p>
                <p className="text-sm text-gray-500">{formData.contactPhone || '未填写'}</p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-3">提交后状态</p>
                <StatusBadge status="pending" />
                <p className="text-xs text-gray-400 mt-2">
                  提交后需等待学生会管理员审核，审核通过后生效
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-primary-50 to-white">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary-500" />
              预约规则
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-1.5 flex-shrink-0"></span>
                同一时间段不能重复占用场地
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-warning-400 rounded-full mt-1.5 flex-shrink-0"></span>
                大型活动需通过安全备案
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></span>
                撤销预约后场地立即释放
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
