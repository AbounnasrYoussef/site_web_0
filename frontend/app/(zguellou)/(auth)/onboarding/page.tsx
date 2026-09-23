'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthFetch } from '@/app/(zguellou)/hooks/useAuthFetch';

import Input from '@/components/input';
import FullButton from '@/components/full-button';
import Dropdown from '@/components/dropdown';
import ToggleSwitch from '@/components/toggle-switch';
import CategoryCard from '@/components/category-card';

import FirstNameIcon from '@/public/icons/auth/label/FirstNameIcon';
import LastNameIcon from '@/public/icons/auth/label/LastNameIcon';
import YearIcon from '@/public/icons/auth/label/YearIcon';
import SkipIcon from '@/public/icons/auth/SkipIcon';
import ArrowRightIcon from '@/public/icons/auth/ArrowRight';
import InfoIcon from '@/public/icons/auth/InfoIcon';

import {
  CURRENT_YEAR,
  BIRTH_YEARS,
  DIPLOMA_LEVELS,
  categoryIconMap,
} from '@/app/(zguellou)/constants'

type OnboardingFormData = {
  first_name: string;
  last_name: string;
  year_of_birth: string;
  is_dropout: boolean;
  diploma_level: string;
  diploma_id: string;
  diploma_note: string;
  diploma_year: string;
  diploma_fields: Record<string, string>;
  interested_category_ids: string[];
};

type Option = { id: string; name: string; slug: string };
type Diploma = { id: string; rank: number; name: string };
type Field = { id: string; name: string };

const STORAGE_KEY = 'onboarding_progress';

const DEFAULT_FORM_DATA: OnboardingFormData = {
  first_name: '',
  last_name: '',
  year_of_birth: '',
  is_dropout: false,
  diploma_level: '',
  diploma_id: '',
  diploma_note: '',
  diploma_year: '',
  diploma_fields: {},
  interested_category_ids: [],
};

const STEP_FIELDS: Record<number, (keyof OnboardingFormData)[]> = {
  2: ['first_name', 'last_name', 'year_of_birth'],
  3: ['is_dropout', 'diploma_level', 'diploma_id', 'diploma_note', 'diploma_year', 'diploma_fields'],
  4: ['interested_category_ids'],
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateStep(
  step: number,
  data: OnboardingFormData,
  t: ReturnType<typeof useTranslations>
): Record<string, string> {
  const errors: Record<string, string> = {};

  const NAME_REGEX = /^[\p{L}]+$/u;
  const checkNameCharacters = (field: 'first_name' | 'last_name', errorKey: string) => {
    const value = data[field].trim();
    if (value && !NAME_REGEX.test(value)) {
      errors[field] = t(errorKey);
    }
  };

  const checkNameLength = (field: 'first_name' | 'last_name', errorKey: string) => {
    const value = data[field].trim();
    if (value && (value.length < 2 || value.length > 30)) {
      errors[field] = t(errorKey);
    }
  };

  if (step === 2) {
    checkNameLength('first_name', 'step2.firstNameError');
    checkNameLength('last_name', 'step2.lastNameError');
    checkNameCharacters('first_name', 'step2.firstNameInvalidChars');
    checkNameCharacters('last_name', 'step2.lastNameInvalidChars');
    if (data.year_of_birth) {
      const year = Number(data.year_of_birth);
      if (!Number.isInteger(year) || year < 1900 || year > CURRENT_YEAR) {
        errors.year_of_birth = t('step2.yearOfBirthError', { year: CURRENT_YEAR });
      }
    }
  }

  if (step === 3) {
    if (data.diploma_note) {
      const value = Number(data.diploma_note);
      if (Number.isNaN(value) || value < 0 || value > 20) {
        errors.diploma_note = t('step3.gradeError');
      }
    }
    if (data.diploma_year) {
      const year = Number(data.diploma_year);
      if (!Number.isInteger(year) || year < 2000 || year > CURRENT_YEAR) {
        errors.diploma_year = t('step3.diplomaYearError', { year: CURRENT_YEAR + 1 });
      }
    }
    Object.entries(data.diploma_fields).forEach(([fieldId, raw]) => {
      if (raw) {
        const value = Number(raw);
        if (Number.isNaN(value) || value < 0 || value > 100) {
          errors[`field_${fieldId}`] = t('step3.invalidNumber');
        }
      }
    });
  }

  return errors;
}

function hasAnyNonDefaultValue(data: OnboardingFormData): boolean {
  return (Object.keys(DEFAULT_FORM_DATA) as (keyof OnboardingFormData)[]).some((key) => {
    const value = data[key];
    const defaultValue = DEFAULT_FORM_DATA[key];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length > 0;
    return value !== defaultValue;
  });
}

function resetStepFields(data: OnboardingFormData, step: number): OnboardingFormData {
  const next = { ...data };
  STEP_FIELDS[step].forEach((field) => {
    (next as any)[field] = DEFAULT_FORM_DATA[field];
  });
  return next;
}

function loadStoredProgress(): { step: number; formData: OnboardingFormData } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      step: typeof parsed.step === 'number' ? parsed.step : 2,
      formData: { ...DEFAULT_FORM_DATA, ...parsed.formData },
    };
  } catch {
    return null;
  }
}

