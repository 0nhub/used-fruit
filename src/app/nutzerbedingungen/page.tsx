import { LegalDocument } from "@/components/LegalDocument";
import { LEGAL } from "@/lib/legal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nutzerbedingungen",
  description: `Nutzerbedingungen für die Nutzung von ${LEGAL.platformName}.`,
};

export default function NutzerbedingungenPage() {
  return (
    <LegalDocument title="Nutzerbedingungen">
      <p>
        Diese Nutzerbedingungen regeln das erlaubte Verhalten auf{" "}
        {LEGAL.platformName}. Sie gelten ergänzend zu den{" "}
        <Link href="/agb">Allgemeinen Geschäftsbedingungen</Link> und der{" "}
        <Link href="/datenschutz">Datenschutzerklärung</Link>. Mit der Nutzung
        der Plattform akzeptieren Sie diese Regeln.
      </p>

      <h2>1. Geltung</h2>
      <p>
        Die Bedingungen gelten für alle Besucher und für alle, die Inserate
        einstellen, durchsuchen oder mit anderen Nutzern in Kontakt treten.
        Betreiber ist {LEGAL.operatorName}, {LEGAL.street}, {LEGAL.postalCode}{" "}
        {LEGAL.city}.
      </p>

      <h2>2. Mindestalter und Verantwortung</h2>
      <p>
        Die Nutzung zum Inserieren und zum Vertragsschluss ist nur volljährigen
        Personen gestattet. Eltern und gesetzliche Vertreter haften für die
        Nutzung durch Minderjährige nach den gesetzlichen Vorschriften.
      </p>
      <p>
        Sie handeln in eigenem Namen. Das Einstellen von Angeboten für Dritte
        ist nur zulässig, wenn Sie dazu berechtigt sind und dies nicht
        verschleiern.
      </p>

      <h2>3. Erlaubte Nutzung</h2>
      <p>Sie dürfen {LEGAL.platformName} nur nutzen, um</p>
      <ul>
        <li>rechtmäßig erworbene gebrauchte Apple-Geräte aus dem Katalog zu inserieren</li>
        <li>Angebote ernsthaft zu suchen und zu vergleichen</li>
        <li>Übergabe oder Versand mit dem jeweiligen Vertragspartner zu vereinbaren</li>
      </ul>
      <p>
        Automatisiertes Auslesen, das Überlasten der Systeme, das Umgehen
        technischer Schutzmaßnahmen und das Vortäuschen falscher Identitäten
        sind untersagt.
      </p>

      <h2>4. Inhaltliche Vorgaben für Inserate</h2>
      <p>
        Inserate sind strukturiert. Es gibt keine Freitextbeschreibung und keine
        Nutzerfotos. Sie dürfen die vorgesehenen Felder nicht missbrauchen, um
        Werbung, Links, Kontaktspam oder irreführende Angaben unterzubringen.
      </p>
      <p>Unzulässig sind insbesondere</p>
      <ul>
        <li>falsche Angaben zu Modell, Speicher, Zustand, Batterie oder Garantie</li>
        <li>Preise, die nicht dem tatsächlich verlangten Betrag entsprechen</li>
        <li>Standorte, die nicht dem tatsächlichen Abholort entsprechen</li>
        <li>
          Geräte mit iCloud-Sperre, Diebstahlverdacht oder unklarer Herkunft
        </li>
        <li>Beleidigungen, Diskriminierung, Gewaltandrohung</li>
        <li>Inhalte, die Rechte Dritter, insbesondere Urheber- und Markenrechte, verletzen</li>
      </ul>

      <h2>5. Kommunikation</h2>
      <p>
        Sobald Nachrichten oder sonstige Kontaktwege angeboten werden, gilt:
        Kommunikation dient ausschließlich der Anbahnung oder Abwicklung eines
        Gerätekaufs. Werbung, Phishing, Kettennachrichten und das Abgreifen
        von Daten anderer Nutzer sind verboten.
      </p>
      <p>
        Der Betreiber kann Kommunikation einsehen, soweit dies zur
        Missbrauchsaufklärung, zur Erfüllung gesetzlicher Pflichten oder zur
        Durchsetzung dieser Bedingungen erforderlich ist.
      </p>

      <h2>6. Rechte an Inhalten</h2>
      <p>
        Sie behalten alle Rechte an Ihren Angaben. Mit dem Einstellen räumen
        Sie dem Betreiber ein einfaches, räumlich unbeschränktes, auf die Dauer
        der Veröffentlichung befristetes Recht ein, die Inseratsdaten auf der
        Plattform zu hosten, anzuzeigen, zu filtern, zu vervielfältigen und für
        die Funktionsfähigkeit des Marktplatzes technisch zu bearbeiten.
      </p>
      <p>
        Marken und Produktbezeichnungen von Apple dienen ausschließlich der
        Beschreibung der angebotenen Gebrauchtgeräte. {LEGAL.platformName} steht
        in keiner Verbindung zu Apple Inc. Apple ist nicht Herausgeber dieses
        Angebots.
      </p>

      <h2>7. Melden von Verstößen</h2>
      <p>
        Hinweise auf rechtswidrige Inhalte richten Sie an{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Bitte nennen Sie
        die betroffene Seite oder das Inserat und beschreiben Sie den Verstoß.
        Der Betreiber prüft hinreichend bestimmte Hinweise und entfernt Inhalte
        bei festgestellter Rechtsverletzung.
      </p>

      <h2>8. Maßnahmen bei Verstößen</h2>
      <p>Bei einem Verstoß kann der Betreiber insbesondere</p>
      <ul>
        <li>Inserate löschen oder unsichtbar schalten</li>
        <li>Funktionen einschränken</li>
        <li>Nutzer vorübergehend oder dauerhaft ausschließen</li>
        <li>Strafverfolgungs- oder Aufsichtsbehörden informieren, soweit geboten</li>
      </ul>
      <p>
        Die Wahl der Maßnahme richtet sich nach Schwere, Wiederholung und
        Gefahr für andere Nutzer. Gesetzliche Ansprüche bleiben unberührt.
      </p>

      <h2>9. Keine Beratung, keine Prüfung</h2>
      <p>
        {LEGAL.platformName} prüft Geräte nicht physisch und gibt keine
        Kaufberatung im Einzelfall. Angezeigte Entfernungen, Filter und
        Sortierungen sind Hilfen zur Darstellung. Sie ersetzen nicht Ihre
        eigene Prüfung von Gerät, Verkäufer und Übergabe.
      </p>

      <h2>10. Änderungen und Geltung</h2>
      <p>
        Der Betreiber kann diese Nutzerbedingungen aktualisieren, wenn sich
        Funktionen oder gesetzliche Anforderungen ändern. Die jeweils auf
        dieser Seite veröffentlichte Fassung gilt ab dem angegebenen Stand. Die
        fortgesetzte Nutzung nach Veröffentlichung gilt als Annahme, soweit
        nicht zwingendes Recht entgegensteht.
      </p>
      <p>
        Es gilt deutsches Recht. Anbieterkennzeichnung und Kontaktdaten
        enthält das <Link href="/impressum">Impressum</Link>.
      </p>
    </LegalDocument>
  );
}
