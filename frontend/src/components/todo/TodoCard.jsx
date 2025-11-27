import { Calendar, Trash2, Edit2, Clock, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { format, differenceInDays, isToday, isPast } from 'date-fns';
import { ko } from 'date-fns/locale';

const TodoCard = ({ todo, onToggle, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MM.dd', { locale: ko });
    } catch {
      return dateString;
    }
  };

  const getDDayBadge = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diff = differenceInDays(due, today);

    if (diff < 0) return <Badge variant="danger">D+{-diff}</Badge>;
    if (diff === 0) return <Badge variant="danger">D-day</Badge>;
    if (diff <= 3) return <Badge variant="warning">D-{diff}</Badge>;
    return <Badge variant="secondary">D-{diff}</Badge>;
  };

  const handleCardClick = (e) => {
    if (
      e.target.type === 'checkbox' ||
      e.target.tagName === 'BUTTON' ||
      e.target.closest('button')
    ) {
      return;
    }
    onEdit(todo);
  };

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer group" onClick={handleCardClick}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.isCompleted}
          onChange={() => onToggle(todo.id, todo.isCompleted)}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer transition-transform hover:scale-110"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`font-medium text-gray-900 dark:text-white transition-all duration-300 ${
                todo.isCompleted ? 'line-through text-gray-500 dark:text-gray-600' : ''
              }`}
            >
              {todo.title}
            </h3>
            {/* 우선순위 (임시 로직: 제목에 [높음] 포함 시 배지 표시) */}
            {todo.title.includes('[높음]') && <Badge variant="danger">높음</Badge>}
          </div>

          {todo.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {todo.description}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            {(todo.startDate || todo.dueDate) && (
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                <Clock className="w-3 h-3" />
                <span>
                  {todo.startDate ? formatDate(todo.startDate) : '...'} ~{' '}
                  {todo.dueDate ? formatDate(todo.dueDate) : '...'}
                </span>
              </div>
            )}
            
            {todo.dueDate && !todo.isCompleted && getDDayBadge(todo.dueDate)}
            
            {todo.isCompleted && <Badge variant="success">완료</Badge>}
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(todo);
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110"
            title="수정"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(todo.id);
            }}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 text-red-600 transition-all hover:scale-110"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default TodoCard;
