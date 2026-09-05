import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { LegalNav } from "@/components/LegalNav";

export const metadata: Metadata = {
  title: "Über Used Fruit",
  description: "Unsere Mission: gebrauchte Apple-Geräte einfach finden, länger nutzen und fair in der Nachbarschaft weitergeben.",
};

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-[680px] px-5 py-12 sm:px-6 md:py-16">
        <h1 className="text-[28px] font-semibold tracking-tight text-uf-text sm:text-[36px]">Über Used Fruit</h1>
        <p className="mt-5 text-[21px] leading-relaxed tracking-tight text-uf-text">Gute Geräte verdienen ein zweites Zuhause.</p>
        <div className="uf-legal mt-8">
          <p>Wir glauben, dass es nicht immer das neueste Gerät sein muss. Used Fruit soll es leicht machen, gebrauchte Apple-Produkte zu finden und weiterzugeben. Unser Ziel ist, vorhandene Geräte länger zu nutzen und einen bewussteren Umgang mit Ressourcen im Alltag selbstverständlich zu machen.</p>

          <h2>Genau das finden, was du brauchst</h2>
          <p>Ein passendes Gerät zu finden, sollte einfach sein. Mit gezielten Filtern kannst du deine Suche auf die Eigenschaften eingrenzen, die dir wichtig sind: vom Modell und Speicher bis zum Zustand und Tastaturlayout. Wir konzentrieren uns auf klare Angaben und eine übersichtliche Suche.</p>

          <h2>Aus der Nähe. Für ein gutes Gefühl.</h2>
          <p>Wir glauben an Nachbarschaft und lokale Begegnungen. Gerade bei einem kostspieligen Gerät ist es sinnvoll, es vor dem Kauf persönlich anzusehen und auszuprobieren. Deshalb hat die Abholung vor Ort bei uns einen festen Platz. Du kannst Fragen direkt klären und dir selbst ein Bild vom Zustand machen.</p>

          <h2>Weniger Aufwand, mehr Klarheit</h2>
          <p>Unser Ansatz ist minimalistisch. Wir möchten unnötige Schritte weglassen und das Inserieren so angenehm wie möglich gestalten. Einheitliche Modellansichten helfen bei der Orientierung, ohne dass für jedes Inserat neue Produktfotos aufgenommen werden müssen.</p>
          <p>Die Modellansicht zeigt das Gerät als Modell, nicht den individuellen Zustand des angebotenen Exemplars. Deshalb sind ehrliche Angaben zu Gebrauchsspuren, Funktionen und Besonderheiten entscheidend. Was ein gebrauchtes Gerät ausmacht, soll klar erkennbar sein.</p>

          <h2>Eine Gemeinschaft mit Verantwortung</h2>
          <p>Wir möchten eine verbindliche Community aufbauen, in der Menschen fair, respektvoll und ehrlich miteinander umgehen. Dazu gehören zutreffende Inserate, transparente Kommunikation und verlässliche Absprachen.</p>
          <p>Betrug, Täuschung und Belästigung haben bei Used Fruit keinen Platz. Unser Anspruch ist, Hinweisen auf Verstöße konsequent nachzugehen und angemessene Maßnahmen bis hin zum Ausschluss aus der Community zu ergreifen. Auffällige Anzeigen kannst du direkt im Inserat melden.</p>

          <h2>Bewusst weitergeben</h2>
          <p>Nachhaltiger zu handeln soll sich einfach und gut anfühlen. Dafür entwickeln wir Used Fruit weiter: mit einer ruhigen Oberfläche, hilfreichen Informationen und dem Ziel, Vertrauen und Orientierung beim Gebrauchtkauf zu stärken.</p>
        </div>
        <Link href="/" className="mt-9 inline-flex h-11 items-center rounded-full bg-uf-text px-5 text-[14px] text-white">Geräte entdecken</Link>
      </main>
      <footer className="mx-auto max-w-[680px] px-5 pb-8 sm:px-6"><LegalNav /></footer>
    </div>
  );
}
