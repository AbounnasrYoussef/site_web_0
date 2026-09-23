'use client';

import { useState } from 'react';
import ToggleSwitch from '@/components/toggle-switch';
import Input from '@/components/input';
import FullButton from '@/components/full-button';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export default function SecuritySettingsSection({
  fullUser,
  is2FAEnabled,
  isAdmin,
  isGoogleUser,
  isLocked,
  toggling2FA,
  showPasswordConfirm,
  password,
  setPassword,
  toggleError,
  successMessage,
  lockRemainingSeconds,
  onToggle2FA,
  onClosePasswordModal,
  isMdOrLarger,
  truncateName,
  labelStyle,
  inputStyle,
  sharedStyles,
  t,
  onShowPasswordConfirm,
  onClearToggleError,
  onChangePassword,
}: any) {
  if (isGoogleUser) return null;

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const resetChangePasswordForm = () => {
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setChangePasswordError(null);
  };

  const submitChangePassword = async () => {
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmNewPassword.trim();

    if (!currentPassword) {
      setChangePasswordError(t('profile.changePassword.currentRequired'));
      return;
    }
    if (!PASSWORD_REGEX.test(trimmedNew)) {
      setChangePasswordError(t('validation.passwordInvalid'));
      return;
    }
    if (trimmedNew !== trimmedConfirm) {
      setChangePasswordError(t('validation.passwordsDoNotMatch'));
      return;
    }

    setChangingPassword(true);
    try {
      const result = await onChangePassword(currentPassword, trimmedNew);

      setChangePasswordSuccess(result?.message);
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      // Auto-hide the success message after 5 seconds
      setTimeout(() => setChangePasswordSuccess(null), 5000);
    } catch (err: any) {
      setChangePasswordError(err.message || t('profile.changePassword.error'));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <section className={`${sharedStyles} flex-1 m-0!`}>
      <h2 className="text-xl font-bold uppercase tracking-wide border-b-2 border-(--color-text) pb-2 mb-4">
        {t('profile.securitySettings')}
      </h2>

      <div className="flex flex-col">
        <div className={`flex flex-col ${inputStyle}`}>
          <ToggleSwitch
            label={isMdOrLarger ? truncateName(t('profile.2fa.title'), 30) : truncateName(t('profile.2fa.title'))}
            checked={is2FAEnabled}
            onChange={() => {
              if (isLocked || isAdmin) return;
              onShowPasswordConfirm();
            }}
            disabled={toggling2FA || isLocked || isAdmin}
            statusLabel={t('profile.2fa.status')}
            statusEnabled={t('profile.2fa.enabledStatus')}
            statusDisabled={t('profile.2fa.disabledStatus')}
            title={t('profile.2fa.title')}
          />

          {isAdmin && (
            <p className="text-xs text-amber-600 font-semibold mt-1 whitespace-break-spaces">
              {t('profile.2fa.adminRequired')}
            </p>
          )}

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
              onChange={(e) => {
                setPassword(e.target.value);
                onClearToggleError();
              }}
              error={toggleError}
              disabled={isLocked || toggling2FA}
              className="w-full"
              containerClassName="w-full"
            />
            <div className="flex gap-2 mt-3">
              <FullButton
                onClick={() => {
                  if (password && !isLocked) {
                    onToggle2FA(!is2FAEnabled);
                  }
                }}
                className="uppercase flex-1 text-center justify-center"
                backgroundColor="var(--color-accent-soft)"
                disabled={!password || toggling2FA || isLocked}
              >
                {t('profile.2fa.confirm')}
              </FullButton>
              <FullButton
                onClick={onClosePasswordModal}
                className="uppercase"
                backgroundColor="var(--color-grey)"
              >
                {t('profile.2fa.cancel')}
              </FullButton>
            </div>
          </div>
        )}

        {/* ── Change Password ── */}
        <div className={`${inputStyle} mt-2`}>
          {!showChangePassword ? (
            <div className="flex justify-between items-center gap-2">
              <span>{t('profile.changePassword.title')}</span>
              <FullButton
                onClick={() => {
                  setShowChangePassword(true);
                  setChangePasswordSuccess(null);
                }}
                className="uppercase hover:bg-[var(--color-accent-soft)]"
              >
                {t('profile.updatePassword')}
              </FullButton>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitChangePassword();
              }}
              className="flex flex-col gap-4 pt-2"
            >
              <p className="text-sm font-bold uppercase tracking-wide">
                {t('profile.changePassword.title')}
              </p>

              <Input
                label={t('profile.changePassword.currentPlaceholder')}
                type="password"
                dir="ltr"
                placeholder={t('profile.changePassword.passwordPlaceholder')}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setChangePasswordError(null);
                }}
                disabled={changingPassword}
                className="w-full"
                containerClassName="w-full"
                autoComplete="current-password"
              />

              <Input
                label={t('profile.changePassword.newPlaceholder')}
                type="password"
                dir="ltr"
                placeholder={t('profile.changePassword.passwordPlaceholder')}
                helper={t('profile.changePassword.newHelper')}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setChangePasswordError(null);
                }}
                disabled={changingPassword}
                className="w-full"
                containerClassName="w-full"
                autoComplete="new-password"
              />

              <Input
                label={t('profile.changePassword.confirmPlaceholder')}
                type="password"
                dir="ltr"
                placeholder={t('profile.changePassword.passwordPlaceholder')}
                value={confirmNewPassword}
                onChange={(e) => {
                  setConfirmNewPassword(e.target.value);
                  setChangePasswordError(null);
                }}
                disabled={changingPassword}
                className="w-full"
                containerClassName="w-full"
                autoComplete="new-password"
              />

              {changePasswordError && (
                <div className="border-2 border-red-600 bg-red-50 p-3 text-sm font-semibold text-red-700 shadow-[2px_2px_0_0_red] whitespace-break-spaces">
                  {changePasswordError}
                </div>
              )}

              <div className="flex gap-2 mt-1">
                <FullButton
                  type="submit"
                  backgroundColor="var(--color-accent-soft)"
                  disabled={
                    changingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmNewPassword
                  }
                  className="uppercase flex-1 justify-center"
                >
                  {changingPassword
                    ? t('profile.changePassword.saving')
                    : t('profile.changePassword.confirm')}
                </FullButton>
                <FullButton
                  type="button"
                  onClick={resetChangePasswordForm}
                  disabled={changingPassword}
                  className="uppercase"
                  backgroundColor="var(--color-grey)"
                >
                  {t('profile.2fa.cancel')}
                </FullButton>
              </div>
            </form>
          )}

          {changePasswordSuccess && (
            <div className="border-2 border-green-600 bg-green-50 p-3 text-sm font-semibold text-green-700 shadow-[2px_2px_0_0_green] mt-2">
              {changePasswordSuccess}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}