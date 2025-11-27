const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-gray-300 dark:bg-gray-700';

  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />;
};

export default Skeleton;
