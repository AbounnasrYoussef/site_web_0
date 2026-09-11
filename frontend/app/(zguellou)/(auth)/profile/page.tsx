'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/(zguellou)/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import Input from '@/components/input';
import { useAuthFetch } from '@/app/(zguellou)/hooks/useAuthFetch';
import EditIcon from '@/public/icons/auth/EditIcon';
import LogoutIcon from '@/public/icons/auth/LogoutIcon';
import FullButton from '@/components/full-button';
import { useMediaQuery } from '@/app/(zguellou)/hooks/useMediaQuery';

// Add these imports after your existing imports
import AgricultureIcon from '@/public/icons/auth/categories/AgricultureIcon';
import CommunicationIcon from '@/public/icons/auth/categories/CommunicationIcon';
import DefenseIcon from '@/public/icons/auth/categories/DefenseIcon';
import EconomyIcon from '@/public/icons/auth/categories/EconomyIcon';
import EducationIcon from '@/public/icons/auth/categories/EducationIcon';
import HealthIcon from '@/public/icons/auth/categories/HealthIcon';
import IslamIcon from '@/public/icons/auth/categories/IslamIcon';
import MarineIcon from '@/public/icons/auth/categories/MarineIcon';
import ScienceIcon from '@/public/icons/auth/categories/ScienceIcon';
import SportIcon from '@/public/icons/auth/categories/SportIcon';
import TourismeIcon from '@/public/icons/auth/categories/TourismeIcon';
import UrbanismeIcon from '@/public/icons/auth/categories/UrbanismeIcon';
import ToggleSwitch from '@/components/toggle-switch';

const categoryIconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'AGRICULTURE_ENVIRONMENT_SUSTAINABLE': AgricultureIcon,
  'DEFENSE_SECURITY': DefenseIcon,
  'ECONOMICS_TRADE_MANAGEMENT': EconomyIcon,
  'EDUCATION_TEACHING': EducationIcon,
  'ISLAMIC_SCIENCES': IslamIcon,
  'LANGUAGES_CULTURE_ARTS_SOCIAL': CommunicationIcon,
  'MARITIME': MarineIcon,
  'MEDICAL_PARAMEDICAL': HealthIcon,
  'SCIENCE_TECHNOLOGY_ENGINEERING': ScienceIcon,
  'SPORTS_PHYSICAL_EDUCATION': SportIcon,
  'TOURISM_HOSPITALITY': TourismeIcon,
  'URBAN_PLANNING_PUBLIC_WORKS_LOGISTICS': UrbanismeIcon,
};

