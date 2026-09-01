import { LegalDocument } from "@/components/LegalDocument";
import { LEGAL } from "@/lib/legal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description: `Allgemeine Geschäftsbedingungen von ${LEGAL.platformName}.`,
};

export default function AgbPage() {
  return (
    <LegalDocument title="Allgemeine Geschäftsbedingungen">
      <p>
        Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung des
        Marktplatzes {LEGAL.platformName}, betrieben von {LEGAL.operatorName},{" "}
        {LEGAL.street}, {LEGAL.postalCode} {LEGAL.city} (nachfolgend
        „Betreiber“). Abweichende Bedingungen des Nutzers gelten nicht, es sei
        denn, der Betreiber stimmt ihnen ausdrücklich schriftlich zu.
      </p>

      <h2>§ 1 Geltungsbereich und Vertragsgegenstand</h2>
      <p>
        {LEGAL.platformName} ist ein Online-Marktplatz, auf dem Nutzer
        gebrauchte Apple-Geräte der Kategorien Mac, iPad und iPhone inserieren,
        suchen und untereinander erwerben können. Der Betreiber stellt die
        technische Plattform bereit. Er selbst verkauft die inserierten Geräte
        nicht und kauft sie nicht an.
      </p>
      <p>
        Kauf-, Tausch- oder sonstige Verträge über inserierte Geräte kommen
        ausschließlich zwischen dem jeweiligen Anbieter und dem jeweiligen
        Interessenten zustande. Der Betreiber wird nicht Vertragspartner dieser
        Verträge und übernimmt keine Erfüllungs-, Gewährleistungs- oder
        Zahlungspflichten daraus.
      </p>

      <h2>§ 2 Leistungsbeschreibung</h2>
      <p>Der Betreiber ermöglicht insbesondere:</p>
      <ul>
        <li>das Durchsuchen und Filtern öffentlicher Inserate</li>
        <li>
          das Einstellen strukturierter Angebote ohne Freitextbeschreibung und
          ohne Nutzerfotos
        </li>
        <li>die Angabe von Standort, Abholung und Versandoption</li>
      </ul>
      <p>
        Der Betreiber schuldet keine ununterbrochene Verfügbarkeit. Wartung,
        Störungen, höhere Gewalt oder Änderungen können den Zugang
        vorübergehend einschränken. Ein Anspruch auf bestimmte Funktionen,
        Reichweite oder Verkaufserfolg besteht nicht.
      </p>

      <h2>§ 3 Nutzungsvoraussetzungen</h2>
      <p>
        Die Nutzung zum Kaufen und Verkaufen setzt voraus, dass der Nutzer
        volljährig und voll geschäftsfähig ist und seinen Wohnsitz oder Sitz in
        Deutschland hat. Mit der Nutzung erklärt der Nutzer, diese
        Voraussetzungen zu erfüllen.
      </p>
      <p>
        Ergänzend gelten die{" "}
        <Link href="/nutzerbedingungen">Nutzerbedingungen</Link>. Bei
        Widersprüchen gehen diese AGB für das Marktplatzverhältnis vor, die
        Nutzerbedingungen für Verhaltens- und Inhaltsregeln.
      </p>

      <h2>§ 4 Inserate</h2>
      <p>
        Inserate dürfen ausschließlich gebrauchte, legale und dem Katalog
        entsprechende Apple-Geräte (Mac, iPad, iPhone) betreffen. Der Anbieter
        sichert zu, verfügungsberechtigt zu sein und wahrheitsgemäße Angaben zu
        Modell, Ausstattung, Zustand, Preis, Standort und Versand zu machen.
      </p>
      <p>Unzulässig sind insbesondere Inserate über</p>
      <ul>
        <li>Geräte, die nicht dem angebotenen Katalog entsprechen</li>
        <li>gestohlene, gesperrte oder offensichtlich rechtswidrige Ware</li>
        <li>Nachbauten, Fälschungen oder irreführend deklarierte Ware</li>
        <li>Dienstleistungen, Zubehör ohne Gerät oder sonstige branchenfremde Angebote</li>
      </ul>
      <p>
        Der Betreiber kann Inserate ohne Vorankündigung ablehnen, kürzen,
        deaktivieren oder löschen, wenn sie gegen diese AGB, die
        Nutzerbedingungen oder geltendes Recht verstoßen oder den Betrieb der
        Plattform beeinträchtigen.
      </p>

      <h2>§ 5 Vertragsschluss zwischen Nutzern</h2>
      <p>
        Ein Inserat ist eine unverbindliche Aufforderung an andere Nutzer,
        Interesse zu bekunden. Der Vertrag über das Gerät kommt erst zustande,
        wenn sich Anbieter und Interessent über wesentlichen Inhalt
        (insbesondere Gerät, Preis, Übergabe oder Versand) einig sind.
      </p>
      <p>
        Zahlungsart, Übergabeort, Versandweg und Gefahrübergang regeln die
        Nutzer untereinander, soweit nicht zwingendes Recht entgegensteht. Der
        Betreiber stellt derzeit kein Treuhand-, Zahlungs- oder Versandkonto
        bereit.
      </p>

      <h2>§ 6 Preise</h2>
      <p>
        Alle auf {LEGAL.platformName} genannten Preise sind Endpreise in Euro.
        Ob Umsatzsteuer auszuweisen ist, richtet sich nach dem steuerlichen
        Status des jeweiligen Anbieters. Der Betreiber prüft die steuerliche
        Einordnung der Nutzer nicht.
      </p>

      <h2>§ 7 Abholung und Versand</h2>
      <p>
        Anbieter geben an, ob nur Abholung oder Abholung und Versand angeboten
        werden. Kosten, Verpackung, Versanddienstleister und Lieferzeiten
        vereinbaren die Nutzer selbst. Bei Versand trägt der Anbieter die
        Verantwortung für ordnungsgemäße Verpackung, soweit er Unternehmer ist
        und nichts Abweichendes gesetzlich gilt.
      </p>
      <p>
        Standort- und Umkreisfilter dienen nur der Anzeige. Sie begründen keinen
        Anspruch auf Lieferung in einen bestimmten Radius.
      </p>

      <h2>§ 8 Gewährleistung und Garantie</h2>
      <p>
        Für Sach- und Rechtsmängel des Geräts haftet ausschließlich der jeweilige
        Vertragspartner des Kaufvertrags nach den gesetzlichen Vorschriften,
        die für das konkrete Verhältnis gelten (insbesondere Kaufrecht des BGB).
        Beim Verbrauchsgüterkauf bleiben die Rechte des Verbrauchers unberührt.
      </p>
      <p>
        Eine vom Anbieter angegebene Apple-Garantie ist eine Angabe des
        Anbieters. Der Betreiber übernimmt keine Garantie und keine
        Beschaffenheitszusage für inserierte Geräte.
      </p>

      <h2>§ 9 Widerrufsrecht</h2>
      <p>
        Zwischen Privatpersonen (Verbraucher an Verbraucher) besteht in der
        Regel kein gesetzliches Widerrufsrecht. Bietet ein Unternehmer einem
        Verbraucher Waren im Fernabsatz an, hat der Unternehmer dem Verbraucher
        die gesetzlich vorgeschriebene Widerrufsbelehrung selbst zu erteilen
        und das Widerrufsrecht zu beachten.
      </p>
      <p>
        Gegenüber dem Betreiber besteht kein Widerrufsrecht für den Kauf eines
        inserierten Geräts, weil der Betreiber nicht Verkäufer ist. Soweit der
        Betreiber selbst entgeltliche digitale Dienstleistungen an Verbraucher
        erbringt, gelten die gesetzlichen Widerrufsrechte; derzeit ist die
        Nutzung der Plattform unentgeltlich.
      </p>

      <h2>§ 10 Pflichten der Nutzer</h2>
      <p>Nutzer verpflichten sich,</p>
      <ul>
        <li>wahre und vollständige Angaben zu machen</li>
        <li>keine Schadsoftware, Scraping- oder Umgehungsversuche einzusetzen</li>
        <li>andere Nutzer nicht zu belästigen, zu täuschen oder zu bedrohen</li>
        <li>
          den Betreiber unverzüglich zu informieren, wenn Zugangsdaten
          missbraucht wurden, sobald ein Konto angeboten wird
        </li>
      </ul>

      <h2>§ 11 Haftung des Betreibers</h2>
      <p>
        Der Betreiber haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit
        sowie nach dem Produkthaftungsgesetz. Für einfache Fahrlässigkeit
        haftet der Betreiber nur bei Verletzung einer Pflicht, deren Erfüllung
        die Durchführung des Vertrags überhaupt erst ermöglicht und auf deren
        Einhaltung der Nutzer regelmäßig vertrauen darf (Kardinalpflicht), und
        der Höhe nach begrenzt auf den vorhersehbaren, vertragstypischen
        Schaden.
      </p>
      <p>
        Die vorstehenden Beschränkungen gelten nicht bei Verletzung von Leben,
        Körper oder Gesundheit und nicht, soweit der Betreiber eine Garantie
        übernommen hat.
      </p>
      <p>
        Für Inhalte, Zusagen, Zahlungen und Lieferungen der Nutzer haftet der
        Betreiber nicht, soweit nicht eine gesetzliche Pflicht zur Entfernung
        nach Kenntnis einer konkreten Rechtsverletzung besteht.
      </p>

      <h2>§ 12 Freistellung</h2>
      <p>
        Der Nutzer stellt den Betreiber von Ansprüchen Dritter frei, die auf
        einer schuldhaften Verletzung dieser AGB, der Nutzerbedingungen oder
        geltenden Rechts durch den Nutzer beruhen, einschließlich angemessener
        Rechtsverteidigungskosten.
      </p>

      <h2>§ 13 Sperrung und Kündigung</h2>
      <p>
        Der Betreiber kann die Nutzung vorübergehend oder dauerhaft
        einschränken, wenn konkrete Anhaltspunkte für einen erheblichen Verstoß
        vorliegen. Der Nutzer kann die Nutzung jederzeit einstellen und eigene
        Inserate entfernen. Gesetzliche Kündigungsrechte bleiben unberührt.
      </p>

      <h2>§ 14 Änderungen der AGB</h2>
      <p>
        Der Betreiber kann diese AGB ändern, wenn neue Funktionen, gesetzliche
        Vorgaben oder Störungen des Äquivalenzverhältnisses dies erfordern.
        Über wesentliche Änderungen wird auf der Website hingewiesen. Setzt der
        Nutzer den Dienst nach Inkrafttreten fort, gelten die neuen AGB, soweit
        nicht zwingendes Verbraucherrecht eine ausdrückliche Zustimmung
        verlangt. Das Recht, der Änderung zu widersprechen und die Nutzung
        einzustellen, bleibt unberührt.
      </p>

      <h2>§ 15 Schlussbestimmungen</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
        UN-Kaufrechts. Zwingende Verbraucherschutzvorschriften des Staates, in
        dem ein Verbraucher seinen gewöhnlichen Aufenthalt hat, bleiben
        unberührt.
      </p>
      <p>
        Ist der Nutzer Kaufmann, juristische Person des öffentlichen Rechts
        oder öffentlich-rechtliches Sondervermögen, ist Gerichtsstand{" "}
        {LEGAL.city}. Im Übrigen gelten die gesetzlichen Gerichtsstände.
      </p>
      <p>
        Sollte eine Bestimmung unwirksam sein, bleibt die Wirksamkeit der
        übrigen Bestimmungen unberührt.
      </p>

      <h2>§ 16 Streitbeilegung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung bereit:{" "}
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://ec.europa.eu/consumers/odr
        </a>
        .
      </p>
      <p>
        Der Betreiber ist nicht verpflichtet und nicht bereit, an einem
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen.
      </p>
      <p>
        Anbieter der Plattform: {LEGAL.operatorName}, erreichbar unter{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Weitere Angaben
        enthält das <Link href="/impressum">Impressum</Link>. Hinweise zur
        Datenverarbeitung enthält die{" "}
        <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>
    </LegalDocument>
  );
}
