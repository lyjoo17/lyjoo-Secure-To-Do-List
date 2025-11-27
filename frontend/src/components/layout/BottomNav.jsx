import { NavLink } from 'react-router-dom';
import { ListTodo, Trash2, Calendar, User } from 'lucide-react';

const BottomNav = () => {
  const navItems = [
    { to: '/todos', label: '할일', icon: ListTodo },
    { to: '/trash', label: '휴지통', icon: Trash2 },
    { to: '/holidays', label: '국경일', icon: Calendar },
    { to: '/profile', label: '프로필', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-10">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-6 py-3 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
              }`
            }
          >
            <item.icon className="w-6 h-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
