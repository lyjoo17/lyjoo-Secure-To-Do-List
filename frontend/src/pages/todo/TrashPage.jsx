import { useEffect, useState } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import useTodoStore from '../../store/todoStore';
import useUIStore from '../../store/uiStore';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const TrashPage = () => {
  const { todos, fetchTodos, restoreTodo, permanentDeleteTodo, isLoading } = useTodoStore();
  const { showToast } = useUIStore();

  const [restoreId, setRestoreId] = useState(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState(null);

  useEffect(() => {
    fetchTodos('DELETED');
  }, [fetchTodos]);

  const handleRestore = async () => {
    if (!restoreId) return;

    const result = await restoreTodo(restoreId);
    if (result.success) {
      showToast('할일이 복원되었습니다', 'success');
      fetchTodos('DELETED');
    } else {
      showToast(result.error || '할일 복원에 실패했습니다', 'error');
    }
    setRestoreId(null);
  };

  const handlePermanentDelete = async () => {
    if (!permanentDeleteId) return;

    const result = await permanentDeleteTodo(permanentDeleteId);
    if (result.success) {
      showToast('할일이 영구 삭제되었습니다', 'success');
      fetchTodos('DELETED');
    } else {
      showToast(result.error || '할일 삭제에 실패했습니다', 'error');
    }
    setPermanentDeleteId(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy년 MM월 dd일', { locale: ko });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">휴지통</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          삭제된 할일을 복원하거나 영구 삭제할 수 있습니다
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">휴지통이 비어있습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todos.map((todo) => (
            <Card key={todo.id}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white">{todo.title}</h3>
                  {todo.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {todo.description}
                    </p>
                  )}
                  {todo.deletedAt && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      삭제일: {formatDate(todo.deletedAt)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setRestoreId(todo.id)}
                    className="gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    복원
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setPermanentDeleteId(todo.id)}
                    className="gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    영구 삭제
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!restoreId}
        onClose={() => setRestoreId(null)}
        onConfirm={handleRestore}
        title="할일 복원"
        message="이 할일을 복원하시겠습니까?"
        confirmText="복원"
        variant="primary"
      />

      <ConfirmDialog
        isOpen={!!permanentDeleteId}
        onClose={() => setPermanentDeleteId(null)}
        onConfirm={handlePermanentDelete}
        title="영구 삭제"
        message="이 할일을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="영구 삭제"
        variant="danger"
      />
    </div>
  );
};

export default TrashPage;