const Step2Content = ({ formData, errors, updateField, t }: any) => {
  return (
    <div className="p-6 sm:p-8 border-b-[3px] border-b-black space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          label={t('step2.firstName')}
          icon={<FirstNameIcon className="w-4 h-4" />}
          placeholder={t('step2.firstNamePlaceholder')}
          value={formData.first_name}
          onChange={(e) => updateField('first_name', e.target.value)}
          error={errors.first_name}
        />

        <Input
          label={t('step2.lastName')}
          icon={<LastNameIcon className="w-4 h-4" />}
          placeholder={t('step2.lastNamePlaceholder')}
          value={formData.last_name}
          onChange={(e) => updateField('last_name', e.target.value)}
          error={errors.last_name}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Dropdown
          label={t('step2.yearOfBirth')}
          icon={<YearIcon className="w-4 h-4 shrink-0" />}
          placeholder={t('step2.yearOfBirthPlaceholder')}
          value={formData.year_of_birth}
          onChange={(val) => updateField('year_of_birth', val)}
          options={BIRTH_YEARS.map(y => String(y))}
        />
        {errors.year_of_birth && (
          <span className="text-xs text-red-700 font-semibold">{errors.year_of_birth}</span>
        )}
      </div>
    </div>
  );
};

const Step3Content = ({
  formData,
  errors,
  updateField,
  t,
  diplomas,
  diplomaFieldsList,
  handleLevelChange,
  handleDiplomaChange,
  updateDiplomaFieldValue,
}: any) => {
  const selectedLevel = formData.diploma_level ? Number(formData.diploma_level) : null;
  const diplomasAtLevel = selectedLevel !== null ? diplomas.filter((d: Diploma) => d.rank === selectedLevel) : [];

  return (
    <div className="flex flex-col">

      <div className="p-6 sm:p-8 border-b-[3px] border-b-black">
        <ToggleSwitch
          id="is_dropout"
          label={t('step3.dropoutLabel')}
          checked={formData.is_dropout}
          onChange={(e) => updateField('is_dropout', e.target.checked)}
        />
      </div>

      {/* Diploma selection */}
      {!formData.is_dropout && (
        <div className="p-6 sm:p-8 space-y-6 border-b-[3px] border-b-black">
          <div>
            <Dropdown
              label={t('step3.diplomaLevel')}
              placeholder={t('step3.diplomaLevelPlaceholder')}
              value={formData.diploma_level}
              onChange={handleLevelChange}
              options={DIPLOMA_LEVELS.map((l) => ({
                label: t(`step3.levels.${l.labelKey}`),
                value: l.value,
              }))}
            />
          </div>

          {formData.diploma_level && (
            <div>
              <Dropdown
                label={t('step3.diploma')}
                placeholder={t('step3.diplomaPlaceholder')}
                value={formData.diploma_id}
                onChange={handleDiplomaChange}
                options={diplomasAtLevel.map((d: Diploma) => ({
                  label: d.name,
                  value: d.id,
                }))}
              />
            </div>
          )}

          {formData.diploma_id && (
            <>
              <div className="flex flex-col gap-1">
                <Dropdown
                  label={t('step3.diplomaYear')}
                  icon={<YearIcon className="w-4 h-4 shrink-0" />}
                  placeholder={t('step3.diplomaYearPlaceholder')}
                  value={formData.diploma_year}
                  onChange={(val) => updateField('diploma_year', val)}
                  options={Array.from({ length: CURRENT_YEAR - 2000 + 1 }, (_, i) => String(CURRENT_YEAR - i))}
                />
                {errors.diploma_year && <span className="text-xs text-red-700 font-semibold">{errors.diploma_year}</span>}
              </div>

              <div>
                <Input
                  label={t('step3.diplomaNote')}
                  type="text"
                  placeholder="10.00"
                  dir="ltr"
                  value={formData.diploma_note}
                  onChange={(e) => updateField('diploma_note', e.target.value)}
                  error={errors.diploma_note}
                />
              </div>

              {formData.diploma_note && diplomaFieldsList.map((field: Field) => (
                <div key={field.id}>
                  <Input
                    label={field.name}
                    type="text"
                    dir="ltr"
                    value={formData.diploma_fields[field.id] ?? ''}
                    onChange={(e) => updateDiplomaFieldValue(field.id, e.target.value)}
                    error={errors[`field_${field.id}`]}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const Step4Content = ({ formData, errors, updateField, t, categories, categoryIconMap }: any) => {
  const toggleCategory = (id: string) => {
    updateField('interested_category_ids',
      formData.interested_category_ids.includes(id)
        ? formData.interested_category_ids.filter((v: string) => v !== id)
        : [...formData.interested_category_ids, id]
    );
  };

  return (
    <div className="flex flex-col border-b-[3px] border-b-black">
      <div className="p-6 sm:p-8 space-y-4 border-b-[3px] border-b-black">
        <p className="text-sm font-bold uppercase tracking-wide text-(--color-text)">
          {t('step4.categoriesTitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category: any) => {
            const IconComponent = categoryIconMap[category.name];

            return (
              <CategoryCard
                key={category.id}
                id={category.id}
                label={category.translation_name}
                icon={IconComponent ? <IconComponent className="w-10 h-10" /> : ''}
                isSelected={formData.interested_category_ids.includes(category.id)}
                onToggle={toggleCategory}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function OnboardingPage() {
  const authFetch = useAuthFetch();
  const t = useTranslations('onboarding');
  const router = useRouter();

  const [step, setStep] = useState(2);
  const [formData, setFormData] = useState<OnboardingFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Option[]>([]);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [diplomaFieldsList, setDiplomaFieldsList] = useState<Field[]>([]);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  function clearCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = name + '=; max-age=0; path=/';
  }

  useEffect(() => {
    const entryGranted = getCookie('onboarding_entry') === 'granted';
    if (!entryGranted) {
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    const stored = loadStoredProgress();
    if (stored) {
      setStep(stored.step);
      setFormData(stored.formData);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, formData }));
  }, [step, formData]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [profileRes, categoriesRes, diplomasRes] = await Promise.all([
          authFetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/profile`),
          authFetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/categories`),
          authFetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/diplomas`),
        ]);
        const profileJson = await profileRes.json();
        // prefill first_name/last_name from profile
        if (profileJson.user) {
          setFormData((prev) => ({
            ...prev,
            first_name: profileJson.user.first_name || prev.first_name,
            last_name: profileJson.user.last_name || prev.last_name,
          }));
        }
        setCategories((await categoriesRes.json()).categories);
        setDiplomas((await diplomasRes.json()).diplomas);
      } catch (err) {
        console.error('Failed to load onboarding options', err);
      }
    }
    loadOptions();
  }, [authFetch]);

  // Fetch fields when diploma changes
  useEffect(() => {
    if (!formData.diploma_id) {
      setDiplomaFieldsList([]);
      return;
    }
    async function loadFields() {
      try {
        const res = await authFetch(
          `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/diplomas/${formData.diploma_id}/fields`
        );
        const json = await res.json();
        setDiplomaFieldsList(json.fields || []);
      } catch (err) {
        console.error('Failed to load diploma fields', err);
        setDiplomaFieldsList([]);
      }
    }
    loadFields();
  }, [formData.diploma_id, authFetch]);

  const updateField = <K extends keyof OnboardingFormData>(field: K, value: OnboardingFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleLevelChange = (level: string) => {
    setFormData((prev) => ({
      ...prev,
      diploma_level: level,
      diploma_id: '',
      diploma_note: '',
      diploma_fields: {},
    }));
  };

  const handleDiplomaChange = (diplomaId: string) => {
    setFormData((prev) => ({
      ...prev,
      diploma_id: diplomaId,
      diploma_note: '',
      diploma_fields: {},
    }));
  };

  const updateDiplomaFieldValue = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      diploma_fields: { ...prev.diploma_fields, [fieldId]: value },
    }));
  };

  const clearStorage = () => sessionStorage.removeItem(STORAGE_KEY);

  const handleNext = () => {
    const stepErrors = validateStep(step, formData, t);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4));
  };

  const handlePrevious = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 2));
  };

  const handleSkipStep = () => {
    const resetData = resetStepFields(formData, step);
    setFormData(resetData);
    setErrors({});
    if (step === 4) {
      finishFlow(resetData);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleSkipAll = () => {
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
    clearStorage();
    clearCookie('onboarding_entry');
    router.replace('/profile');
    setFinished(true);
  };

  const finishFlow = async (finalData: OnboardingFormData) => {
    if (!hasAnyNonDefaultValue(finalData)) {
      clearStorage();
      clearCookie('onboarding_entry');
      setFinished(true);
      router.replace('/profile');
      return;
    }

    setSubmitting(true);

    const formData = new FormData();

    if (finalData.first_name) formData.append('first_name', finalData.first_name.trim());
    if (finalData.last_name) formData.append('last_name', finalData.last_name.trim());
    if (finalData.year_of_birth) formData.append('year_of_birth', finalData.year_of_birth);
    if (finalData.is_dropout) formData.append('is_dropout', String(finalData.is_dropout));
    if (finalData.diploma_id) formData.append('diploma_id', finalData.diploma_id);
    if (finalData.diploma_note) formData.append('diploma_note', finalData.diploma_note);
    if (finalData.diploma_year) formData.append('diploma_year', finalData.diploma_year);

    const fieldEntries = Object.entries(finalData.diploma_fields).filter(([, v]) => v);
    if (fieldEntries.length > 0) {
      const fields = fieldEntries.map(([field_id, value]) => ({
        field_id,
        value: Number(value),
      }));
      formData.append('diploma_fields', JSON.stringify(fields));
    }

    if (finalData.interested_category_ids.length > 0) {
      formData.append('interested_category_ids', JSON.stringify(finalData.interested_category_ids));
    }

    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/profile`, {
        method: 'PATCH',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw errorData;
      }

      clearCookie('onboarding_entry');
      clearStorage();
      router.replace('/profile');
    } catch (err: any) {
      console.error('Profile update error:', err);
      if (err.errors && Array.isArray(err.errors)) {
        const fieldErrorMap: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          fieldErrorMap[e.field] = e.message;
        });
        setErrors(fieldErrorMap);
      } else {
        setErrors((prev) => ({ ...prev, submit: err.error || err.message || 'Unknown error' }));
      }
      setSubmitting(false);
      clearStorage();
    }
  };

  const handleSubmit = async () => {
    const stepErrors = validateStep(4, formData, t);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    await finishFlow(formData);
  };

  if (finished) {
    return <div>{t('finishedMessage')}</div>;
  }

  const progressRatio = step >= 2 ? 0.5 + (step - 2) * 0.25 : 0;

  return (
    <div className="flex-1 dotted-bg flex items-center justify-center p-4">
      <style jsx>{`
        @keyframes stripe-slide {
          from { background-position: 0 0; }
          to { background-position: 28px 0; }
        }
        .progress-stripe {
          animation: stripe-slide 0.7s linear infinite;
        }
      `}</style>

      <div className="container flex justify-center">
        <div className="w-full sm:max-w-[90%] lg:max-w-[70%] bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)]">

          <div className="border-b-[3px] border-b-black p-6 sm:p-8">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <span className="border-2 border-(--color-text) bg-(--color-highlight) px-3 py-1 text-xs font-mono font-bold uppercase tracking-wide">
                {t('stepOf', { step, total: 4 })}
              </span>
              {step < 4 &&
                <button
                  onClick={handleSkipAll}
                  className="cursor-pointer flex-end text-xs font-bold uppercase tracking-wide underline decoration-2 underline-offset-4 hover:text-(--color-accent) transition-all duration-100 hover:-translate-y-0.5 active:translate-y-0.5"
                >
                  {t('skipAll')}
                </button>
              }
            </div>

            <h1 className="mt-4 uppercase font-black leading-none tracking-tight text-4xl sm:text-5xl">
              {t(`step${step}.title`)}
            </h1>
            <p className="mt-3 uppercase text-xs tracking-[0.2em] font-mono max-w-md">
              {t(`step${step}.subtitle`)}
            </p>

            <div className="relative mt-6 h-5 w-full overflow-hidden border-2 border-(--color-text) bg-(--color-grey)">
              <div
                className="absolute top-0 h-full bg-(--color-text) transition-all duration-500 ease-out ltr:right-0 rtl:left-0"
                style={{ width: `${1 - progressRatio * 100}%` }}
              />
              <div
                className="progress-stripe absolute top-0 h-full transition-all duration-500 ease-out ltr:left-0 rtl:right-0"
                style={{
                  width: `${(progressRatio) * 100}%`,
                  backgroundImage:
                    'repeating-linear-gradient(45deg, var(--color-text) 0 8px, var(--color-highlight) 8px 20px)',
                  backgroundSize: '28px 28px',
                }}
              />
            </div>
          </div>

          {step === 2 && <Step2Content formData={formData} errors={errors} updateField={updateField} t={t} />}
          {step === 3 && (
            <Step3Content
              formData={formData}
              errors={errors}
              updateField={updateField}
              t={t}
              diplomas={diplomas}
              diplomaFieldsList={diplomaFieldsList}
              handleLevelChange={handleLevelChange}
              handleDiplomaChange={handleDiplomaChange}
              updateDiplomaFieldValue={updateDiplomaFieldValue}
            />
          )}
          {step === 4 && (
            <Step4Content
              formData={formData}
              errors={errors}
              updateField={updateField}
              t={t}
              categories={categories}
              categoryIconMap={categoryIconMap}
            />
          )}

          <div className="flex gap-2 items-start sm:items-center justify-between flex-wrap p-3 bg-(--color-grey)">
            <div className="flex items-center gap-2 text-xs text-(--color-muted)">
              <InfoIcon className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{t('step2.footerNote')}</span>
            </div>

            <div className={`w-full lg:w-auto flex flex-wrap sm:flex-nowrap items-center ${step <= 2 ? 'justify-end' : 'justify-between'} gap-3`}>
              {step > 2 && (
                <FullButton
                  text={t('previous')}
                  onClick={handlePrevious}
                  backgroundColor="var(--color-surface)"
                />
              )}

              <div className='flex gap-2'>
                <FullButton
                  text={t('skipStep')}
                  onClick={handleSkipStep}
                  backgroundColor="var(--color-surface)"
                >
                  <SkipIcon className="w-4 h-4 rtl:rotate-180" />
                </FullButton>

                {step < 4 && (
                  <FullButton
                    text={t('next')}
                    onClick={handleNext}
                    className='flex-row-reverse'
                    backgroundColor="var(--color-highlight)"
                  >
                    <ArrowRightIcon className="w-4 h-4 rtl:rotate-180" />
                  </FullButton>
                )}

                {step === 4 && (
                  <FullButton
                    text={submitting ? t('submitting') : t('finish')}
                    onClick={handleSubmit}
                    backgroundColor="var(--color-highlight)"
                    disabled={submitting}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}