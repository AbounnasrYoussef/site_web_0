'use client';

import Input from '@/components/input';
import Dropdown from '@/components/dropdown';
import ToggleSwitch from '@/components/toggle-switch';
import { DIPLOMA_LEVELS, CURRENT_YEAR } from '@/app/(zguellou)/constants';

export default function AcademicInfoSection({
    fullUser,
    isEditing,
    draftIsDropout,
    setDraftIsDropout,
    draftDiplomaLevel,
    setDraftDiplomaLevel,
    draftDiplomaId,
    setDraftDiplomaId,
    draftDiplomaYear,
    setDraftDiplomaYear,
    draftDiplomaNote,
    setDraftDiplomaNote,
    draftDiplomaFields,
    setDraftDiplomaFields,
    diplomas,
    diplomaFieldsList,
    fieldErrors,
    isMdOrLarger,
    truncateName,
    labelStyle,
    inputStyle,
    sharedStyles,
    t,
}: any) {
    const handleLevelChange = (level: string) => {
        setDraftDiplomaLevel(level);
        setDraftDiplomaId('');
        setDraftDiplomaNote('');
        setDraftDiplomaFields({});
    };
    const handleDiplomaChange = (id: string) => {
        setDraftDiplomaId(id);
        setDraftDiplomaNote('');
        setDraftDiplomaFields({});
    };
    const updateDiplomaFieldValue = (fieldId: string, value: string) => {
        setDraftDiplomaFields((prev) => ({ ...prev, [fieldId]: value }));
    };

    const diplomasAtLevel = diplomas.filter((d: any) => d.rank === Number(draftDiplomaLevel));

    return (
        <section className={sharedStyles}>
            <h2 className="text-xl font-bold uppercase tracking-wide border-b-2 border-(--color-text) pb-2 mb-4">
                {t('profile.academicInfo')}
            </h2>

            {isEditing ? (
                <div className="flex flex-col">
                    <div className="p-4 border-2 border-(--color-text) bg-(--color-light)">
                        <ToggleSwitch
                            id="is_dropout_edit"
                            label={t('onboarding.step3.dropoutLabel')}
                            checked={draftIsDropout}
                            onChange={(e) => setDraftIsDropout(e.target.checked)}
                        />
                    </div>

                    {!draftIsDropout && (
                        <div className="p-4 border-2 border-t-0 border-(--color-text) space-y-4 bg-(--color-light)">
                            <Dropdown
                                label={t('onboarding.step3.diplomaLevel')}
                                placeholder={t('onboarding.step3.diplomaLevelPlaceholder')}
                                value={draftDiplomaLevel}
                                onChange={handleLevelChange}
                                options={DIPLOMA_LEVELS.map((l) => ({
                                    label: t(`onboarding.step3.levels.${l.labelKey}`),
                                    value: l.value,
                                }))}
                                containerClassName="gap-0"
                                triggerClassName="bg-(--color-surface) text-lg font-semibold"
                            />

                            {draftDiplomaLevel && (
                                <Dropdown
                                    label={t('onboarding.step3.diploma')}
                                    placeholder={t('onboarding.step3.diplomaPlaceholder')}
                                    value={draftDiplomaId}
                                    onChange={handleDiplomaChange}
                                    options={diplomasAtLevel.map((d: any) => ({ label: d.name, value: d.id }))}
                                    containerClassName="gap-0"
                                    triggerClassName="bg-(--color-surface) text-lg font-semibold"
                                />
                            )}

                            {draftDiplomaId && (
                                <>
                                    <Dropdown
                                        label={t('onboarding.step3.diplomaYear')}
                                        placeholder={t('onboarding.step3.diplomaYearPlaceholder')}
                                        value={draftDiplomaYear}
                                        onChange={(val) => setDraftDiplomaYear(val)}
                                        options={Array.from({ length: CURRENT_YEAR - 2000 + 1 }, (_, i) => String(CURRENT_YEAR - i))}
                                        containerClassName="gap-0"
                                        triggerClassName="bg-(--color-surface) text-lg font-semibold"
                                    />

                                    <Input
                                        label={t('onboarding.step3.diplomaNote')}
                                        type="text"
                                        placeholder="10.00"
                                        dir="ltr"
                                        value={draftDiplomaNote}
                                        error={fieldErrors.diploma_note}
                                        onChange={(e) => setDraftDiplomaNote(e.target.value)}
                                        className="w-full bg-(--color-surface) text-lg font-semibold border-2 px-3 py-2"
                                        containerClassName="gap-0"
                                    />

                                    {diplomaFieldsList.map((field: any) => (
                                        <div key={field.id}>
                                            <Input
                                                label={field.name}
                                                type="text"
                                                dir="ltr"
                                                value={draftDiplomaFields[field.id] ?? ''}
                                                onChange={(e) => updateDiplomaFieldValue(field.id, e.target.value)}
                                                className="w-full bg-(--color-surface) text-lg font-semibold border-2 px-3 py-2"
                                                containerClassName="gap-0"
                                                error={fieldErrors[`diploma_field_${field.id}`]}
                                            />
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                fullUser.diploma ? (
                    <div className="border-(--color-text) pt-2 flex gap-3 flex-wrap w-full">
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
                        {fullUser.diploma.fields && fullUser.diploma.fields.length > 0 && (
                            <div className="border-2 px-5 py-4 flex flex-col gap-5 flex-1 bg-(--color-light)">
                                <p className="text-xs uppercase font-bold text-(--color-muted) mb-2 whitespace-nowrap">
                                    {t('profile.diplomaFields')}
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    {fullUser.diploma.fields.map((field: any) => (
                                        <div key={field.field_id} className="flex-1">
                                            <p className={`${labelStyle}`} title={field.field_name}>
                                                {isMdOrLarger ? truncateName(field.field_name, 40) : truncateName(field.field_name, 25)}
                                            </p>
                                            <p className={`${inputStyle} w-full truncate`}>{field.value !== null ? field.value : '-'}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-lg font-semibold">-</p>
                )
            )}
        </section>
    );
}