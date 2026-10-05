import { getTranslations } from "next-intl/server"; 
import Link from "next/link";


const buttonBase =
  "border-2 border-(--color-text) px-6 py-3 font-bold uppercase " +
  "shadow-[4px_4px_0_0_var(--color-text)] transition-all duration-100 " +
  "hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--color-text)]";

export default async function Hero() {
  const t = await getTranslations("home.hero");

  return (
    <section className="relative container mx-auto px-6 py-24">

      <div aria-hidden="true" className="absolute top-4 start-4 h-16 w-16 rotate-3 border-2 border-(--color-text) bg-orange-400" />
      <div aria-hidden="true" className="absolute bottom-4 end-8 hidden sm:block h-24 w-24 rounded-full border-2 border-(--color-text)" />
      <div aria-hidden="true" className="absolute top-40 end-24 hidden sm:block h-0 w-0 border-x-[20px] border-x-transparent border-t-[32px] border-t-(--color-accent)" />

      <p className="inline-block border-2 border-(--color-text) bg-(--color-accent-soft) px-4 py-1 mb-6 text-xs font-bold uppercase shadow-[4px_4px_0_0_var(--color-text)]">
        {t("badge")}
      </p>

      <h1 className="text-4xl sm:text-6xl font-black uppercase leading-tight">
        <span className="bg-(--color-accent-soft) px-2">{t("titleLine1")}</span>
        <br />
        <span className="bg-(--color-text) text-(--color-bg) px-2">{t("titleLine2")}</span>
      </h1>

      <p className="mt-8 max-w-2xl border-2 border-(--color-text) bg-(--color-accent-soft)/10 p-6 text-lg shadow-[4px_4px_0_0_var(--color-text)]">
        {t("description")}
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link href="#" className={`${buttonBase} bg-(--color-accent-soft)`}>
          {t("enterGrid")} →
        </Link>
        <a href="#contact" className={`${buttonBase} bg-(--color-surface)`}>
          {t("contactUs")}
        </a>
      </div>
    </section>
  );
}