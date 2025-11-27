import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const registerSchema = z
  .object({
    username: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    password: z.string().min(6, '비밀번호는 최소 6자 이상이어야 합니다'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const { showToast } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await registerUser(data.username, data.email, data.password);
    setIsLoading(false);

    if (result.success) {
      showToast('회원가입이 완료되었습니다', 'success');
      navigate('/todos');
    } else {
      showToast(result.error || '회원가입에 실패했습니다', 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary">lyjoo TodoList</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">새로운 계정을 만들어보세요</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">회원가입</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="이름"
              type="text"
              {...register('username')}
              error={errors.username?.message}
              placeholder="홍길동"
              required
            />

            <Input
              label="이메일"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="example@email.com"
              required
            />

            <Input
              label="비밀번호"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              placeholder="최소 6자 이상"
              required
            />

            <Input
              label="비밀번호 확인"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              placeholder="비밀번호 재입력"
              required
            />

            <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
              {isLoading ? '가입 중...' : '회원가입'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
