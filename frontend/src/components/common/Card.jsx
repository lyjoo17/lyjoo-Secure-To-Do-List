const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`${className} rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
      }`}
    >
      {children}
    </div>
  );
};

export default Card;
