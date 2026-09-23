'use client';

import FullButton from '@/components/full-button';
import EditIcon from '@/public/icons/auth/EditIcon';
import LogoutIcon from '@/public/icons/auth/LogoutIcon';

export default function ProfileHeader({
  fullUser,
  isEditing,
  saving,
  profilePicPreview,
  fieldErrors,
  isMdOrLarger,
  truncateName,
  onEdit,
  onSave,
  onCancel,
  onClearAuth,
  onFileChange,
  fileInputRef,
  sharedStyles,
  t,
}: any) {
  return (
    <div className={`${sharedStyles} flex flex-wrap items-center justify-between gap-4`}>
      {/* Profile picture */}
      <div className="flex flex-wrap justify-center items-center gap-4">
        <div className="relative w-30 h-30">
            <div className={`w-full h-full border-2 box-border overflow-hidden ${fieldErrors.profile_pic ? 'border-red-600' : 'border-(--color-text)'}`}>
            {fullUser.profile_pic || profilePicPreview ? (
                <img src={profilePicPreview || fullUser.profile_pic} alt={t('profile.profilePicture')} className="w-full h-full object-cover bg-(--color-grey)" />
            ) : (
                <div className="w-full h-full bg-(--color-grey) flex items-center justify-center text-3xl font-bold text-(--color-muted)">
                {fullUser.first_name?.[0] || '?'}
                </div>
            )}
            </div>

            {isEditing && (
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-(--color-highlight)/50 transition-all duration-200 cursor-pointer group"
            >
                <LogoutIcon className="w-8 h-8 rotate-270 text-white group-hover:text-(--color-text) transition-colors" />
            </button>
            )}

            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg" capture="user" className="hidden" onChange={onFileChange} />
            {fieldErrors.profile_pic && <span className="text-xs whitespace-normal block text-red-700 font-semibold mt-1">{fieldErrors.profile_pic}</span>}
        </div>
        {/* Name & role */}
        <div>
            <h1 className="text-3xl text-center font-black uppercase">
            <span title={fullUser.first_name || ''}>
                {isMdOrLarger ? truncateName(fullUser.first_name) : truncateName(fullUser.first_name, 10)}
            </span>
            {' '}
            <span title={fullUser.last_name || ''}>
                {isMdOrLarger ? truncateName(fullUser.last_name) : truncateName(fullUser.last_name, 10)}
            </span>
            </h1>
            <div className="flex justify-center sm:justify-start items-center gap-3 mt-1">
            <span className="border-2 border-(--color-text) bg-(--color-accent-soft) px-3 py-0.5 text-xs font-bold uppercase">
                {t('profile.role')}: {fullUser.role}
            </span>
            </div>
        </div>
      </div>


      {/* Actions */}
      <div className="w-full md:w-auto flex flex-row flex-wrap md:flex-col gap-2">
        {isEditing ? (
          <>
            <FullButton text={saving ? t('profile.saving') : t('profile.save')} onClick={onSave} disabled={saving} className="flex-1 justify-center uppercase" backgroundColor="var(--color-highlight)" />
            <FullButton text={t('profile.cancel')} onClick={onCancel} disabled={saving} className="flex-1 justify-center uppercase" backgroundColor="var(--color-grey)" />
          </>
        ) : (
          <>
            <FullButton text={t('profile.edit')} onClick={onEdit} className="flex-1 justify-center whitespace-nowrap" backgroundColor="var(--color-highlight)">
              <EditIcon className="w-5 h-5 text-(--color-text)" />
            </FullButton>
            <FullButton onClick={onClearAuth} text={t('profile.logout')} className="uppercase flex-1 justify-center whitespace-nowrap" backgroundColor="var(--color-error)">
              <LogoutIcon className="w-5 h-5 text-(--color-text)" />
            </FullButton>
          </>
        )}
      </div>
    </div>
  );
}