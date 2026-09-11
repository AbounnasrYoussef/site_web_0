'use client';

import { useState } from 'react';

type Campus = {
  city: string;
  mapsLink: string;
  website: string;
  image: File | null;
};

type Props = {
  onClose: () => void;
};

const LANGUAGES = ['English', 'French', 'Arabic'] as const;
type Language = (typeof LANGUAGES)[number];

export default function AddUniversityModal({ onClose }: Props) {
  // Onglet de langue actif (chaque langue a ses propres champs de texte)
  const [activeLang, setActiveLang] = useState<Language>('English');

  // Les champs traduits : un objet par langue
  const [translations, setTranslations] = useState<Record<Language, { name: string; description: string }>>({
    English: { name: '', description: '' },
    French: { name: '', description: '' },
    Arabic: { name: '', description: '' },
  });

  // Champs communs (pas besoin de traduction)
  const [abbreviation, setAbbreviation] = useState('');
  const [type, setType] = useState('');
  const [hasDorms, setHasDorms] = useState(false);
  const [hasScholarship, setHasScholarship] = useState(false);

  // Liste dynamique de campus (au moins 1 au départ)
  const [campuses, setCampuses] = useState<Campus[]>([
    { city: '', mapsLink: '', website: '', image: null },
  ]);

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  function updateTranslation(field: 'name' | 'description', value: string) {
    setTranslations((prev) => ({
      ...prev,
      [activeLang]: { ...prev[activeLang], [field]: value },
    }));
  }

  function updateCampus(index: number, field: keyof Campus, value: string | File | null) {
    setCampuses((prev) =>
      prev.map((campus, i) => (i === index ? { ...campus, [field]: value } : campus))
    );
  }

  function addCampus() {
    setCampuses((prev) => [...prev, { city: '', mapsLink: '', website: '', image: null }]);
  }

  function removeCampus(index: number) {
    setCampuses((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');

    const payload = new FormData();
    payload.append('abbreviation', abbreviation);
    payload.append('type', type);
    payload.append('has_dorms', String(hasDorms));
    payload.append('has_scholarship', String(hasScholarship));

    // On envoie les traductions en JSON dans le FormData
    payload.append('translations', JSON.stringify(translations));

    // On envoie les infos de campus (hors image) en JSON
    const campusesData = campuses.map(({ city, mapsLink, website }) => ({
      city,
      mapsLink,
      website,
    }));
    payload.append('campuses', JSON.stringify(campusesData));

    // Les images de campus, chacune avec un nom unique
    campuses.forEach((campus, i) => {
      if (campus.image) {
        payload.append(`campus_image_${i}`, campus.image);
      }
    });

    try {
      const response = await fetch('http://localhost:8000/universities', {
        method: 'POST',
        body: payload,
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    // Overlay sombre qui couvre toute la page
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* La boîte du modal elle-même */}
      <div className="bg-(--color-surface) border-4 border-(--color-text) shadow-[8px_8px_0_0_var(--color-text)] w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-(--color-text)">
          <h2 className="text-2xl font-black uppercase">Add a New University</h2>
          <button onClick={onClose} className="text-2xl font-bold hover:opacity-60">
            ✕
          </button>
        </div>

        {/* Onglets de langue */}
        <div className="flex gap-3 p-6 border-b-2 border-(--color-text)">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 border-2 border-(--color-text) font-bold ${
                activeLang === lang ? 'bg-(--color-accent-soft)' : 'bg-(--color-surface)'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Contenu scrollable du formulaire */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1">
          {/* Section : General Info */}
          <div className="border-2 border-(--color-text) p-6 mb-8">
            <h3 className="text-lg font-black uppercase mb-4 border-b-2 border-(--color-text) pb-2">
              General Info
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase mb-2">
                  Name ({activeLang})
                </label>
                <input
                  type="text"
                  required
                  value={translations[activeLang].name}
                  onChange={(e) => updateTranslation('name', e.target.value)}
                  placeholder="University Name"
                  className="w-full border-2 border-(--color-text) p-3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2">
                  Abbreviation
                </label>
                <input
                  type="text"
                  required
                  value={abbreviation}
                  onChange={(e) => setAbbreviation(e.target.value)}
                  placeholder="e.g., ENSA"
                  className="w-full border-2 border-(--color-text) p-3"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase mb-2">Type</label>
              <select
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full border-2 border-(--color-text) p-3 bg-(--color-surface)"
              >
                <option value="">Public, Private, etc.</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase mb-2">
                Description ({activeLang})
              </label>
              <textarea
                required
                value={translations[activeLang].description}
                onChange={(e) => updateTranslation('description', e.target.value)}
                placeholder="Enter a description..."
                rows={3}
                className="w-full border-2 border-(--color-text) p-3"
              />
            </div>

            <div className="flex gap-8 pt-4 border-t-2 border-(--color-text)">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDorms}
                  onChange={(e) => setHasDorms(e.target.checked)}
                  className="w-5 h-5 border-2 border-(--color-text)"
                />
                <span className="text-sm font-bold uppercase">Dorm Available</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasScholarship}
                  onChange={(e) => setHasScholarship(e.target.checked)}
                  className="w-5 h-5 border-2 border-(--color-text)"
                />
                <span className="text-sm font-bold uppercase">Scholarship Available</span>
              </label>
            </div>
          </div>

          {/* Section : Campuses */}
          <h3 className="text-lg font-black uppercase mb-4">Campuses</h3>

          {campuses.map((campus, index) => (
            <div key={index} className="border-2 border-(--color-text) p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-block bg-(--color-accent-soft) border-2 border-(--color-text) px-3 py-1 font-bold text-sm">
                  Campus {index + 1}
                </span>
                {campuses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCampus(index)}
                    className="text-sm font-bold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2">City</label>
                  <select
                    required
                    value={campus.city}
                    onChange={(e) => updateCampus(index, 'city', e.target.value)}
                    className="w-full border-2 border-(--color-text) p-3 bg-(--color-surface)"
                  >
                    <option value="">Select a City</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Casablanca">Casablanca</option>
                    <option value="Khouribga">Khouribga</option>
                    <option value="Beni Mellal">Beni Mellal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-2">
                    Google Maps Link
                  </label>
                  <input
                    type="url"
                    value={campus.mapsLink}
                    onChange={(e) => updateCampus(index, 'mapsLink', e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full border-2 border-(--color-text) p-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2">Website</label>
                  <input
                    type="url"
                    value={campus.website}
                    onChange={(e) => updateCampus(index, 'website', e.target.value)}
                    placeholder="https://"
                    className="w-full border-2 border-(--color-text) p-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-2">
                    Campus Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      updateCampus(index, 'image', e.target.files ? e.target.files[0] : null)
                    }
                    className="w-full border-2 border-(--color-text) p-2 bg-(--color-surface)"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addCampus}
            className="border-2 border-dashed border-(--color-text) w-full py-3 font-bold uppercase mb-4 hover:bg-(--color-accent-soft)/10"
          >
            + Add Another Campus
          </button>
        </form>

        {/* Footer avec les boutons */}
        <div className="flex items-center justify-end gap-4 p-6 border-t-2 border-(--color-text)">
          {status === 'error' && (
            <span className="text-red-600 font-bold text-sm mr-auto">Something went wrong.</span>
          )}
          {status === 'success' && (
            <span className="text-green-600 font-bold text-sm mr-auto">✓ Saved!</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="border-2 border-(--color-text) px-6 py-3 font-bold uppercase"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="university-form"
            onClick={handleSubmit}
            disabled={status === 'sending'}
            className="bg-(--color-text) text-(--color-bg) px-6 py-3 font-bold uppercase"
          >
            {status === 'sending' ? 'Saving...' : 'Save University'}
          </button>
        </div>
      </div>
    </div>
  );
}