import { useEffect, useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import useTodoStore from '../../store/todoStore';
import useUIStore from '../../store/uiStore';
import useHolidayStore from '../../store/holidayStore';
import Button from '../../components/common/Button';
import TodoCard from '../../components/todo/TodoCard';
import TodoFormModal from '../../components/todo/TodoFormModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import TodoSkeleton from '../../components/todo/TodoSkeleton';
import confetti from 'canvas-confetti';
import { isToday, isTomorrow, format } from 'date-fns';
import { ko } from 'date-fns/locale';

const TodoListPage = () => {
  const { todos, fetchTodos, addTodo, updateTodo, deleteTodo, toggleComplete, isLoading } =
    useTodoStore();
  const { showToast } = useUIStore();
  const { holidays, fetchHolidays } = useHolidayStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState('ACTIVE');

  useEffect(() => {
    fetchTodos(filter === 'ALL' ? null : filter);
    fetchHolidays(new Date().getFullYear());
  }, [filter, fetchTodos, fetchHolidays]);

  const checkTodayCompletion = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayTodos = todos.filter((todo) => {
      const todoDueDate = todo.dueDate?.split('T')[0];
      return todoDueDate === today && todo.status === 'ACTIVE';
    });

    if (todayTodos.length > 0 && todayTodos.every((todo) => todo.isCompleted)) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      showToast('오늘의 할일을 모두 완료했습니다! 🎉', 'success');
    }
  };

  const handleAddTodo = async (data) => {
    const result = await addTodo(data);
    if (result.success) {
      showToast('할일이 추가되었습니다', 'success');
    } else {
      showToast(result.error || '할일 추가에 실패했습니다', 'error');
    }
  };

  const handleUpdateTodo = async (data) => {
    const result = await updateTodo(editingTodo.id, data);
    if (result.success) {
      showToast('할일이 수정되었습니다', 'success');
      setEditingTodo(null);
    } else {
      showToast(result.error || '할일 수정에 실패했습니다', 'error');
    }
  };

  const handleToggle = async (id, isCompleted) => {
    await toggleComplete(id, isCompleted);
    checkTodayCompletion();
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const result = await deleteTodo(deleteId);
    if (result.success) {
      showToast('할일이 휴지통으로 이동되었습니다', 'success');
    } else {
      showToast(result.error || '할일 삭제에 실패했습니다', 'error');
    }
    setDeleteId(null);
  };

  const todayHoliday = holidays.find((h) => {
    const today = new Date().toISOString().split('T')[0];
    const holidayDate = new Date(h.date).toISOString().split('T')[0];
    return holidayDate === today;
  });

  const groupTodosByDate = (todos) => {
    const groups = {
      today: [],
      tomorrow: [],
      upcoming: [],
      noDate: [],
    };

    todos.forEach((todo) => {
      if (!todo.dueDate) {
        groups.noDate.push(todo);
      } else {
        const dueDate = new Date(todo.dueDate);
        if (isToday(dueDate)) {
          groups.today.push(todo);
        } else if (isTomorrow(dueDate)) {
          groups.tomorrow.push(todo);
        } else {
          groups.upcoming.push(todo);
        }
      }
    });

    return groups;
  };

  const groupedTodos = groupTodosByDate(todos);

  const todayDate = format(new Date(), 'yyyy년 MM월 dd일 (eee)', { locale: ko });

  return (
    <div className="max-w-4xl mx-auto">
      {todayHoliday && (
        <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900 border border-primary-200 dark:border-primary-700 rounded-lg flex items-center gap-3">
          <span className="text-2xl">📢</span>
          <p className="text-primary-800 dark:text-primary-200 font-medium">
            [오늘의 국경일] <strong>{todayHoliday.name}</strong>
          </p>
        </div>
      )}

      <div className="mb-8">
        <p className="text-gray-600 dark:text-gray-400 text-lg flex items-center gap-2">
          {todayDate} <span className="text-xl">⛅</span> 24°C (OpenWeather)
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">할일 목록</h1>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-5 h-5" />새 할일
        </Button>
      </div>

      <div className="mb-6 flex gap-2">
        <Button
          variant={filter === 'ACTIVE' ? 'primary' : 'secondary'}
          onClick={() => setFilter('ACTIVE')}
          size="sm"
        >
          진행중
        </Button>
        <Button
          variant={filter === 'COMPLETED' ? 'primary' : 'secondary'}
          onClick={() => setFilter('COMPLETED')}
          size="sm"
        >
          완료
        </Button>
        <Button
          variant={filter === 'ALL' ? 'primary' : 'secondary'}
          onClick={() => setFilter('ALL')}
          size="sm"
        >
          전체
        </Button>
      </div>

      {isLoading ? (
        <TodoSkeleton count={5} />
      ) : todos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">할일이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedTodos.today.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">오늘</h2>
              <div className="space-y-3">
                {groupedTodos.today.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onEdit={setEditingTodo}
                    onDelete={setDeleteId}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedTodos.tomorrow.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">내일</h2>
              <div className="space-y-3">
                {groupedTodos.tomorrow.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onEdit={setEditingTodo}
                    onDelete={setDeleteId}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedTodos.upcoming.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">예정</h2>
              <div className="space-y-3">
                {groupedTodos.upcoming.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onEdit={setEditingTodo}
                    onDelete={setDeleteId}
                  />
                ))}
              </div>
            </div>
          )}

          {groupedTodos.noDate.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                날짜 미정
              </h2>
              <div className="space-y-3">
                {groupedTodos.noDate.map((todo) => (
                  <TodoCard
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggle}
                    onEdit={setEditingTodo}
                    onDelete={setDeleteId}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <TodoFormModal
        isOpen={isModalOpen || !!editingTodo}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTodo(null);
        }}
        onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo}
        initialData={editingTodo}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="할일 삭제"
        message="이 할일을 휴지통으로 이동하시겠습니까?"
        confirmText="삭제"
        variant="danger"
      />
    </div>
  );
};

export default TodoListPage;
