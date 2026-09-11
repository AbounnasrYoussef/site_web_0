'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import AddUniversityModal from '@/components/AddUniversityModal';

export default function UniversitiesPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex min-h-screen text-(--color-text) squared-bg">
      <Sidebar />

      <main className="flex-1 p-8 relative">
        <h1 className="text-3xl font-black uppercase mb-6">Universities</h1>

        {/* Bouton flottant pour ouvrir le modal */}
        <button
          onClick={() => setShowModal(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-(--color-accent-soft) border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)] text-2xl font-bold"
        >
          +
        </button>
      </main>

      {showModal && <AddUniversityModal onClose={() => setShowModal(false)} />}
    </div>
  );
}