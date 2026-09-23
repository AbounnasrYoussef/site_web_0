'use client';

import CategoryCard from '@/components/category-card';
import { categoryIconMap } from '@/app/(zguellou)/constants';

export default function InterestsSection({
    fullUser,
    isEditing,
    allCategories,
    draftCategories,
    setDraftCategories,
    isMdOrLarger,
    truncateName,
    labelStyle,
    inputStyle,
    sharedStyles,
    t,
}: any) {
    const toggleCategory = (id: string) => {
        setDraftCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    return (
        <section className={`${sharedStyles} flex-1 m-0!`}>
            <h2 className="text-xl font-bold uppercase tracking-wide border-b-2 border-(--color-text) pb-2 mb-4">
                {t('profile.interests')}
            </h2>

            {isEditing ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {allCategories.map((category: any) => {
                        const IconComponent = categoryIconMap[category.name];
                        return (
                            <CategoryCard
                                key={category.id}
                                id={category.id}
                                label={category.translation_name}
                                icon={IconComponent ? <IconComponent className="w-10 h-10" /> : null}
                                isSelected={draftCategories.includes(category.id)}
                                onToggle={toggleCategory}
                            />
                        );
                    })}
                </div>
            ) : (
                fullUser.interested_categories && fullUser.interested_categories.length > 0 ? (
                    <div className="flex gap-3 flex-wrap flex-col sm:flex-row">
                        {fullUser.interested_categories.map((category: any) => {
                            const IconComponent = categoryIconMap[category.category_slug];
                            return (
                                <div
                                    key={category.category_id}
                                    className="border-2 border-(--color-text) bg-(--color-surface) p-3 flex flex-col items-center justify-center gap-2 hover:bg-(--color-highlight) transition-colors flex-1"
                                >
                                    {IconComponent && <IconComponent className="w-8 h-8 text-(--color-text)" />}
                                    <p className="text-xs font-bold uppercase text-center leading-tight wrap-break-word" title={category.category_name}>
                                        {isMdOrLarger ? truncateName(category.category_name, 30) : truncateName(category.category_name, 25)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-lg font-semibold">-</p>
                )
            )}
        </section>
    );
}