import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Save } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import api from '../../services/api';
import { API_ENDPOINTS } from '../../services/constants';

const profileSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
  email: z.string().email('유효한 이메일을 입력해주세요'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요'),
    newPassword: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
    confirmPassword: z.string().min(1, '비밀번호 확인을 입력해주세요'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const { showToast } = useUIStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, resetProfile]);

  const handleUpdateProfile = async (data) => {
    try {
      const response = await api.patch(API_ENDPOINTS.USER.ME, {
        name: data.name,
      });

      if (response.data.success) {
        updateUser(response.data.data);
        showToast('프로필이 수정되었습니다', 'success');
        setIsEditingProfile(false);
      }
    } catch (error) {
      showToast(error.response?.data?.message || '프로필 수정에 실패했습니다', 'error');
    }
  };

  const handleChangePassword = async (data) => {
    try {
      const response = await api.patch(`${API_ENDPOINTS.USER.ME}/password`, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      if (response.data.success) {
        showToast('비밀번호가 변경되었습니다', 'success');
        setIsChangingPassword(false);
        resetPassword();
      }
    } catch (error) {
      showToast(error.response?.data?.message || '비밀번호 변경에 실패했습니다', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">내 프로필</h1>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">기본 정보</h2>
            </div>
            {!isEditingProfile && (
              <Button size="sm" onClick={() => setIsEditingProfile(true)}>
                수정
              </Button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleSubmitProfile(handleUpdateProfile)} className="space-y-4">
              <Input
                label="이름"
                {...registerProfile('name')}
                error={profileErrors.name?.message}
                required
              />
              <Input
                label="이메일"
                type="email"
                {...registerProfile('email')}
                error={profileErrors.email?.message}
                disabled
                helperText="이메일은 변경할 수 없습니다"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditingProfile(false);
                    resetProfile();
                  }}
                >
                  취소
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" />
                  저장
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">이름</p>
                <p className="text-gray-900 dark:text-white font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">이메일</p>
                <p className="text-gray-900 dark:text-white font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">권한</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {user?.role === 'ADMIN' ? '관리자' : '사용자'}
                </p>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">비밀번호 변경</h2>
            </div>
            {!isChangingPassword && (
              <Button size="sm" onClick={() => setIsChangingPassword(true)}>
                변경
              </Button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handleSubmitPassword(handleChangePassword)} className="space-y-4">
              <Input
                label="현재 비밀번호"
                type="password"
                {...registerPassword('currentPassword')}
                error={passwordErrors.currentPassword?.message}
                required
              />
              <Input
                label="새 비밀번호"
                type="password"
                {...registerPassword('newPassword')}
                error={passwordErrors.newPassword?.message}
                required
              />
              <Input
                label="새 비밀번호 확인"
                type="password"
                {...registerPassword('confirmPassword')}
                error={passwordErrors.confirmPassword?.message}
                required
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsChangingPassword(false);
                    resetPassword();
                  }}
                >
                  취소
                </Button>
                <Button type="submit" className="gap-2">
                  <Save className="w-4 h-4" />
                  변경
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              보안을 위해 주기적으로 비밀번호를 변경해주세요
            </p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
