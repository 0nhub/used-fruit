import { LegalDocument } from "@/components/LegalDocument";
import { LEGAL } from "@/lib/legal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Impressum",
  description: `Impressum von ${LEGAL.platformName} gemäß § 5 DDG.`,
};

export default function ImpressumPage() {
  return (
    <LegalDocument title="Impressum">
      <p>
        Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Medienstaatsvertrag
        (MStV).
      </p>

      <h2>Diensteanbieter</h2>
      <address>
        {LEGAL.operatorName}
        <br />
        {LEGAL.street}
        <br />
        {LEGAL.postalCode} {LEGAL.city}
        <br />
        {LEGAL.country}
      </address>

      <h2>Kontakt</h2>
      <p>
        Telefon:{" "}
        <a href={LEGAL.phoneHref}>{LEGAL.phoneDisplay}</a>
        <br />
        E-Mail:{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </p>

      <h2>Vertretungsberechtigte Person</h2>
      <p>
        {LEGAL.operatorName} handelt als natürliche Person und ist für das Angebot
        von {LEGAL.platformName} allein verantwortlich.
      </p>

      <h2>Registereintrag</h2>
      <p>
        Es besteht keine Eintragung im Handelsregister. {LEGAL.platformName} wird
        nicht in der Rechtsform einer eingetragenen Handelsgesellschaft betrieben.
      </p>

      <h2>Umsatzsteuer</h2>
      <p>
        Eine Umsatzsteuer-Identifikationsnummer nach § 27a Umsatzsteuergesetz liegt
        nicht vor.
      </p>

      <h2>Verantwortlich für journalistisch-redaktionelle Inhalte</h2>
      <p>
        Soweit auf {LEGAL.platformName} journalistisch-redaktionelle Inhalte
        erscheinen, ist gemäß § 18 Abs. 2 MStV verantwortlich:
      </p>
      <address>
        {LEGAL.operatorName}
        <br />
        {LEGAL.street}
        <br />
        {LEGAL.postalCode} {LEGAL.city}
      </address>

      <h2>Gegenstand des Angebots</h2>
      <p>
        {LEGAL.platformName} ist ein Online-Marktplatz für gebrauchte Apple-Geräte
        (Mac, iPad, iPhone) in Deutschland. Der Betreiber vermittelt die
        Möglichkeit, Inserate einzustellen und zu durchsuchen. Kaufverträge kommen
        ausschließlich zwischen den jeweiligen Nutzern zustande.{" "}
        {LEGAL.platformName} wird nicht Vertragspartner dieser Geschäfte und tritt
        weder als Verkäufer noch als Käufer auf.
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf
        diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis
        10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen oder
        nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </p>
      <p>
        Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen
        nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine
        diesbezügliche Haftung ist erst ab dem Zeitpunkt der Kenntnis einer
        konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender
        Rechtsverletzungen entfernen wir diese Inhalte unverzüglich.
      </p>

      <h2>Haftung für Inserate und Nutzerinhalte</h2>
      <p>
        Inserate, Angaben zu Geräten, Preisen, Zustand, Standort und Versand
        stammen von den jeweiligen Anbietern. Für Richtigkeit, Vollständigkeit und
        Rechtmäßigkeit dieser Angaben ist der jeweilige Nutzer verantwortlich. Der
        Betreiber prüft Inserate nicht vorab auf Vollständigkeit oder technische
        Richtigkeit.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Unser Angebot kann Links zu externen Websites Dritter enthalten, auf deren
        Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten
        ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Rechtswidrige
        Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Bei
        Bekanntwerden von Rechtsverletzungen werden derartige Links unverzüglich
        entfernt.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die vom Betreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
        dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und
        jede Art der Verwertung außerhalb der Grenzen des Urheberrechts bedürfen
        der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Inserate
        und von Nutzern eingestellte Inhalte verbleiben urheberrechtlich beim
        jeweiligen Nutzer; mit dem Einstellen räumen die Nutzer {LEGAL.platformName}{" "}
        die in den{" "}
        <Link href="/nutzerbedingungen">Nutzerbedingungen</Link> beschriebenen
        Nutzungsrechte ein.
      </p>

      <h2>Online-Streitbeilegung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung (OS) bereit:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr
        </a>
        . Unsere E-Mail-Adresse finden Sie oben im Impressum.
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren
        vor einer Verbraucherschlichtungsstelle im Sinne des
        Verbraucherstreitbeilegungsgesetzes (VSBG) teilzunehmen.
      </p>
    </LegalDocument>
  );
}
