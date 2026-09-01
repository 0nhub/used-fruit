"use client";

import { EmojiPicker } from "@/components/EmojiPicker";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { SiteHeader } from "@/components/SiteHeader";
import { UnsavedGuard } from "@/components/UnsavedGuard";
import { RADIUS_OPTIONS } from "@/data/catalog";
import { formatPlaceLabel } from "@/data/locations";
import { requestMessagePermission } from "@/lib/notify";
import { extractAvatarEmoji } from "@/lib/profile";
import { useListings } from "@/lib/useListings";
import { useProfile } from "@/lib/useProfile";
import { useUserLocation } from "@/lib/useUserLocation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const fieldClass =
  "mt-1.5 h-10 w-full rounded-xl border border-uf-border bg-white px-3 text-[14px] outline-none";

export default function ProfilPage() {
  const router = useRouter();
  const { profile, signedIn, ready, saveProfile, login, deleteAccount } = useProfile();
  const { location, setLocation } = useUserLocation();
  const { renameSeller } = useListings();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(profile.emoji);
  const [formReady, setFormReady] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [notifyHint, setNotifyHint] = useState("");

  useEffect(() => {
    if (!ready) return;
    setName(profile.name);
    setEmoji(profile.emoji);
    setFormReady(true);
  }, [ready, profile.name, profile.emoji]);

  const dirty =
    formReady &&
    signedIn &&
    (name.trim() !== profile.name.trim() || emoji !== profile.emoji);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-uf-text-secondary">
        Laden…
      </div>
    );
  }

  if (!signedIn) {
    return (
      <Shell>
        <h1 className="text-[28px] font-semibold tracking-tight text-uf-text">
          Konto
        </h1>
        <p className="mt-3 text-[14px] text-uf-text-secondary">
          Melde dich an, um Namen, Standort und Konto zu verwalten.
        </p>
        <button
          type="button"
          onClick={login}
          className="mt-6 h-10 rounded-full bg-uf-text px-5 text-[14px] text-white"
        >
          Anmelden
        </button>
      </Shell>
    );
  }

  return (
    <UnsavedGuard dirty={dirty}>
      <Shell>
        <h1 className="text-[28px] font-semibold tracking-tight text-uf-text">
          Konto
        </h1>
        <p className="mt-2 text-[14px] text-uf-text-secondary">
          Tippe auf den Kreis, um das Emoji zu ändern. Name erscheint bei deinen
          Inseraten.
        </p>

        <form
          className="mt-8 space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            const nextEmoji = extractAvatarEmoji(emoji);
            if (!nextEmoji) return;
            const next = {
              ...profile,
              name: name.trim(),
              emoji: nextEmoji,
            };
            setEmoji(nextEmoji);
            saveProfile(next);
            if (next.name) renameSeller(next.name, nextEmoji);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 1800);
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                type="button"
                aria-label="Avatar ändern"
                aria-haspopup="dialog"
                aria-expanded={pickerOpen}
                onClick={() => setPickerOpen((v) => !v)}
                className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-uf-bg-subtle ring-offset-2 hover:ring-2 hover:ring-uf-border"
              >
                <span className="text-[52px] leading-none">{emoji}</span>
              </button>
              <EmojiPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onPick={(next) => {
                  setEmoji(next);
                  setSaved(false);
                }}
              />
            </div>
            <div>
              <p className="text-[15px] font-medium text-uf-text">
                {name.trim() || "Noch kein Name"}
              </p>
              <p className="text-[13px] text-uf-text-tertiary">Emoji antippen zum Ändern</p>
            </div>
          </div>

          <div>
            <label className="text-[12px] tracking-wide text-uf-text-secondary uppercase" htmlFor="uf-name">
              Name
            </label>
            <input
              id="uf-name"
              className={fieldClass}
              value={name}
              maxLength={40}
              autoComplete="nickname"
              placeholder="Dein Name"
              onChange={(e) => {
                setName(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <div>
            <p className="text-[12px] tracking-wide text-uf-text-secondary uppercase">
              Ortschaft
            </p>
            <p className="mt-1 text-[13px] text-uf-text-tertiary">
              Wird beim nächsten Besuch als Standortfilter übernommen.
            </p>
            <LocationAutocomplete
              className="mt-1.5"
              value={location.query}
              onChange={(query) =>
                setLocation({
                  ...location,
                  query,
                  city: undefined,
                  postalCode: undefined,
                  place: undefined,
                })
              }
              onSelect={(place) =>
                setLocation({
                  query: formatPlaceLabel(place),
                  city: place.city,
                  postalCode: place.postalCode,
                  radiusKm: location.radiusKm,
                  place,
                })
              }
              inputClassName={fieldClass.replace("mt-1.5 ", "")}
              placeholder="z. B. Stuttgart"
            />
            <label className="mt-4 block text-[12px] tracking-wide text-uf-text-secondary uppercase">
              Umkreis (optional)
            </label>
            <select
              value={location.radiusKm ?? ""}
              onChange={(e) =>
                setLocation({
                  ...location,
                  radiusKm: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="uf-select mt-1.5 h-10 w-[5.25rem] rounded-xl border border-uf-border bg-white pl-3 text-[14px] outline-none"
            >
              <option value="">Keine</option>
              {RADIUS_OPTIONS.map((km) => (
                <option key={km} value={km}>
                  {km} km
                </option>
              ))}
            </select>
          </div>

          {(dirty || saved) && (
            <div className="flex items-center gap-3">
              {dirty && (
                <button
                  type="submit"
                  title="Änderungen speichern"
                  className="h-10 rounded-full bg-uf-text px-5 text-[14px] text-white transition-colors duration-150 hover:bg-[#424245]"
                >
                  Speichern
                </button>
              )}
              {saved && (
                <span className="text-[13px] text-uf-text-secondary">Gespeichert</span>
              )}
            </div>
          )}
        </form>

        <section className="mt-14 border-t border-uf-border-soft pt-8">
          <h2 className="text-[17px] font-semibold text-uf-text">Benachrichtigungen</h2>
          <p className="mt-2 text-[14px] text-uf-text-secondary">
            Stelle ein, wann du von neuen Nachrichten erfährst.
          </p>
          <button
            type="button"
            role="switch"
            aria-checked={profile.notifyOnMessage}
            onClick={async () => {
              const nextOn = !profile.notifyOnMessage;
              if (nextOn) {
                const allowed = await requestMessagePermission();
                saveProfile({ ...profile, notifyOnMessage: allowed });
                setNotifyHint(
                  allowed
                    ? "Du wirst sofort benachrichtigt."
                    : "Der Browser hat Hinweise blockiert. Bitte in den Systemeinstellungen erlauben.",
                );
              } else {
                saveProfile({ ...profile, notifyOnMessage: false });
                setNotifyHint("");
              }
            }}
            className="mt-5 flex w-full items-center justify-between gap-4 rounded-2xl border border-uf-border-soft px-4 py-3 text-left"
          >
            <span>
              <span className="block text-[14px] text-uf-text">
                Benachrichtige mich, sobald ich eine Nachricht habe
              </span>
              <span className="mt-0.5 block text-[12px] text-uf-text-tertiary">
                Sofort, auch wenn Used Fruit gerade im Hintergrund ist
              </span>
            </span>
            <span
              className={`relative h-7 w-11 shrink-0 rounded-full transition-colors ${
                profile.notifyOnMessage ? "bg-uf-text" : "bg-[#d2d2d7]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-[left] ${
                  profile.notifyOnMessage ? "left-[18px]" : "left-0.5"
                }`}
              />
            </span>
          </button>
          {notifyHint && (
            <p className="mt-2 text-[13px] text-uf-text-secondary">{notifyHint}</p>
          )}
        </section>

        <section className="mt-14 border-t border-uf-border-soft pt-8">
          <h2 className="text-[17px] font-semibold text-uf-text">Konto auflösen</h2>
          <p className="mt-2 text-[14px] text-uf-text-secondary">
            Damit löschst du dein Konto und alle zugehörigen Daten sofort und
            unwiderruflich: Profil, Avatar, Name und deine Inserate. Die Plattform
            kannst du danach nicht mehr mit diesem Konto nutzen.
          </p>
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              title="Konto unwiderruflich löschen"
              className="mt-4 h-10 rounded-full border border-[#d80000] px-5 text-[14px] text-[#d80000] transition-colors duration-150 hover:bg-[#d80000] hover:text-white"
            >
              Konto löschen
            </button>
          ) : (
            <div className="mt-4 rounded-2xl bg-uf-bg-subtle px-4 py-4">
              <p className="text-[14px] text-uf-text">
                Wirklich jetzt alles löschen? Das kann nicht rückgängig gemacht werden.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    deleteAccount();
                    router.replace("/");
                  }}
                  className="h-10 rounded-full bg-[#d80000] px-5 text-[14px] text-white transition-colors duration-150 hover:bg-[#b40000]"
                >
                  Jetzt unwiderruflich löschen
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="h-10 rounded-full px-4 text-[14px] text-uf-text-secondary hover:text-uf-text"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </section>
      </Shell>
    </UnsavedGuard>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main className="mx-auto max-w-[680px] px-4 py-10 md:py-14">{children}</main>
    </div>
  );
}
