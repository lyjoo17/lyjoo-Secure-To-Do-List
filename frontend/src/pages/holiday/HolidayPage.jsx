import { useEffect, useState } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import useHolidayStore from '../../store/holidayStore';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const HolidayPage = () => {
  const { holidays, fetchHolidays, syncHolidays, isLoading } = useHolidayStore();
  const { showToast } = useUIStore();
  const { user } = useAuthStore();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchHolidays(selectedYear);
  }, [selectedYear, fetchHolidays]);

  const handleSync = async () => {
    const result = await syncHolidays(selectedYear);
    if (result.success) {
      showToast('국경일이 동기화되었습니다', 'success');
      fetchHolidays(selectedYear);
    } else {
      showToast(result.error || '국경일 동기화에 실패했습니다', 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MM월 dd일 (EEEE)', { locale: ko });
    } catch {
      return dateString;
    }
  };

  const groupedHolidays = holidays.reduce((acc, holiday) => {
    const month = new Date(holiday.date).getMonth() + 1;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(holiday);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">국경일</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            대한민국의 공휴일 및 국경일을 확인하세요
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <Button onClick={handleSync} className="gap-2">
            <RefreshCw className="w-5 h-5" />
            동기화
          </Button>
        )}
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
            <Button
              key={year}
              variant={year === selectedYear ? 'primary' : 'secondary'}
              onClick={() => setSelectedYear(year)}
              size="sm"
            >
              {year}년
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : holidays.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">등록된 국경일이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedHolidays)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([month, monthHolidays]) => (
              <div key={month}>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{month}월</h2>
                <div className="space-y-3">
                  {monthHolidays.map((holiday) => (
                    <Card key={holiday.id}>
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg">
                            <Calendar className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {holiday.name}
                            </h3>
                            {holiday.isRecurring && <Badge variant="primary">매년</Badge>}
                          </div>
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(holiday.date)}
                          </p>
                          {holiday.description && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                              {holiday.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default HolidayPage;
