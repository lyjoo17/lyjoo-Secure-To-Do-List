import Skeleton from '../common/Skeleton';
import Card from '../common/Card';

const TodoSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <div className="flex items-start gap-3">
            <Skeleton className="w-5 h-5 rounded" variant="rectangular" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" variant="text" />
              <Skeleton className="h-4 w-1/2" variant="text" />
              <Skeleton className="h-4 w-1/4" variant="text" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-lg" variant="rectangular" />
              <Skeleton className="w-8 h-8 rounded-lg" variant="rectangular" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TodoSkeleton;
