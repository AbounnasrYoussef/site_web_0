'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/(zguellou)/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import { useAuthFetch } from '@/app/(zguellou)/hooks/useAuthFetch';
import { useMediaQuery } from '@/app/(zguellou)/hooks/useMediaQuery';

import ProfileHeader from './ProfileHeader';
import PersonalInfoSection from './PersonalInfoSection';
import AcademicInfoSection from './AcademicInfoSection';
import InterestsSection from './InterestsSection';
import SecuritySettingsSection from './SecuritySettingsSection';
import { isValidImage } from '@/utils/validateImage';
import ProfileSkeleton from './ProfileSkeleton';

type Diploma = { id: string; rank: number; name: string };
type Field = { id: string; name: string };

export default function ProfilePage() {
  const { user, accessToken, isInitialized, refreshToken, clearAuth } = useAuth();
  const authFetch = useAuthFetch();
  const router = useRouter();
  const t = useTranslations();
  const isMdOrLarger = useMediaQuery('768px');

  const [fullUser, setFullUser] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Personal draft
  const [draft, setDraft] = useState({ first_name: '', last_name: '', year_of_birth: '' });

  // Academic draft
  const [draftIsDropout, setDraftIsDropout] = useState(false);
  const [draftDiplomaLevel, setDraftDiplomaLevel] = useState('');
  const [draftDiplomaId, setDraftDiplomaId] = useState('');
  const [draftDiplomaYear, setDraftDiplomaYear] = useState('');
  const [draftDiplomaNote, setDraftDiplomaNote] = useState('');
  const [draftDiplomaFields, setDraftDiplomaFields] = useState<Record<string, string>>({});

  // Interests draft
  const [draftCategories, setDraftCategories] = useState<string[]>([]);

  // Profile picture draft
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  // Data fetching (categories, diplomas, fields)
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [diplomaFieldsList, setDiplomaFieldsList] = useState<Field[]>([]);

  // 2FA state
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

  // Auth & profile fetch
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
    if (!isInitialized)
      return;
    if (!user) {
      setLoadingProfile(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await authFetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/profile`, {
          method: 'GET',
        });
        if (res.status === 403)
          throw new Error('Forbidden');

        if (!res.ok)
          throw new Error('Failed to fetch profile');
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

  // Fetch categories & diplomas
  useEffect(() => {
    if (!isInitialized || !user) return;
    const fetchCategories = async () => {
      try {
        const res = await authFetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/categories`);
        const data = await res.json();
        setAllCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, [authFetch]);

  useEffect(() => {
    if (!isInitialized || !user) return;
    const fetchDiplomas = async () => {
      try {
        const res = await authFetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/diplomas`);
        const data = await res.json();
        setDiplomas(data.diplomas || []);

      } catch (err) {
        console.error('Failed to fetch diplomas', err);
      }
    };
    fetchDiplomas();
  }, [authFetch]);

  // Fetch fields when diploma changes in edit mode
  useEffect(() => {
    if (!draftDiplomaId) {
      setDiplomaFieldsList([]);
      return;
    }
    const fetchFields = async () => {
      try {
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/diplomas/${draftDiplomaId}/fields`
        );
        const data = await res.json();
        setDiplomaFieldsList(data.fields || []);
      } catch (err) {
        console.error('Failed to fetch diploma fields', err);
        setDiplomaFieldsList([]);
      }
    };
    fetchFields();
  }, [draftDiplomaId, authFetch]);

  // Edit handlers
  const startEditing = () => {
    // Personal
    setDraft({
      first_name: fullUser.first_name || '',
      last_name: fullUser.last_name || '',
      year_of_birth: fullUser.year_of_birth ? String(fullUser.year_of_birth) : '',
    });
    // Categories
    setDraftCategories(
      fullUser.interested_categories?.map((c: any) => c.category_id) || []
    );
    // Academic
    const diploma = fullUser.diploma;
    setDraftIsDropout(fullUser.is_dropout || false);
    if (diploma) {
      const foundDiploma = diplomas.find((d) => d.id === diploma.diploma_id);
      const rank = foundDiploma ? String(foundDiploma.rank) : '';

      setDraftDiplomaLevel(rank);
      setDraftDiplomaId(diploma.diploma_id || '');
      setDraftDiplomaYear(diploma.obtained_year ? String(diploma.obtained_year) : '');
      setDraftDiplomaNote(
        diploma.general_grade !== null && diploma.general_grade !== undefined
          ? String(diploma.general_grade)
          : ''
      );

      const fields: Record<string, string> = {};
      (diploma.fields || []).forEach((f: any) => {
        fields[f.field_id] = f.value !== null && f.value !== undefined ? String(f.value) : '';
      });
      setDraftDiplomaFields(fields);
    } else {
      setDraftDiplomaLevel('');
      setDraftDiplomaId('');
      setDraftDiplomaYear('');
      setDraftDiplomaNote('');
      setDraftDiplomaFields({});
    }
    setSaveError(null);
    setProfilePicFile(null);
    setProfilePicPreview(fullUser.profile_pic || null);
    setFieldErrors({});
    setSaveError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setFieldErrors({});
    setSaveError(null);
    setIsEditing(false);
    setSaveError(null);
    setProfilePicFile(null);
    setProfilePicPreview(fullUser.profile_pic || null);
    // Reset categories
    setDraftCategories(
      fullUser.interested_categories?.map((c: any) => c.category_id) || []
    );
    // Reset academic
    const diploma = fullUser.diploma;
    setDraftIsDropout(fullUser.is_dropout || false);
    if (diploma) {
      setDraftDiplomaLevel(diploma.diploma_rank ? String(diploma.diploma_rank) : '');
      setDraftDiplomaId(diploma.diploma_id || '');
      setDraftDiplomaYear(diploma.obtained_year ? String(diploma.obtained_year) : '');
      setDraftDiplomaNote(
        diploma.general_grade !== null && diploma.general_grade !== undefined
          ? String(diploma.general_grade)
          : ''
      );
      const fields: Record<string, string> = {};
      (diploma.fields || []).forEach((f: any) => {
        fields[f.field_id] = f.value !== null && f.value !== undefined ? String(f.value) : '';
      });
      setDraftDiplomaFields(fields);
    } else {
      setDraftDiplomaLevel('');
      setDraftDiplomaId('');
      setDraftDiplomaYear('');
      setDraftDiplomaNote('');
      setDraftDiplomaFields({});
    }
  };

  // UPLOADE IMAGE SECTION
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = await isValidImage(t, file);
    if (error) {
      setFieldErrors((prev) => ({ ...prev, profile_pic: error }));
      e.target.value = '';
      return;
    }

    setFieldErrors((prev) => {
      const { profile_pic, ...rest } = prev;
      return rest;
    });

    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    setSaving(true);
    setSaveError(null);
    let orderedDiplomaFieldIds: string[] = [];
    try {
      const formData = new FormData();

      // Append file (if changed)
      if (profilePicFile) {
        formData.append('profile_pic', profilePicFile);
      }

      // Personal info
      if (draft.first_name.trim()) formData.append('first_name', draft.first_name.trim());
      if (draft.last_name.trim()) formData.append('last_name', draft.last_name.trim());
      if (draft.year_of_birth) formData.append('year_of_birth', draft.year_of_birth);

      // Categories
      const currentCategoryIds = fullUser.interested_categories?.map((c: any) => c.category_id) || [];
      const hasCategoryChanges =
        draftCategories.length !== currentCategoryIds.length ||
        draftCategories.some((id) => !currentCategoryIds.includes(id));
      if (hasCategoryChanges) {
        formData.append('interested_category_ids', JSON.stringify(draftCategories));
      }

      // Academic info
      if (draftIsDropout !== fullUser.is_dropout) {
        formData.append('is_dropout', String(draftIsDropout));
      }
      if (!draftIsDropout) {
        if (draftDiplomaId) formData.append('diploma_id', draftDiplomaId);
        if (draftDiplomaNote) formData.append('diploma_note', draftDiplomaNote);
        if (draftDiplomaYear) formData.append('diploma_year', draftDiplomaYear);

        // Build diploma_fields in the SAME ORDER as diplomaFieldsList
        const fieldObjects: { field_id: string; value: number }[] = [];
        const fieldIds: string[] = [];
        for (const field of diplomaFieldsList) {
          const val = draftDiplomaFields[field.id];
          if (val !== undefined && val !== null && val !== '') {
            fieldObjects.push({ field_id: field.id, value: Number(val) });
            fieldIds.push(field.id);
          }
        }
        if (fieldObjects.length > 0) {
          formData.append('diploma_fields', JSON.stringify(fieldObjects));
          orderedDiplomaFieldIds = fieldIds; // store for error mapping
        }
      }

      // Send request ──────────────────────────────
      const res = await authFetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/profile`, {
        method: 'PATCH',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw data; // throws the error object with `errors` array
      }

      const data = await res.json();
      setFullUser(data.user);
      setIsEditing(false);
      setFieldErrors({});

    } catch (err: any) {
      if (err?.errors?.length) {
        const fieldErrorsMap: Record<string, string> = {};
        err.errors.forEach((error: { field: string; message: string }) => {
          // Map errors
          fieldErrorsMap[error.field] = error.message;
        });
        setFieldErrors(fieldErrorsMap);
      } else {
        setSaveError(err?.message ?? t('profile.editError'));
      }
    } finally {
      setSaving(false);
    }
  };

  // 2FA handlers
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
          }, seconds * 1000 + 1000);

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
    if (lockIntervalRef.current) {
      clearInterval(lockIntervalRef.current);
      lockIntervalRef.current = null;
    }
    setIsLocked(false);
    setLockRemainingSeconds(null);
    setShowPasswordConfirm(false);
    setPassword('');
    setToggleError(null);
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    const res = await authFetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/change-own-password`, {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || t('profile.changePassword.error'));
    }

    return data;
  };

  // Guards ──────────────────────────────────────────────────
  if (!isInitialized || loadingProfile || !user) return (
    <ProfileSkeleton />
  );
  if (!fullUser) return null;

  // Helpers ──────────────────────────────────────────────────
  const truncateName = (str: string | null | undefined, maxLength: number = 20): string => {
    if (!str) return '-';
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - 3) + '...';
  };

  const sharedStyles = 'bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)] p-4 sm:p-8 mb-8';
  const labelStyle = 'text-xs uppercase font-bold text-(--color-text) mb-1 whitespace-nowrap';
  const inputStyle = 'bg-(--color-surface) text-lg font-semibold border-2 px-3 py-2 whitespace-nowrap';

  // Render ──────────────────────────────────────────────────
  return (
    <main className="min-h-screen p-6 dotted-bg">
      <div className="max-w-7xl mx-auto">
        <ProfileHeader
          fullUser={fullUser}
          isEditing={isEditing}
          saving={saving}
          profilePicPreview={profilePicPreview}
          profilePicFile={profilePicFile}
          fieldErrors={fieldErrors}
          isMdOrLarger={isMdOrLarger}
          truncateName={truncateName}
          onEdit={startEditing}
          onSave={saveProfile}
          onCancel={cancelEditing}
          onClearAuth={clearAuth}
          onFileChange={handleFileChange}
          fileInputRef={fileInputRef}
          sharedStyles={sharedStyles}
          t={t}
        />

        <PersonalInfoSection
          fullUser={fullUser}
          isEditing={isEditing}
          draft={draft}
          setDraft={setDraft}
          fieldErrors={fieldErrors}
          saveError={saveError}
          isMdOrLarger={isMdOrLarger}
          truncateName={truncateName}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
          sharedStyles={sharedStyles}
          t={t}
        />

        <AcademicInfoSection
          fullUser={fullUser}
          isEditing={isEditing}
          draftIsDropout={draftIsDropout}
          setDraftIsDropout={setDraftIsDropout}
          draftDiplomaLevel={draftDiplomaLevel}
          setDraftDiplomaLevel={setDraftDiplomaLevel}
          draftDiplomaId={draftDiplomaId}
          setDraftDiplomaId={setDraftDiplomaId}
          draftDiplomaYear={draftDiplomaYear}
          setDraftDiplomaYear={setDraftDiplomaYear}
          draftDiplomaNote={draftDiplomaNote}
          setDraftDiplomaNote={setDraftDiplomaNote}
          draftDiplomaFields={draftDiplomaFields}
          setDraftDiplomaFields={setDraftDiplomaFields}
          diplomas={diplomas}
          diplomaFieldsList={diplomaFieldsList}
          fieldErrors={fieldErrors}
          isMdOrLarger={isMdOrLarger}
          truncateName={truncateName}
          labelStyle={labelStyle}
          inputStyle={inputStyle}
          sharedStyles={sharedStyles}
          t={t}
        />

        <div className="flex gap-8 flex-wrap">
          <InterestsSection
            fullUser={fullUser}
            isEditing={isEditing}
            allCategories={allCategories}
            draftCategories={draftCategories}
            setDraftCategories={setDraftCategories}
            isMdOrLarger={isMdOrLarger}
            truncateName={truncateName}
            labelStyle={labelStyle}
            inputStyle={inputStyle}
            sharedStyles={sharedStyles}
            t={t}
          />

          <SecuritySettingsSection
            fullUser={fullUser}
            is2FAEnabled={is2FAEnabled}
            isAdmin={user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'}
            isGoogleUser={fullUser?.auth_provider === 'GOOGLE'}
            isLocked={isLocked}
            toggling2FA={toggling2FA}
            showPasswordConfirm={showPasswordConfirm}
            password={password}
            setPassword={setPassword}
            toggleError={toggleError}
            successMessage={successMessage}
            lockRemainingSeconds={lockRemainingSeconds}
            onToggle2FA={handleToggle2FA}
            onClosePasswordModal={closePasswordModal}
            isMdOrLarger={isMdOrLarger}
            truncateName={truncateName}
            labelStyle={labelStyle}
            inputStyle={inputStyle}
            sharedStyles={sharedStyles}
            t={t}
            onShowPasswordConfirm={() => setShowPasswordConfirm(true)}
            onClearToggleError={() => setToggleError(null)}
            onChangePassword={handleChangePassword}
          />
        </div>
      </div>
    </main>
  );
}