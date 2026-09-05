"use client";

import { useState } from "react";
import { OverlayDialog } from "@/components/OverlayDialog";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { formatPlaceLabel } from "@/data/locations";
import { useProfile } from "@/lib/useProfile";
import { currentIdentity } from "@/lib/authClient";
import { readProfile, PROFILE_EVENT, type UserProfile } from "@/lib/profile";

const onboardingKey = "used-fruit-onboarding";
const avatars = ["🍏", "🍎", "🍊", "🍋", "🍒", "🥝", "🌸", "🌻", "🐱", "🐶", "🦊", "🐼"];

export function WelcomeProfile() {
  const { profile, signedIn, ready, saveProfile } = useProfile();
  if (!ready || !signedIn || localStorage.getItem(onboardingKey) !== "pending") return null;
  return <WelcomeForm key={currentIdentity()?.id} profile={profile} onSave={saveProfile} />;
}

function WelcomeForm({ profile, onSave }: { profile: UserProfile; onSave: (profile: UserProfile) => void }) {
  const [draft, setDraft] = useState(profile);
  const [error, setError] = useState("");
  const finish = () => {
    localStorage.setItem(onboardingKey, "done");
    window.dispatchEvent(new Event(PROFILE_EVENT));
  };
  return <OverlayDialog titleId="welcome-title" onClose={finish}>
    <h2 id="welcome-title" className="pr-6 text-[28px] font-semibold tracking-tight">Willkommen bei Used Fruit</h2>
    <p className="mt-3 text-[15px] leading-relaxed text-uf-text-secondary">Mach dein Profil zu deinem. Du kannst alles später in deinem Profil ändern.</p>
    <form className="mt-6 space-y-5" onSubmit={(event) => {
      event.preventDefault();
      if (!draft.name.trim()) { setError("Bitte gib einen Namen ein."); return; }
      if (draft.locationQuery.trim() && !draft.city) { setError("Wähle einen Ort aus den Vorschlägen oder lasse den Standort leer."); return; }
      if (!currentIdentity()) return;
      localStorage.setItem(onboardingKey, "done");
      onSave({ ...readProfile(), name: draft.name, emoji: draft.emoji, city: draft.city, postalCode: draft.postalCode, locationQuery: draft.locationQuery });
    }}>
      <label className="block text-[14px] font-medium">Dein Name
        <input value={draft.name} maxLength={40} required autoComplete="nickname" onChange={event => setDraft({ ...draft, name: event.target.value })}
          className="mt-2 h-11 w-full rounded-xl border border-uf-border bg-uf-bg-subtle px-3 text-[16px]" />
      </label>
      <fieldset>
        <legend className="text-[14px] font-medium">Dein Profil-Icon</legend>
        <div className="mt-2 grid grid-cols-6 gap-2">
          {Array.from(new Set([draft.emoji, ...avatars])).map(emoji => <button key={emoji} type="button" aria-label={`Profil-Icon ${emoji}`} aria-pressed={draft.emoji === emoji}
            onClick={() => setDraft({ ...draft, emoji })}
            className={`flex h-11 cursor-pointer items-center justify-center rounded-xl text-[26px] transition-colors hover:bg-uf-bg-subtle ${draft.emoji === emoji ? "bg-uf-bg-subtle ring-2 ring-uf-link" : ""}`}>{emoji}</button>)}
        </div>
      </fieldset>
      <div>
        <label htmlFor="welcome-location" className="text-[14px] font-medium">Standort <span className="font-normal text-uf-text-secondary">(optional)</span></label>
        <LocationAutocomplete id="welcome-location" className="mt-2" value={draft.locationQuery}
          onChange={locationQuery => setDraft({ ...draft, locationQuery, city: "", postalCode: "" })}
          onSelect={place => setDraft({ ...draft, city: place.city, postalCode: place.postalCode, locationQuery: formatPlaceLabel(place) })}
          inputClassName="h-11 w-full rounded-xl border border-uf-border bg-uf-bg-subtle px-3 text-[16px]" />
      </div>
      {error && <p role="alert" className="text-[14px] text-uf-text">{error}</p>}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button type="button" onClick={finish} className="cursor-pointer text-[14px] text-uf-link hover:underline">Später</button>
        <button type="submit" className="h-11 cursor-pointer rounded-full bg-uf-action px-6 text-[14px] font-medium text-white hover:bg-uf-link">Speichern</button>
      </div>
    </form>
  </OverlayDialog>;
}
