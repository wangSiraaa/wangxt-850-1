import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { VENUE_TYPE_LABELS, SETUP_STATUS_LABELS, SetupStatus } from '@/types';
import { formatDate } from '@/utils/timeUtils';
import {
  Wrench,
  MapPin,
  Clock,
  Users,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar as CalendarIcon,
  Building2,
  Search,
  X,
  ChevronDown,
  Play,
  Pause,
  AlertTriangle,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function SetupPage() {
  const { venues, activityTypes, getSetupTasks, updateSetupStatus } = useAppStore();

  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [filterSetupStatus, setFilterSetupStatus] = useState<'all' | SetupStatus>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const setupTasks = getSetupTasks();

  const filteredTasks = setupTasks.filter((task) => {
    const venue = venues.find((v) => v.id === task.venueId);
    const activityType = activityTypes.find((a) => a.id === task.activityTypeId);

    if (filterSetupStatus !== 'all') {
      const taskSetupStatus = task.setupStatus || 'pending';
      if (taskSetupStatus !== filterSetupStatus) return false;
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      const matchVenue = venue?.name.toLowerCase().includes(keyword);
      const matchActivity = task.activityName.toLowerCase().includes(keyword);
      const matchType = activityType?.name.toLowerCase().includes(keyword);
      if (!matchVenue && !matchActivity && !matchType) return false;
    }

    return true;
  });

  const getSetupStatus = (task: typeof setupTasks[0]): SetupStatus => {
    return task.setupStatus || 'pending';
  };

  const statusCounts = {
    pending: setupTasks.filter((t) => getSetupStatus(t) === 'pending').length,
    in_progress: setupTasks.filter((t) => getSetupStatus(t) === 'in_progress').length,
    completed: setupTasks.filter((t) => getSetupStatus(t) === 'completed').length,
    abnormal: setupTasks.filter((t) => getSetupStatus(t) === 'abnormal').length,
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpdateSetupStatus = (taskId: string, status: SetupStatus) => {
    const result = updateSetupStatus(taskId, status);
    if (result.success) {
      showMessage('success', result.message);
    } else {
      showMessage('error', result.message);
    }
  };

  const getVenueById = (id: string) => venues.find((v) => v.id === id);
  const getActivityTypeById = (id: string) => activityTypes.find((a) => a.id === id);

  const groupTasksByDate = () => {
    const groups: Record<string, typeof filteredTasks> = {};
    filteredTasks.forEach((task) => {
      if (!groups[task.date]) {
        groups[task.date] = [];
      }
      groups[task.date].push(task);
    });
    return groups;
  };

  const groupedTasks = groupTasksByDate();

  const SetupStatusBadge = ({ status }: { status: SetupStatus }) => {
    const { label, color, dotColor } = SETUP_STATUS_LABELS[status];
    return (
      <span className={`badge ${color} flex items-center`}>
        <span className={`w-2 h-2 rounded-full ${dotColor} mr-1.5`} />
        {label}
      </span>
    );
  };

  const StatusLegend = () => (
    <div className="card p-4">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Wrench className="w-4 h-4" />
        布置状态图例
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(Object.keys(SETUP_STATUS_LABELS) as SetupStatus[]).map((status) => {
          const { label, color, dotColor } = SETUP_STATUS_LABELS[status];
          return (
            <div key={status} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${dotColor}`} />
              <span className="text-sm text-gray-600">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 stagger-1">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">布置清单</h2>
          <p className="text-gray-500 text-sm mt-1">查看需要布置的场地任务清单</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-warning-50 text-warning-700 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">待布置 {statusCounts.pending}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-info-50 text-info-700 rounded-lg">
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">布置中 {statusCounts.in_progress}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 text-success-700 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">已完成 {statusCounts.completed}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-danger-50 text-danger-700 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">异常 {statusCounts.abnormal}</span>
          </div>
        </div>
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
            <X className="w-5 h-5 text-danger-500 flex-shrink-0" />
          )}
          <p className={message.type === 'success' ? 'text-success-800' : 'text-danger-800'}>
            {message.text}
          </p>
        </div>
      )}

      <div className="stagger-2">
        <StatusLegend />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 stagger-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索场地、活动名称..."
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
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'in_progress', 'completed', 'abnormal'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterSetupStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterSetupStatus === status
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'all'
                ? '全部'
                : status === 'pending'
                ? '待布置'
                : status === 'in_progress'
                ? '布置中'
                : status === 'completed'
                ? '已完成'
                : '异常'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 stagger-3">
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8 text-success-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无布置任务</h3>
            <p className="text-gray-500">
              {filterSetupStatus === 'pending'
                ? '当前没有待布置的任务'
                : filterSetupStatus === 'in_progress'
                ? '当前没有布置中的任务'
                : filterSetupStatus === 'completed'
                ? '当前没有已完成的布置任务'
                : filterSetupStatus === 'abnormal'
                ? '当前没有异常状态的任务'
                : '还没有任何布置任务'}
            </p>
          </div>
        ) : (
          Object.entries(groupedTasks).map(([date, tasks]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-4 h-4 text-primary-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  {formatDate(date, 'yyyy年MM月dd日 EEEE')}
                </h3>
                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                  {tasks.length} 项任务
                </span>
              </div>
              <div className="space-y-4">
                {tasks.map((task) => {
                  const venue = getVenueById(task.venueId);
                  const activityType = getActivityTypeById(task.activityTypeId);
                  const isExpanded = selectedTask === task.id;
                  const setupStatus = getSetupStatus(task);

                  return (
                    <div
                      key={task.id}
                      className={`card overflow-hidden ${
                        setupStatus === 'completed' ? 'opacity-70' : ''
                      }`}
                    >
                      <div
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => setSelectedTask(isExpanded ? null : task.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                SETUP_STATUS_LABELS[setupStatus].dotColor
                              }`}
                            />
                            <h4 className="text-lg font-semibold text-gray-800">
                              {task.activityName}
                            </h4>
                            <StatusBadge status={task.status} />
                            <SetupStatusBadge status={setupStatus} />
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
                              {task.startTime} - {task.endTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-primary-500" />
                              {task.participants}人
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-4 h-4 text-primary-500" />
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
                                <p className="text-xs text-gray-500 mb-1">场地信息</p>
                                <p className="font-medium text-gray-800">{venue?.name}</p>
                                <p className="text-sm text-gray-500">
                                  {VENUE_TYPE_LABELS[venue?.type || 'classroom']} ·{' '}
                                  {venue?.building} {venue?.floor}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">场地设施</p>
                                <div className="flex flex-wrap gap-2">
                                  {venue?.facilities.map((facility) => (
                                    <span
                                      key={facility}
                                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                                    >
                                      {facility}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">负责人</p>
                                <p className="font-medium text-gray-800">{task.contactName}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {task.contactPhone}
                                </p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">活动类型</p>
                                <p className="font-medium text-gray-800">
                                  {activityType?.name}
                                  {activityType?.isLargeEvent && (
                                    <span className="ml-2 px-1.5 py-0.5 bg-warning-100 text-warning-700 text-xs rounded">
                                      大型
                                    </span>
                                  )}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {activityType?.description}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">参与人数</p>
                                <p className="font-medium text-gray-800">
                                  {task.participants} 人
                                </p>
                                <p className="text-sm text-gray-500">
                                  场地容量 {venue?.capacity} 人
                                </p>
                              </div>
                              {task.remarks && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">布置要求</p>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {task.remarks}
                                  </p>
                                </div>
                              )}
                              {task.auditRemark && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">审核备注</p>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {task.auditRemark}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {setupStatus !== 'completed' && (
                            <div className="flex flex-wrap justify-end gap-2">
                              {setupStatus === 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateSetupStatus(task.id, 'in_progress');
                                  }}
                                  className="btn-info flex items-center gap-2"
                                >
                                  <Play className="w-4 h-4" />
                                  开始布置
                                </button>
                              )}
                              {setupStatus === 'in_progress' && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateSetupStatus(task.id, 'completed');
                                    }}
                                    className="btn-success flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    布置完成
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateSetupStatus(task.id, 'abnormal');
                                    }}
                                    className="btn-danger flex items-center gap-2"
                                  >
                                    <AlertTriangle className="w-4 h-4" />
                                    标记异常
                                  </button>
                                </>
                              )}
                              {setupStatus === 'abnormal' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateSetupStatus(task.id, 'in_progress');
                                  }}
                                  className="btn-info flex items-center gap-2"
                                >
                                  <Play className="w-4 h-4" />
                                  继续布置
                                </button>
                              )}
                            </div>
                          )}

                          {setupStatus === 'completed' && (
                            <div className="flex justify-end">
                              <span className="px-4 py-2 bg-success-50 text-success-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                布置已完成
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