export default function ProfilePage() {
  const { user, accessToken, isLoading, isInitialized, refreshToken, clearAuth } = useAuth();
  const authFetch = useAuthFetch();
  const [fullUser, setFullUser] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [password, setPassword] = useState('');
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const lockTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lockRemainingSeconds, setLockRemainingSeconds] = useState<number | null>(null);
  const lockIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();
  const t = useTranslations();

  const isMdOrLarger = useMediaQuery("768px");


  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
  const isGoogleUser = fullUser?.auth_provider === 'GOOGLE';

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user && !accessToken) {
      refreshToken().catch(() => router.replace('/login'));
    }
  }, [isInitialized, user, accessToken, refreshToken, router]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await authFetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/profile`, {
          method: 'GET',
        });

        if (res.status === 403) {
          throw new Error('Forbidden');
        }
        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();
        setFullUser(data.user);
      } catch (error) {
        console.error('Profile fetch error:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isInitialized, user, accessToken, router, clearAuth]);

  useEffect(() => {
    if (fullUser) {
      setIs2FAEnabled(fullUser.is_2fa_enabled || false);
    }
  }, [fullUser]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle2FA = async (enabled: boolean) => {
    if (!accessToken) return;

    setToggleError(null);
    setSuccessMessage(null);
    setToggling2FA(true);

    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/profile/2fa`,
        {
          method: 'PATCH',
          body: JSON.stringify({ password, enabled }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          const lockedUntil = data.locked_until;
          const lockTime = new Date(lockedUntil);
          const now = new Date();
          const seconds = Math.floor((lockTime.getTime() - now.getTime()) / 1000);

          setIsLocked(true);
          setLockRemainingSeconds(seconds);
          setToggleError(`${data.error} (${formatTime(seconds)} ${t('profile.2fa.remaining')})`);

          if (lockIntervalRef.current) {
            clearInterval(lockIntervalRef.current);
            lockIntervalRef.current = null;
          }
          if (lockTimeoutRef.current) {
            clearTimeout(lockTimeoutRef.current);
            lockTimeoutRef.current = null;
          }

          lockIntervalRef.current = setInterval(() => {
            setLockRemainingSeconds((prev) => {
              if (prev === null || prev <= 1) {
                clearInterval(lockIntervalRef.current!);
                lockIntervalRef.current = null;
                setIsLocked(false);
                setLockRemainingSeconds(null);
                setToggleError(null);
                return null;
              }
              const newSeconds = prev - 1;
              setToggleError(`${data.error} (${formatTime(newSeconds)} ${t('profile.2fa.remaining')})`);
              return newSeconds;
            });
          }, 1000);

          lockTimeoutRef.current = setTimeout(() => {
            if (lockIntervalRef.current) {
              clearInterval(lockIntervalRef.current);
              lockIntervalRef.current = null;
            }
            setIsLocked(false);
            setLockRemainingSeconds(null);
            setToggleError(null);
            lockTimeoutRef.current = null;
          }, seconds * 1000 + 1000); // extra second for safety

          return;
        }
        throw new Error(data.error || data.message || t('profile.2fa.toggleError'));
      }

      setIs2FAEnabled(enabled);
      setFullUser((prev: any) => ({ ...prev, is_2fa_enabled: enabled }));
      setShowPasswordConfirm(false);
      setPassword('');

      const msg = enabled ? t('profile.2fa.enabled') : t('profile.2fa.disabled');
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      setToggleError(error.message);
    } finally {
      setToggling2FA(false);
    }
  };

  const closePasswordModal = () => {
    if (lockTimeoutRef.current) {
      clearTimeout(lockTimeoutRef.current);
      lockTimeoutRef.current = null;
    }
    setIsLocked(false);
    setShowPasswordConfirm(false);
    setPassword('');
    setToggleError(null);
  };

  if (!isInitialized || isLoading || loadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen dotted-bg">
        <div className="text-xl font-bold">{t('profile.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen dotted-bg">
        <div className="text-xl font-bold">{t('profile.redirecting')}</div>
      </div>
    );
  }

  if (!fullUser) return null;

  const truncateName = (str: string | null | undefined, maxLength: number = 20): string => {
    if (!str) return '-';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  };

  let sharedStyles = "bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)] p-4 sm:p-8 mb-8";
  let labelStyle = "text-xs uppercase font-bold text-(--color-text) mb-1 whitespace-nowrap";
  let inputStyle = "bg-(--color-light) text-lg font-semibold border-2 px-3 py-2 whitespace-nowrap";

  return (
    <main className="min-h-screen p-6 dotted-bg">
      <div className="max-w-7xl mx-auto">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className={`${sharedStyles} flex flex-wrap items-center justify-between gap-4`}>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {fullUser.profile_pic ? (
              <img
                src={fullUser.profile_pic}
                alt={t('profile.profilePicture')}
                className="w-20 h-20 object-cover border-2 border-(--color-text) bg-(--color-grey)"
              />
            ) : (
              <div className="w-20 h-20 border-2 border-(--color-text) bg-(--color-grey) flex items-center justify-center text-3xl font-bold text-(--color-muted)">
                {fullUser.first_name?.[0] || '?'}
              </div>
            )}
            <div>
              <h1 className="text-3xl text-center font-black uppercase">
                <span title={fullUser.first_name || ''}>
                  {isMdOrLarger
                    ? truncateName(fullUser.first_name)
                    : truncateName(fullUser.first_name, 10)
                  }
                </span>
                {' '}
                <span title={fullUser.last_name || ''}>
                  {isMdOrLarger
                    ? truncateName(fullUser.last_name)
                    : truncateName(fullUser.last_name, 10)
                  }
                </span>
              </h1>
              <div className="flex justify-center sm:justify-start items-center gap-3 mt-1">
                <span className="border-2 border-(--color-text) bg-(--color-accent-soft) px-3 py-0.5 text-xs font-bold uppercase">
                  {t('profile.role')}: {user.role}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-row flex-wrap md:flex-col gap-2">
            <FullButton
              text={t('profile.edit')}
              className="flex-1 justify-center"
              classNameText='text-md font-bold text-(--color-text) whitespace-nowrap'
              backgroundColor="var(--color-highlight)"
            >
              <EditIcon className="w-5 h-5 text-(--color-text)" />
            </FullButton>
            <FullButton
              onClick={clearAuth}
              text={t('profile.logout')}
              className="flex-1 justify-center"
              classNameText='text-md font-bold text-(--color-text) whitespace-nowrap'
              backgroundColor="var(--color-error)"
            >
              <LogoutIcon className="w-5 h-5 text-(--color-text)" />
            </FullButton>
          </div>
        </div>

        {/* ─── Personal Information ──────────────────────────── */}
        <section className={`${sharedStyles}`}>
          <h2 className="text-xl font-bold uppercase tracking-wide border-b-2 border-(--color-text) pb-2 mb-4">
            {t('profile.personalInfo')}
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1">
                <p className={`${labelStyle}`}>
                  {t('profile.firstName')}
                </p>
                <p className={`${inputStyle}`} title={fullUser.first_name || ''}>
                  {isMdOrLarger
                    ? fullUser.first_name || '-'
                    : truncateName(fullUser.first_name)
                  }
                </p>
              </div>
              <div className="flex-1">
                <p className={`${labelStyle}`}>
                  {t('profile.lastName')}
                </p>
                <p className={`${inputStyle}`} title={fullUser.last_name || ''}>
                  {isMdOrLarger
                    ? fullUser.last_name || '-'
                    : truncateName(fullUser.last_name)
                  }
                </p>
              </div>
            </div>
            <div className='flex flex-wrap gap-4'>
              <div className="flex-1">
                <p className={`${labelStyle}`}>
                  {t('profile.email')}
                </p>
                <p className={`${inputStyle}`} title={fullUser.email}>
                  {isMdOrLarger
                    ? truncateName(fullUser.email, 40)
                    : truncateName(fullUser.email)
                  }
                </p>
              </div>
              <div className="flex-1">
                <p className={`${labelStyle}`}>{t('profile.yearOfBirth')}</p>
                <p className={`${inputStyle}`}>{fullUser.year_of_birth || '-'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Academic Information ───────────────────────────── */}
        <section className={`${sharedStyles}`}>
          <h2 className="text-xl font-bold uppercase tracking-wide border-b-2 border-(--color-text) pb-2 mb-4">
            {t('profile.academicInfo')}
          </h2>
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className={`${labelStyle}`}>{t('profile.dropout')}</p>
              <p className={`${inputStyle}`}>{fullUser.is_dropout ? t('profile.yes') : t('profile.no')}</p>
            </div>
          </div> */}

          {fullUser.diploma && (
            <div className="border-(--color-text) pt-2 flex gap-3 flex-wrap w-full">
              {/* First div */}
              <div className="border-2 px-5 py-4 flex flex-col gap-5 flex-1 bg-(--color-light) justify-between">
                <div>
                  <p className={`${labelStyle} text-(--color-muted)`}>{t('profile.diplomaName')}</p>
                  <p className="text-md sm:text-2xl font-semibold px-3 py-2 border-3 uppercase bg-(--color-highlight) w-fit">
                    {fullUser.diploma.diploma_name || '-'}
                  </p>
                </div>
                <div className="flex justify-between gap-2 flex-wrap">
                  <div>
                    <p className={`${labelStyle} text-(--color-muted)`}>{t('profile.diplomaNote')}</p>
                    <p className="text-2xl font-semibold text-(--color-accent) truncate">
                      {fullUser.diploma.general_grade !== null ? fullUser.diploma.general_grade : '-'}
                    </p>
                  </div>
                  <div>
                    <p className={`${labelStyle} text-(--color-muted)`}>{t('profile.classOf')}</p>
                    <p className="text-2xl font-semibold truncate">{fullUser.diploma.obtained_year || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Second div (fields) */}
              {fullUser.diploma.fields && fullUser.diploma.fields.length > 0 && (
                <div className="border-2 px-5 py-4 flex flex-col gap-5 flex-1 bg-(--color-light)">
                  <p className="text-xs uppercase font-bold text-(--color-muted) mb-2 whitespace-nowrap">
                    {t('profile.diplomaFields')}
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    {fullUser.diploma.fields.map((field: any) => (
                      <div key={field.field_id} className="flex-1">
                        <p className={`${labelStyle}`} title={field.field_name}>
                          {isMdOrLarger
                            ? truncateName(field.field_name, 40)
                            : truncateName(field.field_name, 25)
                          }
                          </p>
                        <p className={`${inputStyle} w-full truncate`}>{field.value !== null ? field.value : '-'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <div className='flex gap-8 flex-wrap'>
          {/* ─── Interests ───────────────────────────────────────── */}
          <section className={`${sharedStyles} flex-1 m-0!`}>
            <h2 className="text-xl font-bold uppercase tracking-wide border-b-2 border-(--color-text) pb-2 mb-4">
              {t('profile.interests')}
            </h2>
            
            {fullUser.interested_categories && fullUser.interested_categories.length > 0 ? (
              <div className="flex gap-3 flex-wrap flex-col sm:flex-row">
                {fullUser.interested_categories.map((category: any) => {
                  const IconComponent = categoryIconMap[category.category_slug];
                  return (
                    <div
                      key={category.category_id}
                      className="border-2 border-(--color-text) bg-(--color-surface) p-3 flex flex-col items-center justify-center gap-2 hover:bg-(--color-highlight) transition-colors flex-1"
                    >
                      {IconComponent && (
                        <IconComponent className="w-8 h-8 text-(--color-text)" />
                      )}
                      <p className="text-xs font-bold uppercase text-center leading-tight wrap-break-word" title={category.category_name}>
                        {isMdOrLarger
                          ? truncateName(category.category_name, 30)
                          : truncateName(category.category_name, 25)
                        }
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-lg font-semibold">-</p>
            )}
          </section>

          {/* ─── Security Settings (2FA) ─────────────────────────────── */}
          {!isGoogleUser && (
            <section className={`${sharedStyles} flex-1 m-0!`}>
              <h2 className="text-xl font-bold uppercase tracking-wide border-b-2 border-(--color-text) pb-2 mb-4">
                {t('profile.securitySettings')}
              </h2>

              <div className={`flex flex-col gap-4 ${inputStyle} `}>
                <ToggleSwitch
                  label={
                    isMdOrLarger
                      ? truncateName(t('profile.2fa.title'), 30)
                      : truncateName(t('profile.2fa.title'))
                    
                  }
                  checked={is2FAEnabled}
                  onChange={() => {
                    if (isLocked || isAdmin) return;
                    setShowPasswordConfirm(true);
                  }}
                  disabled={toggling2FA || isLocked || isAdmin}
                  statusLabel={t('profile.2fa.status')}
                  statusEnabled={t('profile.2fa.enabledStatus')}
                  statusDisabled={t('profile.2fa.disabledStatus')}
                  title={t('profile.2fa.title')}
                />

                {/* Success / error messages and password modal */}
                {successMessage && (
                  <div className="border-2 border-green-600 bg-green-50 p-2 text-sm font-semibold text-green-700 shadow-[2px_2px_0_0_green]">
                    {successMessage}
                  </div>
                )}

              </div>
              {showPasswordConfirm && (
                <div className={`${inputStyle} border-t-0`}>
                  <p className="text-sm font-bold uppercase tracking-wide mb-2">
                    {t('profile.2fa.confirmPassword')}
                  </p>

                  <Input
                    type="password"
                    placeholder={t('profile.2fa.passwordPlaceholder')}
                    value={password}
                    dir="ltr"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setToggleError(null);
                    }}
                    error={toggleError}
                    disabled={isLocked || toggling2FA}
                    className="w-full"
                    containerClassName="w-full"
                  />

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        if (password && !isLocked) {
                          handleToggle2FA(!is2FAEnabled);
                        }
                      }}
                      disabled={!password || toggling2FA || isLocked}
                      className="cursor-pointer border-2 border-(--color-text) px-4 py-1 font-bold hover:bg-(--color-accent-soft) disabled:opacity-50 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                    >
                      {t('profile.2fa.confirm')}
                    </button>
                    <button
                      onClick={closePasswordModal}
                      className="cursor-pointer border-2 border-(--color-text) px-4 py-1 font-bold hover:bg-(--color-grey)"
                    >
                      {t('profile.2fa.cancel')}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}