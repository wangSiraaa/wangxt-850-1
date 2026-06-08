import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { VENUE_TYPE_LABELS, VenueType, Reservation } from '@/types';
import { formatDate, getWeekDates, getTodayString } from '@/utils/timeUtils';
import { getReservationsByVenueAndDate } from '@/utils/conflictUtils';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Clock,
  Plus,
  Calendar as CalendarIcon,
  LayoutGrid,
  X,
} from 'lucide-react';
import StatusBadge, { SetupStatusBadge } from '@/components/StatusBadge';

export default function CalendarPage() {
  const navigate = useNavigate();
  const {
    venues,
    reservations,
    selectedDate,
    setSelectedDate,
    selectedVenueId,
    setSelectedVenueId,
    calendarView,
    setCalendarView,
    venueTypeFilter,
    setVenueTypeFilter,
    searchKeyword,
    setSearchKeyword,
    getFilteredVenues,
    currentRole,
  } = useAppStore();

  const [hoveredReservation, setHoveredReservation] = useState<Reservation | null>(null);

  const filteredVenues = getFilteredVenues();
  const weekDates = getWeekDates(new Date(selectedDate));
  const today = getTodayString();

  const prevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(formatDate(newDate));
  };

  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(formatDate(newDate));
  };

  const goToToday = () => {
    setSelectedDate(today);
  };

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-success-500';
      case 'pending':
        return 'bg-warning-500';
      case 'rejected':
        return 'bg-danger-500';
      case 'revoked':
        return 'bg-gray-400';
      case 'setup_completed':
        return 'bg-primary-500';
      default:
        return 'bg-gray-300';
    }
  };

  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = i + 8;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 stagger-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">场地日历</h2>
          <p className="text-gray-500 text-sm mt-1">查看各场地的预约占用情况</p>
        </div>
        {currentRole === 'club_leader' && (
          <button
            onClick={() => navigate('/reserve')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            发起预约
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 stagger-2">
        <div className="lg:w-72 space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              筛选条件
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  搜索场地
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="输入场地名称..."
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  场地类型
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setVenueTypeFilter(null)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      venueTypeFilter === null
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    全部场地
                  </button>
                  {(Object.keys(VENUE_TYPE_LABELS) as VenueType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setVenueTypeFilter(type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        venueTypeFilter === type
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {VENUE_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              视图切换
            </h3>
            <div className="flex gap-2">
              {(['day', 'week', 'month'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setCalendarView(view)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    calendarView === view
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {view === 'day' ? '日' : view === 'week' ? '周' : '月'}
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              场地列表
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredVenues.map((venue) => (
                <button
                  key={venue.id}
                  onClick={() => setSelectedVenueId(selectedVenueId === venue.id ? null : venue.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all ${
                    selectedVenueId === venue.id
                      ? 'bg-primary-50 border-2 border-primary-300'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <p className="font-medium text-gray-800 text-sm">{venue.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {VENUE_TYPE_LABELS[venue.type]} · {venue.building} {venue.floor}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    容纳 {venue.capacity} 人
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={prevWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                >
                  今天
                </button>
                <button
                  onClick={nextWeek}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="text-lg font-semibold text-gray-800 ml-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {formatDate(weekDates[0], 'MM月dd日')} - {formatDate(weekDates[6], 'MM月dd日, yyyy年')}
                </h3>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-success-500"></span>
                  <span className="text-gray-600">已通过</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-warning-500"></span>
                  <span className="text-gray-600">待审核</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-primary-500"></span>
                  <span className="text-gray-600">布置完成</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-8 border-b border-gray-200">
                  <div className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-200">
                    时间
                  </div>
                  {weekDates.map((date) => {
                    const dateStr = formatDate(date);
                    const isToday = dateStr === today;
                    return (
                      <div
                        key={dateStr}
                        className={`p-3 text-center border-r border-gray-100 last:border-r-0 ${
                          isToday ? 'bg-primary-50' : ''
                        }`}
                      >
                        <p className={`text-sm font-medium ${isToday ? 'text-primary-700' : 'text-gray-800'}`}>
                          {formatDate(date, 'MM/dd')}
                        </p>
                        <p className={`text-xs ${isToday ? 'text-primary-500' : 'text-gray-500'}`}>
                          {formatDate(date, 'EEE')}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="divide-y divide-gray-100">
                  {timeSlots.map((time) => (
                    <div key={time} className="grid grid-cols-8">
                      <div className="p-2 text-center text-xs text-gray-500 border-r border-gray-100 py-4">
                        {time}
                      </div>
                      {weekDates.map((date) => {
                        const dateStr = formatDate(date);
                        const displayVenues = selectedVenueId
                          ? venues.filter((v) => v.id === selectedVenueId)
                          : filteredVenues;

                        return (
                          <div
                            key={`${dateStr}-${time}`}
                            className="border-r border-gray-100 last:border-r-0 min-h-[80px] p-1 relative"
                          >
                            {displayVenues.length === 1 ? (
                              <>
                                {getReservationsByVenueAndDate(
                                  reservations,
                                  displayVenues[0].id,
                                  dateStr
                                )
                                  .filter((r) => r.startTime <= time && r.endTime > time)
                                  .map((reservation) => (
                                    <div
                                      key={reservation.id}
                                      onMouseEnter={() => setHoveredReservation(reservation)}
                                      onMouseLeave={() => setHoveredReservation(null)}
                                      className={`text-white text-xs p-1.5 rounded-md mb-1 cursor-pointer transition-all hover:opacity-90 ${getStatusColor(
                                        reservation.status
                                      )}`}
                                    >
                                      <p className="font-medium truncate">
                                        {reservation.activityName}
                                      </p>
                                      <p className="opacity-80 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {reservation.startTime}-{reservation.endTime}
                                      </p>
                                    </div>
                                  ))}
                              </>
                            ) : (
                              <div className="text-center text-xs text-gray-400 py-4">
                                {displayVenues.length} 个场地
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {hoveredReservation && (
            <div className="fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl p-4 w-80 z-40 animate-slide-in border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {hoveredReservation.activityName}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <StatusBadge status={hoveredReservation.status} />
                    {hoveredReservation.status === 'approved' && hoveredReservation.setupStatus && (
                      <SetupStatusBadge status={hoveredReservation.setupStatus} />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setHoveredReservation(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  {venues.find((v) => v.id === hoveredReservation.venueId)?.name}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-500" />
                  {hoveredReservation.date} {hoveredReservation.startTime} - {hoveredReservation.endTime}
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-500" />
                  {hoveredReservation.contactName} · {hoveredReservation.participants}人
                </p>
                {hoveredReservation.remarks && (
                  <p className="text-gray-500 bg-gray-50 p-2 rounded-lg">
                    {hoveredReservation.remarks}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
