'use client';

import Input from '@/components/input';
import Dropdown from '@/components/dropdown';
import { BIRTH_YEARS } from '@/app/(zguellou)/constants';

type Draft = { first_name: string; last_name: string; year_of_birth: string };

interface PersonalInfoSectionProps {
  fullUser: any;
  isEditing: boolean;
  draft: Draft;
  setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  fieldErrors: Record<string, string>;
  saveError: string | null;
  isMdOrLarger: boolean;
  truncateName: (str: string | null | undefined, maxLength?: number) => string;
  labelStyle: string;
  inputStyle: string;
  sharedStyles: string;
  t: (key: string) => string;
}

export default function PersonalInfoSection({
  fullUser, isEditing, draft, setDraft, fieldErrors, saveError,
  isMdOrLarger, truncateName, labelStyle, inputStyle, sharedStyles, t,
}: PersonalInfoSectionProps) {
    return (
        <section className={sharedStyles}>
            <h2 className="text-xl font-bold uppercase tracking-wide border-b-2 border-(--color-text) pb-2 mb-4">
                {t('profile.personalInfo')}
            </h2>
            <div className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1">
                        <p className={labelStyle}>{t('profile.firstName')}</p>
                        {isEditing ? (
                            <Input
                                value={draft.first_name}
                                error={fieldErrors.first_name}
                                onChange={(e) => setDraft((d) => ({ ...d, first_name: e.target.value }))}
                                className="w-full bg-(--color-light)! text-lg! font-semibold! border-2! px-3! py-2! whitespace-nowrap!"
                                containerClassName="gap-0!"
                            />
                        ) : (
                            <p className={inputStyle} title={fullUser.first_name || ''}>
                                {isMdOrLarger ? fullUser.first_name || '-' : truncateName(fullUser.first_name)}
                            </p>
                        )}
                    </div>
                    <div className="flex-1">
                        <p className={labelStyle}>{t('profile.lastName')}</p>
                        {isEditing ? (
                            <Input
                                value={draft.last_name}
                                error={fieldErrors.last_name}
                                onChange={(e) => setDraft((d) => ({ ...d, last_name: e.target.value }))}
                                className="w-full bg-(--color-light)! text-lg! font-semibold! border-2! px-3! py-2! whitespace-nowrap!"
                                containerClassName="gap-0!"
                            />
                        ) : (
                            <p className={inputStyle} title={fullUser.last_name || ''}>
                                {isMdOrLarger ? fullUser.last_name || '-' : truncateName(fullUser.last_name)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="flex-1">
                        <p className={labelStyle}>{t('profile.email')}</p>
                        <p className={inputStyle} title={fullUser.email}>
                            {isMdOrLarger ? truncateName(fullUser.email, 40) : truncateName(fullUser.email)}
                        </p>
                    </div>
                    <div className="flex-1">
                        <p className={labelStyle}>{t('profile.yearOfBirth')}</p>
                        {isEditing ? (
                            <Dropdown
                                label=""
                                placeholder={t('onboarding.step2.yearOfBirthPlaceholder')}
                                value={draft.year_of_birth}
                                onChange={(val) => setDraft((d) => ({ ...d, year_of_birth: val }))}
                                options={BIRTH_YEARS}
                                containerClassName="gap-0!"
                                triggerClassName="bg-(--color-light)! py-2!"
                                spanClassName="text-lg!"
                            />
                        ) : (
                            <p className={inputStyle}>{fullUser.year_of_birth || '-'}</p>
                        )}
                    </div>
                </div>

                {saveError && <div className="text-xs text-red-700 font-semibold wrap-break-word">{saveError}</div>}
            </div>
        </section>
    );
}