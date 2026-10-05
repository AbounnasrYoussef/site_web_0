import Image from "next/image";
import { getTranslations } from "next-intl/server";


export default async function About() {
    const t = await getTranslations("home.about");

    return (
        <section className="border-t-4 border-(--color-text)">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2">


                <div className="flex flex-col justify-center border-b-4 md:border-b-0 md:border-e-4 border-(--color-text) p-10 md:p-20">

                    <div className="flex items-center gap-3 mb-8">
                        <h2 className="text-3xl font-black uppercase">{t("title")}</h2>
                    </div>

                    <blockquote className="border-s-4 border-(--color-accent) ps-4 mb-8">
                        <p className="text-xl font-bold">{t("quote")}</p>
                    </blockquote>


                    <p className="text-base text-(--color-muted)">
                        {t("description")}
                    </p>


                    <div className="mt-8 flex flex-wrap gap-4">
                        <div className="border-2 border-(--color-text) bg-(--color-accent-soft)/10 px-4 py-2">
                            <span className="font-mono text-sm">{t("members")}</span>
                        </div>
                        <div className="border-2 border-(--color-text) bg-(--color-accent-soft)/10  px-4 py-2">
                            <span className="font-mono text-sm">{t("institutions")}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center p-10 md:p-16">
                    <div className="relative w-full aspect-video border-2 border-(--color-text) shadow-[4px_4px_0_0_var(--color-text)]">
                        <Image
                            src="/images/swarm.png"
                            alt={t("title")}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>
                </div>

            </div>
        </section>
    );
}