import { LegalDocument } from "@/components/LegalDocument";
import { LEGAL } from "@/lib/legal";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: `Datenschutzerklärung von ${LEGAL.platformName} gemäß Art. 13 und 14 DSGVO.`,
};

export default function DatenschutzPage() {
  return (
    <LegalDocument title="Datenschutzerklärung">
      <p>
        Diese Datenschutzerklärung informiert Sie über die Verarbeitung
        personenbezogener Daten bei der Nutzung von {LEGAL.platformName}. Sie
        gilt für die Website und die darüber angebotenen Marktplatzfunktionen.
      </p>

      <h2>1. Verantwortlicher</h2>
      <address>
        {LEGAL.operatorName}
        <br />
        {LEGAL.street}
        <br />
        {LEGAL.postalCode} {LEGAL.city}
        <br />
        {LEGAL.country}
        <br />
        Telefon: <a href={LEGAL.phoneHref}>{LEGAL.phoneDisplay}</a>
        <br />
        E-Mail: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </address>
      <p>
        Ein Datenschutzbeauftragter ist gesetzlich nicht bestellt, weil die
        gesetzlichen Schwellenwerte hierfür nicht erreicht werden.
      </p>

      <h2>2. Begriffe</h2>
      <p>
        Personenbezogene Daten sind alle Informationen, die sich auf eine
        identifizierte oder identifizierbare natürliche Person beziehen (Art. 4
        Nr. 1 DSGVO). Verarbeitung meint jeden Vorgang im Zusammenhang mit
        solchen Daten, etwa das Erheben, Speichern, Auslesen, Übermitteln oder
        Löschen.
      </p>

      <h2>3. Hosting und Serverprotokolle</h2>
      <p>
        Beim Aufruf der Website verarbeitet der jeweilige Hosting- bzw.
        Auslieferungsserver automatisch technische Zugriffsdaten. Dazu können
        gehören:
      </p>
      <ul>
        <li>IP-Adresse</li>
        <li>Datum und Uhrzeit der Anfrage</li>
        <li>aufgerufene URL, Referrer</li>
        <li>Browsertyp und -version, Betriebssystem</li>
        <li>übertragene Datenmenge und Statuscode</li>
      </ul>
      <p>
        Die Verarbeitung erfolgt zur Bereitstellung und Absicherung des Dienstes
        (Art. 6 Abs. 1 lit. f DSGVO, berechtigtes Interesse an Betrieb,
        Missbrauchs- und Störungsabwehr). Protokolldaten werden in der Regel
        nach wenigen Tagen gelöscht, sofern keine längere Aufbewahrung zur
        Aufklärung von Sicherheitsvorfällen erforderlich ist.
      </p>
      <p>
        Soweit ein externer Hosting-Dienstleister eingesetzt wird, erfolgt die
        Verarbeitung in der Europäischen Union oder in einem Land mit
        angemessenem Datenschutzniveau und auf Grundlage eines Vertrags zur
        Auftragsverarbeitung gemäß Art. 28 DSGVO.
      </p>

      <h2>4. Technisch notwendige Speicherung</h2>
      <p>
        {LEGAL.platformName} verwendet technisch notwendige Speichermechanismen,
        damit der Dienst funktioniert. Dazu zählen:
      </p>
      <ul>
        <li>
          lokal im Browser gespeicherte Inserate (localStorage), damit von Ihnen
          erstellte Angebote auf diesem Gerät erhalten bleiben
        </li>
        <li>
          Sitzungs- oder Sicherheitscookies des Web-Frameworks, soweit der
          Server sie zur Auslieferung der Seite setzt
        </li>
        <li>
          von Ihnen eingegebene Filterangaben (etwa Standort, Preis, Modell) im
          Arbeitsspeicher der aktuellen Sitzung
        </li>
      </ul>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit die Speicherung
        zur Vertragserfüllung bzw. zur Durchführung vorvertraglicher Maßnahmen
        erforderlich ist, im Übrigen Art. 6 Abs. 1 lit. f DSGVO (berechtigtes
        Interesse an einem funktionierenden Angebot) sowie § 25 Abs. 2 TDDDG für
        unbedingt erforderliche Speicherungen auf Ihrem Endgerät.
      </p>
      <p>
        Es werden derzeit keine Analyse-, Werbe- oder Tracking-Cookies gesetzt
        und kein Marketing-Pixel eingesetzt. Eine Einwilligung nach § 25 Abs. 1
        TDDDG ist daher für die genannten notwendigen Speicherungen nicht
        erforderlich.
      </p>

      <h2>5. Standortfilter</h2>
      <p>
        Wenn Sie eine Postleitzahl oder einen Ort sowie einen Umkreis angeben,
        werden diese Angaben verwendet, um Inserate nach Entfernung zu filtern.
        Die Berechnung erfolgt auf Ihrem Gerät anhand der von Ihnen gewählten
        Koordinaten und der im Inserat hinterlegten Ortsangabe. Eine
        durchgehende Standortermittlung über GPS findet nicht statt. Die
        Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b und lit. f
        DSGVO.
      </p>

      <h2>6. Inserate</h2>
      <p>
        Beim Einstellen eines Angebots verarbeiten wir die von Ihnen angegebenen
        strukturierten Daten, insbesondere Gerätekategorie und -modell,
        technische Merkmale, Zustand, Preis, Standort (PLZ/Ort) sowie die
        Versandoption. Freitextbeschreibungen und Nutzerfotos sind nicht
        vorgesehen.
      </p>
      <p>
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Nutzung des
        Marktplatzes). Veröffentlichte Inserate sind für andere Nutzer sichtbar.
        Sie dürfen keine Daten Dritter einstellen, zu deren Veröffentlichung Sie
        nicht berechtigt sind.
      </p>
      <p>
        Inserate bleiben gespeichert, bis Sie sie löschen oder der Betreiber sie
        wegen eines Verstoßes gegen die Nutzungsregeln entfernt. Lokal
        gespeicherte Entwürfe oder Angebote auf Ihrem Gerät können Sie durch
        Löschen der Browserdaten entfernen.
      </p>

      <h2>7. Kontaktaufnahme</h2>
      <p>
        Wenn Sie uns per E-Mail oder Telefon kontaktieren, verarbeiten wir die
        von Ihnen mitgeteilten Daten (Name, Kontaktdaten, Inhalt der Nachricht)
        zur Bearbeitung Ihrer Anfrage. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b
        DSGVO, soweit die Anfrage der Vertragserfüllung dient, andernfalls Art.
        6 Abs. 1 lit. f DSGVO. Die Daten werden gelöscht, wenn die Anfrage
        abschließend erledigt ist und keine gesetzlichen Aufbewahrungspflichten
        entgegenstehen.
      </p>

      <h2>8. Nachrichten, Favoriten, Profil</h2>
      <p>
        Funktionen wie Nachrichten, Favoriten und Profil können personenbezogene
        Daten enthalten, sobald sie aktiv genutzt werden. Solange eine Funktion
        nur als Platzhalter ohne Kontoanmeldung betrieben wird, findet insoweit
        keine zusätzliche serverseitige Profilbildung statt. Sobald ein
        Nutzerkonto angeboten wird, gelten ergänzend die dann ausgewiesenen
        Hinweise; Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.
      </p>

      <h2>9. Empfänger</h2>
      <p>Personenbezogene Daten können erhalten:</p>
      <ul>
        <li>der Verantwortliche und von ihm eingesetzte Erfüllungsgehilfen</li>
        <li>Hosting- und Infrastrukturdienstleister als Auftragsverarbeiter</li>
        <li>
          andere Nutzer, soweit Daten Bestandteil eines öffentlichen Inserats
          sind
        </li>
        <li>
          Behörden, Gerichte oder Rechtsberater, soweit eine gesetzliche Pflicht
          oder die Durchsetzung von Rechten dies erfordert (Art. 6 Abs. 1 lit. c
          oder lit. f DSGVO)
        </li>
      </ul>
      <p>
        Eine Übermittlung zu Werbezwecken an Dritte findet nicht statt. Eine
        Übermittlung in ein Drittland außerhalb der EU/des EWR ist nicht
        beabsichtigt. Sollte sie im Rahmen der technischen Auslieferung
        ausnahmsweise erforderlich werden, erfolgt sie nur bei Vorliegen eines
        Angemessenheitsbeschlusses oder geeigneter Garantien nach Art. 44 ff.
        DSGVO.
      </p>

      <h2>10. Speicherdauer</h2>
      <p>
        Wir speichern personenbezogene Daten nur so lange, wie es für die
        jeweiligen Zwecke erforderlich ist oder gesetzliche Pflichten eine
        längere Aufbewahrung verlangen. Typische Fristen:
      </p>
      <ul>
        <li>Serverprotokolle: wenige Tage, bei Sicherheitsvorfällen länger</li>
        <li>Inserate: bis zur Löschung durch Sie oder den Betreiber</li>
        <li>
          Korrespondenz: bis Abschluss der Anfrage, kaufmännische Unterlagen
          ggf. 6 bzw. 10 Jahre (§ 147 AO, § 257 HGB), soweit einschlägig
        </li>
        <li>
          Daten zur Rechtsverteidigung: bis zum Ablauf einschlägiger
          Verjährungsfristen
        </li>
      </ul>

      <h2>11. Ihre Rechte</h2>
      <p>Sie haben gegenüber dem Verantwortlichen das Recht</p>
      <ul>
        <li>auf Auskunft (Art. 15 DSGVO)</li>
        <li>auf Berichtigung (Art. 16 DSGVO)</li>
        <li>auf Löschung (Art. 17 DSGVO)</li>
        <li>auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>
          auf Widerspruch gegen Verarbeitungen, die auf Art. 6 Abs. 1 lit. e
          oder f DSGVO beruhen (Art. 21 DSGVO)
        </li>
        <li>
          auf Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft
          (Art. 7 Abs. 3 DSGVO)
        </li>
      </ul>
      <p>
        Zur Ausübung genügt eine formlose Mitteilung an{" "}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.
      </p>
      <p>
        Sie haben außerdem das Recht, sich bei einer Aufsichtsbehörde zu
        beschweren (Art. 77 DSGVO). Zuständig ist insbesondere die
        Aufsichtsbehörde Ihres gewöhnlichen Aufenthalts, Ihres Arbeitsplatzes
        oder des Orts des mutmaßlichen Verstoßes. Für den Verantwortlichen mit
        Sitz in Baden-Württemberg ist dies:
      </p>
      <address>
        Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit
        Baden-Württemberg
        <br />
        Lautenschlagerstraße 20
        <br />
        70173 Stuttgart
        <br />
        <a
          href="https://www.baden-wuerttemberg.datenschutz.de"
          target="_blank"
          rel="noopener noreferrer"
        >
          www.baden-wuerttemberg.datenschutz.de
        </a>
      </address>

      <h2>12. Pflicht zur Bereitstellung</h2>
      <p>
        Sie sind gesetzlich nicht verpflichtet, uns personenbezogene Daten
        bereitzustellen. Ohne bestimmte Angaben (etwa Standort eines Inserats
        oder Kontaktweg bei einer Anfrage) können einzelne Funktionen jedoch
        nicht erbracht werden.
      </p>

      <h2>13. Keine automatisierte Entscheidungsfindung</h2>
      <p>
        Es findet keine automatisierte Entscheidungsfindung einschließlich
        Profiling im Sinne von Art. 22 DSGVO statt, die Ihnen gegenüber
        rechtliche Wirkung entfaltet oder Sie in ähnlicher Weise erheblich
        beeinträchtigt.
      </p>

      <h2>14. Minderjährige</h2>
      <p>
        {LEGAL.platformName} richtet sich an volljährige Nutzer. Wir verarbeiten
        wissentlich keine personenbezogenen Daten von Kindern unter 16 Jahren.
        Wird uns eine entsprechende Verarbeitung bekannt, löschen wir die Daten.
      </p>

      <h2>15. Änderungen</h2>
      <p>
        Wir passen diese Erklärung an, wenn sich das Angebot, die
        Verarbeitungen oder die Rechtslage ändern. Es gilt die auf dieser Seite
        veröffentlichte Fassung. Ergänzende Regelungen enthalten die{" "}
        <Link href="/agb">Allgemeinen Geschäftsbedingungen</Link> und die{" "}
        <Link href="/nutzerbedingungen">Nutzerbedingungen</Link>.
      </p>
    </LegalDocument>
  );
}
