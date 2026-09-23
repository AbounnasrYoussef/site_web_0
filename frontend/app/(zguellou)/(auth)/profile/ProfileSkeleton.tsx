'use client';

export default function ProfileSkeleton() {
  const skeletonBlock = 'bg-gray-200 dark:bg-gray-300 rounded-md animate-pulse';

  return (
    <main className="min-h-screen p-6 dotted-bg">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ─── Header Skeleton ─────────────────────────────── */}
        <div className="bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)] p-4 sm:p-8 mb-8 flex flex-wrap items-center justify-between gap-4">
          {/* Left side: avatar + name */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            {/* Avatar placeholder */}
            <div className="w-30 h-30 border-2 border-(--color-text) bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className={`h-8 w-48 ${skeletonBlock}`} /> {/* Name */}
              <div className={`h-4 w-32 ${skeletonBlock}`} /> {/* Role */}
            </div>
          </div>
          {/* Right side: buttons */}
          <div className="w-full md:w-auto flex flex-row flex-wrap md:flex-col gap-2">
            <div className={`h-12 w-full md:w-32 ${skeletonBlock}`} />
            <div className={`h-12 w-full md:w-32 ${skeletonBlock}`} />
          </div>
        </div>

        {/* ─── Personal Information ──────────────────────────── */}
        <div className="bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)] p-4 sm:p-8 mb-8">
          <div className={`h-6 w-48 ${skeletonBlock} mb-4`} /> {/* Section title */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 space-y-1">
                <div className={`h-3 w-20 ${skeletonBlock}`} />
                <div className={`h-10 w-full ${skeletonBlock}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className={`h-3 w-20 ${skeletonBlock}`} />
                <div className={`h-10 w-full ${skeletonBlock}`} />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 space-y-1">
                <div className={`h-3 w-20 ${skeletonBlock}`} />
                <div className={`h-10 w-full ${skeletonBlock}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className={`h-3 w-20 ${skeletonBlock}`} />
                <div className={`h-10 w-full ${skeletonBlock}`} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Academic Information ──────────────────────────── */}
        <div className="bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)] p-4 sm:p-8 mb-8">
          <div className={`h-6 w-48 ${skeletonBlock} mb-4`} />
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 space-y-2">
              <div className={`h-3 w-24 ${skeletonBlock}`} />
              <div className={`h-10 w-full ${skeletonBlock}`} />
            </div>
            <div className="flex-1 space-y-2">
              <div className={`h-3 w-24 ${skeletonBlock}`} />
              <div className={`h-10 w-full ${skeletonBlock}`} />
            </div>
            <div className="flex-1 space-y-2">
              <div className={`h-3 w-24 ${skeletonBlock}`} />
              <div className={`h-10 w-full ${skeletonBlock}`} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className={`h-3 w-32 ${skeletonBlock}`} />
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 space-y-1">
                <div className={`h-3 w-20 ${skeletonBlock}`} />
                <div className={`h-10 w-full ${skeletonBlock}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className={`h-3 w-20 ${skeletonBlock}`} />
                <div className={`h-10 w-full ${skeletonBlock}`} />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Interests & Security (two columns on desktop) ── */}
        <div className="flex gap-8 flex-wrap">
          {/* Interests */}
          <div className="bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)] p-4 sm:p-8 flex-1 m-0!">
            <div className={`h-6 w-48 ${skeletonBlock} mb-4`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-24 w-full ${skeletonBlock}`} />
              ))}
            </div>
          </div>
          {/* Security */}
          <div className="bg-(--color-surface) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)] p-4 sm:p-8 flex-1 m-0!">
            <div className={`h-6 w-48 ${skeletonBlock} mb-4`} />
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`h-4 w-32 ${skeletonBlock}`} />
                  <div className={`h-3 w-24 ${skeletonBlock} mt-1`} />
                </div>
                <div className={`w-12 h-6 ${skeletonBlock}`} />
              </div>
              <div className={`h-10 w-full ${skeletonBlock}`} />
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}