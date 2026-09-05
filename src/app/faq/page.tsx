import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { LegalNav } from "@/components/LegalNav";
import { FaqQuestionForm } from "@/components/FaqQuestionForm";

export const metadata: Metadata = {
  title: "Häufige Fragen – Used Fruit",
  description: "Antworten zur Gerätesuche, zum Inserieren, zur Anmeldung, Abholung und zur Community von Used Fruit.",
};

const groups = [
  {
    title: "Used Fruit kennenlernen",
    questions: [
      ["Was ist Used Fruit?", "Used Fruit ist ein unabhängiger Marktplatz für gebrauchte Apple-Geräte. Unser Ziel ist eine einfache Suche mit passenden Filtern und die unkomplizierte Weitergabe von Geräten – besonders in deiner Nähe."],
      ["Ist Used Fruit mit Apple verbunden?", "Nein. Used Fruit ist unabhängig und wird nicht von Apple betrieben, unterstützt oder autorisiert."],
      ["Welche Geräte finde ich hier?", "Der Katalog umfasst derzeit Mac, iPad und iPhone. Welche Modelle und Varianten verfügbar sind, siehst du in der Suche und beim Inserieren."],
      ["Sind alle Angebote echte Verkaufsangebote?", "Die aktuelle Version enthält auch Demo-Inserate, die die Funktionen veranschaulichen. Eigene Inserate, Chats und Favoriten werden derzeit im jeweiligen Browser gespeichert; eine gemeinsame Online-Datenbank für den Marktplatz ist noch nicht eingerichtet."],
    ],
  },
  {
    title: "Suchen und Kontakt aufnehmen",
    questions: [
      ["Wie finde ich ein passendes Gerät?", "Wähle zunächst eine Kategorie und grenze die Ergebnisse mit den Filtern ein. Je nach Gerät kannst du beispielsweise Modell, Speicher, Zustand, Tastaturlayout, Garantie oder Versand auswählen. Über den Standort und Umkreis suchst du in deiner Nähe."],
      ["Wie merke ich mir ein Angebot?", "Tippe auf das Herz. Als Gast wirst du zur Anmeldung weitergeleitet. Nach erfolgreicher Anmeldung wird deine Auswahl in den Favoriten übernommen."],
      ["Was passiert bei Kaufen oder Nachricht?", "Beide Buttons öffnen die Unterhaltung zum Inserat. Wenn du nicht angemeldet bist, meldest du dich zuerst an. Es wird dabei weder automatisch eine Nachricht verschickt noch eine Zahlung ausgelöst. Die weiteren Absprachen erfolgen im Chat."],
      ["Wie funktionieren Abholung und Versand?", "Im Inserat steht, ob nur Abholung oder auch Versand möglich ist. Treffpunkt, Versandkosten und die weitere Abwicklung besprichst du mit dem Anbieter. Mit dem Filter Versand möglich findest du Angebote, die Versand vorsehen."],
      ["Was zeigt die Karte?", "Ohne veröffentlichte Straße zeigt die Karte nur den ungefähren Ort anhand von Stadt und Postleitzahl. Den genauen Treffpunkt vereinbarst du direkt. Vollbild vergrößert die Karte; Apple Maps öffnet den Ort im Kartendienst."],
    ],
  },
  {
    title: "Ein Gerät inserieren",
    questions: [
      ["Wie erstelle ich ein Inserat?", "Der Assistent führt dich Schritt für Schritt durch die Geräteangaben. In Auswahllisten ist die erste Option vorausgewählt. Prüfe jede Angabe und ändere sie passend zu deinem Gerät; die Vorauswahl ist keine automatische Geräteerkennung."],
      ["Kann ich mein Inserat vor der Anmeldung vorbereiten?", "Ja. Du kannst die Angaben zunächst ausfüllen. Am Ende führt Mit Apple anmelden & veröffentlichen zur Anmeldung oder Registrierung. Dein fertiger Entwurf bleibt im selben Browser-Tab erhalten und wird nach erfolgreicher Anmeldung übernommen. Bereits angemeldet kannst du direkt veröffentlichen."],
      ["Muss ich eigene Produktfotos aufnehmen?", "Für die Katalogdarstellung nutzt Used Fruit einheitliche Modellansichten. Diese zeigen nicht den individuellen Zustand deines Exemplars. Beschreibe den Zustand deshalb zutreffend und kläre Gebrauchsspuren oder Besonderheiten vor dem Kauf direkt mit Interessenten."],
      ["Warum sind Tastaturlayout und SIM-Lock wichtig?", "Bei einem MacBook ist die Tastatur fest eingebaut. Gib deshalb das tatsächliche Layout an, etwa DE/AT oder CH. Bei iPhones und Cellular-iPads wählst du Ohne SIM-Lock oder Mit SIM-Lock. Gemeint ist die Bindung an einen Mobilfunkanbieter, nicht die SIM-PIN. Prüfe die Angabe am Gerät beziehungsweise beim Anbieter."],
      ["Was bedeutet die Garantieangabe?", "Hier wird das vom Anbieter angegebene Ablaufdatum einer Apple-Garantie beziehungsweise AppleCare+-Abdeckung dargestellt. Used Fruit überprüft diese Angaben nicht automatisch. Lass dir eine noch bestehende Abdeckung vom Anbieter belegen."],
      ["Wie breche ich das Inserieren ab?", "Klicke im Assistenten oben mittig auf das Used-Fruit-Logo. Du wirst gefragt, ob du den Vorgang abbrechen möchtest. Mit Abbruch bleibst du im Entwurf; beim bestätigten Abbruch werden die Angaben verworfen."],
    ],
  },
  {
    title: "Konto und Community",
    questions: [
      ["Wie melde ich mich an?", "Tippe auf „Mit Apple anmelden“. Du wirst direkt zu Apple weitergeleitet und meldest dich mit deinem Apple Account an. Danach kehrst du zu Used Fruit zurück. Andere Anmeldeverfahren werden nicht angeboten."],
      ["Sehe ich meine Inserate und Chats auf einem anderen Gerät?", "Derzeit noch nicht. Die Anmeldung ist mit deinem Apple Account verbunden, die Marktplatzdaten bleiben jedoch lokal in deinem Browser. Ein anderes Gerät oder das Löschen der Browserdaten kann deshalb dazu führen, dass diese Inhalte dort nicht verfügbar sind."],
      ["Wie melde ich eine auffällige Anzeige?", "Unter den technischen Angaben findest du Anzeige melden. Wähle einen Grund, ergänze bei Bedarf Details und öffne die vorbereitete E-Mail. Die Anzeigen-ID und der Link sind enthalten. Erst wenn du die Nachricht in deinem E-Mail-Programm sendest, wird sie eingereicht."],
      ["Wie blockiere ich einen Nutzer?", "Im Anbieterbereich des Inserats findest du Nutzer blockieren. Unter Konto → Blockierte Profile kannst du deine Blockliste öffnen und Nutzer wieder entblockieren. Die aktuelle Blockierung blendet deren Inserate in deinem Browser aus. Eine gegenseitige, geräteübergreifende Sperre ist noch nicht umgesetzt."],
      ["Welcher Umgang ist in der Community erwünscht?", "Wir erwarten ehrliche Geräteangaben, respektvolle Nachrichten und faire Absprachen. Täuschung, Spam und Belästigung widersprechen diesem Anspruch. Auffällige Inserate kannst du melden; unsere Regeln findest du in den Nutzerbedingungen."],
    ],
  },
];

export default function FaqPage() {
  return <div className="min-h-dvh bg-white">
    <SiteHeader />
    <main className="mx-auto max-w-[760px] px-5 py-12 sm:px-6 md:py-16">
      <h1 className="text-[28px] font-semibold tracking-tight sm:text-[36px]">Häufige Fragen</h1>
      <p className="mt-4 text-[16px] leading-relaxed text-uf-text-secondary">Alles Wichtige rund um Used Fruit. Wähle eine Frage, um die Antwort zu lesen.</p>
      {groups.map(group => <section key={group.title} className="mt-10">
        <h2 className="mb-3 text-[18px] font-semibold">{group.title}</h2>
        <div className="divide-y divide-uf-border-soft border-y border-uf-border-soft">
          {group.questions.map(([question, answer]) => <details key={question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
              {question}<span aria-hidden="true" className="shrink-0 text-[20px] font-normal text-uf-text-secondary transition-transform group-open:rotate-45 motion-reduce:transition-none">+</span>
            </summary>
            <p className="mt-3 pr-6 text-[14px] leading-relaxed text-uf-text-secondary">{answer}</p>
          </details>)}
        </div>
      </section>)}
      <FaqQuestionForm />
    </main>
    <footer className="mx-auto max-w-[760px] px-5 pb-8 sm:px-6"><LegalNav /></footer>
  </div>;
}
