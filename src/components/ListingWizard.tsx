"use client";

import { DateField } from "@/components/DateField";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { SiteHeader } from "@/components/SiteHeader";
import { BindTryLeave, UnsavedGuard } from "@/components/UnsavedGuard";
import {
  CATEGORIES,
  CONDITIONS,
  IPAD_CONNECTIVITY,
  getModelsByCategory,
  getModelById,
  sortModelsByAge,
} from "@/data/catalog";
import { formatPlaceLabel } from "@/data/locations";
import { chipsForModel, currentChipsForModel, optionsForSelection, yearsForChip } from "@/data/modelYears";
import { getBatteryMetricForModel } from "@/lib/device";
import { SIM_LOCK_OPTIONS, needsSimLock, isSimLockStatus } from "@/lib/simLock";
import { DESKTOP_ACCESSORIES, acceptsDesktopAccessories, hasValidDesktopAccessories, needsKeyboardLayout } from "@/lib/accessories";
import { KEYBOARD_LAYOUTS, hasValidKeyboard } from "@/lib/keyboard";
import { buildListingTitle, createId } from "@/lib/format";
import {
  clearListingDraft,
  readListingDraft,
  writeListingDraft,
  type ListingDraft,
} from "@/lib/listingDraft";
import {
  BATTERY_GUIDES,
  buildWizardSteps,
  soleSpecValues,
  STEP_COPY,
} from "@/lib/listingWizard";
import { appleLoginHref } from "@/lib/appleLogin";
import {
  LISTING_PHOTO_LIMIT,
  clearListingPhotoFiles,
  listingPhotoUrl,
  readListingPhotoFiles,
  saveListingPhotoFiles,
  uploadListingPhoto,
} from "@/lib/listingPhotos";
import { formatPrice } from "@/lib/format";
import {
  PRICE_ADJUSTMENT_PRESETS,
  formatPriceAdjustment,
  listingDisplayPrice,
  parsePriceAdjustment,
  priceAdjustmentError,
} from "@/lib/priceAdjustment";
import { useListings } from "@/lib/useListings";
import { useProfile } from "@/lib/useProfile";
import type { CategoryId, ConditionId, DesktopAccessoryId, IpadConnectivity, KeyboardLayoutId, PriceAdjustment, ShippingScope, SimLockStatus } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";

function swatchNeedsOutline(hex: string): boolean {
  const raw = hex.replace("#", "");
  if (raw.length !== 6) return true;
  const r = Number.parseInt(raw.slice(0, 2), 16);
  const g = Number.parseInt(raw.slice(2, 4), 16);
  const b = Number.parseInt(raw.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 210;
}

function OptionRow({
  label,
  detail,
  swatch,
  selected,
  onSelect,
}: {
  label: string;
  detail?: string;
  swatch?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full gap-3 rounded-2xl border px-4 py-3.5 text-left text-[15px] transition ${
        detail ? "items-start" : "items-center"
      } ${
        selected
          ? "border-uf-text bg-uf-bg-subtle"
          : "border-uf-border hover:border-uf-text-tertiary"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          detail ? "mt-0.5" : ""
        } ${selected ? "border-uf-text" : "border-uf-border"}`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-uf-text" />}
      </span>
      {swatch ? (
        <span
          className={`h-7 w-7 shrink-0 rounded-full ${
            swatchNeedsOutline(swatch)
              ? "ring-1 ring-inset ring-black/20"
              : "ring-1 ring-inset ring-black/10"
          }`}
          style={{ backgroundColor: swatch }}
          aria-hidden
        />
      ) : null}
      <span className="min-w-0">
        <span className="block">{label}</span>
        {detail ? (
          <span className="mt-1 block text-[13px] leading-snug text-uf-text-secondary">
            {detail}
          </span>
        ) : null}
      </span>
    </button>
  );
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-uf-border bg-white px-3 py-2.5 text-[14px] outline-none";

type DraftPhoto = { key: string; preview: string; file?: File; id?: string };

function wizardPriceAdjustment(
  startPrice: number,
  enabled: boolean,
  amount: string,
  count: string,
  unit: "days" | "weeks",
  floor: string,
): PriceAdjustment | undefined {
  if (!enabled) return undefined;
  const everyDays = Number(count.replace(",", ".")) * (unit === "weeks" ? 7 : 1);
  const adjustment = parsePriceAdjustment({
    amount: Number(amount.replace(",", ".")),
    everyDays,
    floor: floor.trim() ? Number(floor.replace(",", ".")) : undefined,
  });
  if (!adjustment || priceAdjustmentError(adjustment, startPrice)) return undefined;
  return adjustment;
}

export function ListingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addListing } = useListings();
  const { profile, signedIn, onboardingCompleted, ready: profileReady } = useProfile();
  const publicationId = useRef<string | null>(null);
  const restoredDraft = useRef(false);
  const [leavingForLogin, setLeavingForLogin] = useState(false);

  const [stepIndex, setStepIndex] = useState(0);
  const [categoryId, setCategoryId] = useState<CategoryId | undefined>("iphone");
  const [modelId, setModelId] = useState("");
  const [showAllModels, setShowAllModels] = useState(false);
  const [showAllChips, setShowAllChips] = useState(false);
  const [modelQuery, setModelQuery] = useState("");
  const [colorId, setColorId] = useState("");
  const [chip, setChip] = useState("");
  const [size, setSize] = useState("");
  const [year, setYear] = useState<number | undefined>();
  const [memory, setMemory] = useState("");
  const [storage, setStorage] = useState("");
  const [simLock, setSimLock] = useState<SimLockStatus | undefined>();
  const [connectivity, setConnectivity] = useState<IpadConnectivity | undefined>();
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayoutId | undefined>();
  const [keyboardLayoutDetails, setKeyboardLayoutDetails] = useState("");
  const [includedAccessories, setIncludedAccessories] = useState<DesktopAccessoryId[] | undefined>();
  const [condition, setCondition] = useState<ConditionId | undefined>();
  const [originalBox, setOriginalBox] = useState<boolean | undefined>();
  const [hasAppleWarranty, setHasAppleWarranty] = useState(false);
  const [warrantyUntil, setWarrantyUntil] = useState("");
  const [batteryCapacity, setBatteryCapacity] = useState("");
  const [batteryCycles, setBatteryCycles] = useState("");
  const [price, setPrice] = useState("");
  const [priceAdjust, setPriceAdjust] = useState(false);
  const [dropAmount, setDropAmount] = useState("10");
  const [intervalCount, setIntervalCount] = useState("1");
  const [intervalUnit, setIntervalUnit] = useState<"days" | "weeks">("weeks");
  const [floorPrice, setFloorPrice] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [locality, setLocality] = useState("");
  const [street, setStreet] = useState("");
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [shippingScope, setShippingScope] = useState<ShippingScope | undefined>();
  const [photos, setPhotos] = useState<DraftPhoto[]>([]);
  const [photosReady, setPhotosReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const leaveRef = useRef<(go: () => void) => void>((go) => go());
  const photosRef = useRef<DraftPhoto[]>([]);
  photosRef.current = photos;

  const model = modelId ? getModelById(modelId) : undefined;
  const models = useMemo(() => sortModelsByAge(categoryId
    ? getModelsByCategory(categoryId).filter((item) => !item.disabled)
    : []), [categoryId]);
  const currentModels = useMemo(() => models.filter((item) => item.featured), [models]);
  const visibleModels = useMemo(() => {
    const base = showAllModels || currentModels.length === 0 ? models : currentModels;
    const query = showAllModels ? modelQuery.trim().toLowerCase() : "";
    if (!query) return base;
    return base.filter((item) => item.name.toLowerCase().includes(query));
  }, [models, currentModels, showAllModels, modelQuery]);
  const batteryMetric = getBatteryMetricForModel(modelId);
  const steps = useMemo(
    () => buildWizardSteps(modelId || undefined, year, chip, connectivity, includedAccessories, size || undefined, storage || undefined),
    [modelId, year, chip, connectivity, includedAccessories, size, storage],
  );
  const step = steps[Math.min(stepIndex, steps.length - 1)];
  const copy = STEP_COPY[step];
  const resolvedYear = year ?? (model?.years?.length === 1 ? model.years[0] : undefined);
  const yearOptions = optionsForSelection(model, resolvedYear, chip || undefined, size || undefined);
  const memoryOptions = optionsForSelection(model, resolvedYear, chip || undefined, size || undefined, storage || undefined);
  const chipChoices = useMemo(() => chipsForModel(model), [model]);
  const currentChipChoices = useMemo(() => currentChipsForModel(model), [model]);
  const visibleChips = !currentChipChoices || showAllChips ? chipChoices : currentChipChoices;
  const yearChoices = useMemo(() => [...yearsForChip(model, chip || undefined)].sort((a, b) => b - a), [model, chip]);

  useEffect(() => {
    if (!profileReady || restoredDraft.current) return;
    restoredDraft.current = true;
    const draft = readListingDraft();
    if (draft && getModelById(draft.modelId)) {
    setCategoryId(draft.categoryId); setModelId(draft.modelId); setChip(draft.chip ?? "");
    setColorId(draft.colorId); setSize(draft.size ?? ""); setYear(draft.year);
    setMemory(draft.memory ?? ""); setStorage(draft.storage ?? "");
    setConnectivity(draft.connectivity); setSimLock(draft.simLock);
    setKeyboardLayout(draft.keyboardLayout); setKeyboardLayoutDetails(draft.keyboardLayoutDetails ?? "");
    setIncludedAccessories(Array.isArray(draft.includedAccessories) ? draft.includedAccessories : undefined);
    setCondition(draft.condition); setOriginalBox(draft.originalBox);
    setHasAppleWarranty(Boolean(draft.appleWarrantyUntil)); setWarrantyUntil(draft.appleWarrantyUntil ?? "");
    setBatteryCapacity(draft.batteryMaxCapacityPercent == null ? "" : String(draft.batteryMaxCapacityPercent));
    setBatteryCycles(draft.batteryCycleCount == null ? "" : String(draft.batteryCycleCount));
    setPrice(String(draft.price));
    if (draft.priceAdjustment) {
      setPriceAdjust(true);
      setDropAmount(String(draft.priceAdjustment.amount));
      if (draft.priceAdjustment.everyDays % 7 === 0) {
        setIntervalCount(String(draft.priceAdjustment.everyDays / 7));
        setIntervalUnit("weeks");
      } else {
        setIntervalCount(String(draft.priceAdjustment.everyDays));
        setIntervalUnit("days");
      }
      setFloorPrice(draft.priceAdjustment.floor != null ? String(draft.priceAdjustment.floor) : "");
    }
    setCity(draft.city); setPostalCode(draft.postalCode);
    setLocationQuery(draft.postalCode + " " + draft.city);
    setLocality(draft.locality ?? (draft.city ? "Mitte" : ""));
    setStreet(draft.street ?? "");
    setShowFullAddress(Boolean(draft.street?.trim()));
    setShippingScope(draft.shippingScope);
    setStepIndex(buildWizardSteps(draft.modelId, draft.year, draft.chip, draft.connectivity, draft.includedAccessories, draft.size, draft.storage).length - 1);
    if (draft.modelId && !getModelById(draft.modelId)?.featured) setShowAllModels(true);
    }
    void readListingPhotoFiles()
      .then((files) => {
        const saved = (draft?.photoIds ?? []).filter((id): id is string => typeof id === "string").map((id) => ({
          key: id,
          id,
          preview: listingPhotoUrl(id),
        }));
        const pending = files.map((file) => ({
          key: crypto.randomUUID(),
          file,
          preview: URL.createObjectURL(file),
        }));
        setPhotos([...saved, ...pending].slice(0, LISTING_PHOTO_LIMIT));
      })
      .finally(() => setPhotosReady(true));
  }, [profileReady]);

  useEffect(() => {
    if (!photosReady) return;
    void saveListingPhotoFiles(photos.flatMap((photo) => (photo.file ? [photo.file] : [])));
  }, [photos, photosReady]);

  useEffect(() => {
    const sole = soleSpecValues(model);
    if (sole.year != null) setYear(sole.year);
    if (sole.chip) setChip(sole.chip);
  }, [model]);

  useEffect(() => {
    if (!model) return;
    const options = optionsForSelection(model, year, chip || undefined, size || undefined);
    const narrowed = optionsForSelection(model, year, chip || undefined, size || undefined, storage || undefined);
    if (chip && year != null && options.chips && !options.chips.includes(chip)) setChip("");
    if (size && options.sizes && !options.sizes.includes(size)) setSize("");
    if (colorId && !options.colors.some((item) => item.id === colorId)) setColorId("");
    if (storage && options.storage && !options.storage.includes(storage)) setStorage("");
    if (memory && narrowed.memory && !narrowed.memory.includes(memory)) setMemory("");
    const sole = soleSpecValues(model, year, chip, size || undefined, storage || undefined);
    if (chip && year != null && !yearsForChip(model, chip).includes(year)) setYear(undefined);
    else if (sole.year != null) setYear(sole.year);
    if (sole.chip) setChip(sole.chip);
    if (sole.colorId) setColorId(sole.colorId);
    if (sole.size) setSize(sole.size);
    if (sole.memory) setMemory(sole.memory);
    if (sole.storage) setStorage(sole.storage);
  }, [model, year, chip, size, storage]);

  // Pick the first displayed choice only when this step has no selection yet.
  useEffect(() => {
    switch (step) {
      case "model": if (!modelId && visibleModels[0]) setModelId(visibleModels[0].id); break;
      case "chip": if (!chip && visibleChips[0]) setChip(visibleChips[0]); break;
      case "year": if (year == null && yearChoices[0] != null) setYear(yearChoices[0]); break;
      case "color": if (!colorId && yearOptions.colors[0]) setColorId(yearOptions.colors[0].id); break;
      case "size": if (!size && yearOptions.sizes?.[0]) setSize(yearOptions.sizes[0]); break;
      case "memory": if (!memory && memoryOptions.memory?.[0]) setMemory(memoryOptions.memory[0]); break;
      case "storage": if (!storage && yearOptions.storage?.[0]) setStorage(yearOptions.storage[0]); break;
      case "connectivity": if (!connectivity) setConnectivity(IPAD_CONNECTIVITY[0].id); break;
      case "simLock": if (!isSimLockStatus(simLock)) setSimLock(SIM_LOCK_OPTIONS[0].id); break;
      case "keyboard": if (!keyboardLayout) setKeyboardLayout(KEYBOARD_LAYOUTS[0].id); break;
      case "condition": if (!condition) setCondition(CONDITIONS[0].id); break;
      case "packaging": if (originalBox == null) setOriginalBox(true); break;
      case "shipping": if (!shippingScope) setShippingScope("local"); break;
    }
  }, [step, modelId, visibleModels, chip, visibleChips, year, yearChoices, colorId, yearOptions.colors, yearOptions.sizes, memoryOptions.memory, yearOptions.storage, size, memory, storage, connectivity, simLock, keyboardLayout, condition, originalBox, shippingScope]);

  const resetSpecs = () => {
    setColorId("");
    setChip("");
    setSize("");
    setYear(undefined);
    setMemory("");
    setStorage("");
    setSimLock(undefined);
    setConnectivity(undefined);
    setKeyboardLayout(undefined);
    setKeyboardLayoutDetails("");
    setIncludedAccessories(undefined);
    setCondition(undefined);
    setOriginalBox(undefined);
    setHasAppleWarranty(false);
    setWarrantyUntil("");
    setBatteryCapacity("");
    setBatteryCycles("");
  };

  const canContinue = () => {
    switch (step) {
      case "category":
        return Boolean(categoryId);
      case "model":
        return Boolean(modelId);
      case "chip":
        return Boolean(chip);
      case "color":
        return Boolean(colorId);
      case "size":
        return Boolean(size);
      case "year":
        return year != null && yearChoices.includes(year);
      case "memory":
        return Boolean(memory);
      case "storage":
        return Boolean(storage);
      case "simLock":
        return isSimLockStatus(simLock);
      case "connectivity":
        return Boolean(connectivity);
      case "accessories":
        return includedAccessories !== undefined;
      case "keyboard":
        return hasValidKeyboard({ keyboardLayout, keyboardLayoutDetails });
      case "condition":
        return Boolean(condition);
      case "packaging":
        return originalBox != null;
      case "warranty":
        return !hasAppleWarranty || Boolean(warrantyUntil);
      case "battery":
        if (batteryMetric === "capacity") {
          const parsed = Number(batteryCapacity.replace(",", "."));
          return !Number.isNaN(parsed) && parsed >= 1 && parsed <= 100;
        }
        if (batteryMetric === "cycles") {
          const parsed = Number(batteryCycles.replace(",", "."));
          return Number.isInteger(parsed) && parsed >= 0;
        }
        return true;
      case "price": {
        const parsed = Number(price.replace(",", "."));
        if (Number.isNaN(parsed) || parsed <= 0) return false;
        if (!priceAdjust) return true;
        return Boolean(wizardPriceAdjustment(parsed, true, dropAmount, intervalCount, intervalUnit, floorPrice));
      }
      case "location":
        return Boolean(city.trim() && postalCode.trim());
      case "shipping":
        return Boolean(shippingScope);
      case "photos":
        return photos.length > 0 && photos.length <= LISTING_PHOTO_LIMIT;
    }
  };

  const goBack = () => {
    setError("");
    if (stepIndex === 0) {
      leaveRef.current(() => router.push("/"));
      return;
    }
    setStepIndex((index) => index - 1);
  };

  const goNext = () => {
    setError("");
    if (!canContinue()) return;
    if (step === "photos") {
      publish();
      return;
    }
    setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  };

  const commitListing = useCallback(
    async (draft: ListingDraft) => {
      if (needsSimLock(draft.categoryId, draft.connectivity) && !isSimLockStatus(draft.simLock)) {
        setError("Bitte den SIM-Lock-Status angeben. Erstelle einen neuen Entwurf, falls diese Angabe fehlt.");
        return;
      }
      if (needsKeyboardLayout(draft.modelId, draft.includedAccessories) && !hasValidKeyboard(draft)) {
        setError("Bitte das Tastaturlayout angeben. Erstelle einen neuen Entwurf, falls dieser noch keine Tastaturangabe enthält.");
        return;
      }
      if (acceptsDesktopAccessories(draft.modelId) && !hasValidDesktopAccessories(draft.modelId, draft)) {
        setError("Bitte das mitgelieferte Zubehör angeben.");
        return;
      }
      if (publicationId.current) return;
      const id = createId("uf");
      const requestKey = sessionStorage.getItem("used-fruit-publish-key") || crypto.randomUUID();
      sessionStorage.setItem("used-fruit-publish-key", requestKey);
      publicationId.current = "pending";
      setUploading(true);
      try {
      const nextPhotos = [...photosRef.current];
      const photoIds: string[] = [];
      for (let index = 0; index < nextPhotos.length; index += 1) {
        const photo = nextPhotos[index];
        const id = photo.id ?? (photo.file ? await uploadListingPhoto(photo.file) : "");
        if (!id) continue;
        photoIds.push(id);
        if (photo.preview.startsWith("blob:")) URL.revokeObjectURL(photo.preview);
        nextPhotos[index] = { ...photo, id, file: undefined, preview: listingPhotoUrl(id) };
      }
      photosRef.current = nextPhotos;
      setPhotos(nextPhotos);
      if (photoIds.length < 1) {
        publicationId.current = null;
        setError("Bitte mindestens ein Foto hinzufügen.");
        return;
      }
      const saved = await addListing({
        id,
        categoryId: draft.categoryId,
        modelId: draft.modelId,
        title: buildListingTitle(draft.modelId),
        chip: draft.chip,
        colorId: draft.colorId,
        size: draft.size,
        year: draft.year,
        memory: draft.memory,
        storage: draft.storage,
        connectivity: draft.connectivity,
        simLock: needsSimLock(draft.categoryId, draft.connectivity) ? draft.simLock : undefined,
        keyboardLayout: needsKeyboardLayout(draft.modelId, draft.includedAccessories) ? draft.keyboardLayout : undefined,
        keyboardLayoutDetails: needsKeyboardLayout(draft.modelId, draft.includedAccessories) && draft.keyboardLayout === "other" ? draft.keyboardLayoutDetails?.trim() : undefined,
        includedAccessories: acceptsDesktopAccessories(draft.modelId) ? draft.includedAccessories : undefined,
        condition: draft.condition,
        originalBox: draft.originalBox,
        price: draft.price,
        listedPrice: draft.price,
        priceAdjustment: draft.priceAdjustment,
        city: draft.city,
        postalCode: draft.postalCode,
        locality: draft.locality,
        street: draft.street,
        radiusKm: 0,
        shippingScope: draft.shippingScope,
        createdAt: new Date().toISOString(),
        sellerName: profile.name.trim() || "Anbieter",
        sellerEmoji: profile.emoji,
        sellerJoinedAt: new Date().toISOString(),
        appleWarrantyUntil: draft.appleWarrantyUntil,
        batteryMaxCapacityPercent: draft.batteryMaxCapacityPercent,
        batteryCycleCount: draft.batteryCycleCount,
        photoIds,
      }, requestKey);
      publicationId.current = saved.id;
      sessionStorage.removeItem("used-fruit-publish-key");
      clearListingDraft();
      await clearListingPhotoFiles();
      router.push(`/listing/${saved.id}`);
      } catch (error) {
        publicationId.current = null;
        setError(error instanceof Error ? error.message : "Veröffentlichen fehlgeschlagen. Dein Entwurf bleibt erhalten.");
      } finally {
        setUploading(false);
      }
    },
    [addListing, profile.emoji, profile.name, router],
  );

  const collectDraft = (): ListingDraft | undefined => {
    if (!categoryId || !modelId || !colorId || !condition || originalBox == null || !shippingScope) {
      setError("Bitte alle Angaben vollständig ausfüllen.");
      return;
    }
    if (categoryId === "ipad" && !connectivity) {
      setError("Bitte angeben, ob das iPad WLAN oder WLAN + Cellular hat.");
      return;
    }
    if (needsKeyboardLayout(modelId, includedAccessories) && !hasValidKeyboard({ keyboardLayout, keyboardLayoutDetails })) {
      setError("Bitte das Tastaturlayout vollständig angeben.");
      return;
    }
    if (acceptsDesktopAccessories(modelId) && !hasValidDesktopAccessories(modelId, { includedAccessories, keyboardLayout, keyboardLayoutDetails })) {
      setError("Bitte das mitgelieferte Zubehör angeben.");
      return;
    }
    if (needsSimLock(categoryId, connectivity) && !isSimLockStatus(simLock)) {
      setError("Bitte den SIM-Lock-Status auswählen.");
      return;
    }
    const parsedPrice = Number(price.replace(",", "."));
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Bitte einen gültigen Preis angeben.");
      return;
    }
    let priceAdjustment: PriceAdjustment | undefined;
    if (priceAdjust) {
      priceAdjustment = wizardPriceAdjustment(parsedPrice, true, dropAmount, intervalCount, intervalUnit, floorPrice);
      if (!priceAdjustment) {
        setError(
          priceAdjustmentError(
            parsePriceAdjustment({
              amount: Number(dropAmount.replace(",", ".")),
              everyDays: Number(intervalCount.replace(",", ".")) * (intervalUnit === "weeks" ? 7 : 1),
              floor: floorPrice.trim() ? Number(floorPrice.replace(",", ".")) : undefined,
            }) ?? { amount: 0, everyDays: 0 },
            parsedPrice,
          ) ?? "Bitte die automatische Preissenkung prüfen.",
        );
        return;
      }
    }
    if (hasAppleWarranty && !warrantyUntil) {
      setError("Bitte das Ablaufdatum der Apple-Garantie angeben.");
      return;
    }

    let batteryMaxCapacityPercent: number | undefined;
    let batteryCycleCount: number | undefined;
    if (batteryMetric === "capacity") {
      const parsed = Number(batteryCapacity.replace(",", "."));
      if (Number.isNaN(parsed) || parsed < 1 || parsed > 100) {
        setError("Bitte die maximale Batteriekapazität zwischen 1 und 100 % angeben.");
        return;
      }
      batteryMaxCapacityPercent = Math.round(parsed);
    }
    if (batteryMetric === "cycles") {
      const parsed = Number(batteryCycles.replace(",", "."));
      if (Number.isNaN(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
        setError("Bitte die Anzahl der Ladezyklen als ganze Zahl angeben.");
        return;
      }
      batteryCycleCount = parsed;
    }

    return {
      categoryId,
      modelId,
      chip: chip || undefined,
      colorId,
      size: size || undefined,
      year,
      memory: memory || undefined,
      storage: storage || undefined,
      connectivity: categoryId === "ipad" ? connectivity : undefined,
      simLock: needsSimLock(categoryId, connectivity) ? simLock : undefined,
      keyboardLayout: needsKeyboardLayout(modelId, includedAccessories) ? keyboardLayout : undefined,
      keyboardLayoutDetails: needsKeyboardLayout(modelId, includedAccessories) && keyboardLayout === "other" ? keyboardLayoutDetails.trim() : undefined,
      includedAccessories: acceptsDesktopAccessories(modelId) ? includedAccessories : undefined,
      condition,
      originalBox,
      price: parsedPrice,
      priceAdjustment,
      city: city.trim(),
      postalCode: postalCode.trim(),
      locality: locality.trim() || undefined,
      street: street.trim() || undefined,
      shippingScope,
      appleWarrantyUntil: hasAppleWarranty ? warrantyUntil : undefined,
      batteryMaxCapacityPercent,
      batteryCycleCount,
      photoIds: photosRef.current.flatMap((photo) => (photo.id ? [photo.id] : [])),
    };
  };

  const addPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    const accepted: DraftPhoto[] = [];
    let rejected = false;
    for (const file of selected) {
      const type = file.type === "image/jpg" ? "image/jpeg" : file.type;
      if (!["image/jpeg", "image/png", "image/webp"].includes(type)) {
        rejected = true;
        continue;
      }
      accepted.push({ key: crypto.randomUUID(), file, preview: URL.createObjectURL(file) });
    }
    setError(rejected ? "Bitte nur JPEG, PNG oder WebP hinzufügen." : "");
    setPhotos((current) => [...current, ...accepted].slice(0, LISTING_PHOTO_LIMIT));
  };

  const removePhoto = (key: string) => {
    setPhotos((current) => {
      const photo = current.find((item) => item.key === key);
      if (photo?.preview.startsWith("blob:")) URL.revokeObjectURL(photo.preview);
      return current.filter((item) => item.key !== key);
    });
  };

  const publish = () => {
    const draft = collectDraft();
    if (!draft) return;
    if (!photosRef.current.length) {
      setError("Bitte mindestens ein Foto hinzufügen.");
      return;
    }
    void (async () => {
      await saveListingPhotoFiles(photosRef.current.flatMap((photo) => (photo.file ? [photo.file] : [])));
      if (!profileReady) return;
      writeListingDraft(draft);
      if (!signedIn) {
        setLeavingForLogin(true);
        return;
      }
      commitListing(draft);
    })();
  };

  useEffect(() => {
    if (!leavingForLogin) return;
    window.location.assign(appleLoginHref("/inserieren?publish=1"));
  }, [leavingForLogin]);

  useEffect(() => {
    if (!photosReady || !profileReady || !signedIn || !onboardingCompleted) return;
    if (searchParams.get("publish") !== "1") return;
    const draft = readListingDraft();
    if (!draft) return;
    commitListing(draft);
  }, [commitListing, photosReady, profileReady, searchParams, signedIn, onboardingCompleted]);

  return (
    <UnsavedGuard
      dirty={!leavingForLogin}
      title="Inserat abbrechen?"
      message="Möchtest du den Vorgang abbrechen? Deine bisherigen Angaben werden verworfen."
      stayLabel="Abbruch"
      leaveLabel="Löschen"
    >
      <BindTryLeave leaveRef={leaveRef} />
    <div className="flex min-h-dvh flex-col bg-uf-bg-subtle">
      <SiteHeader minimal onLogoClick={() => leaveRef.current(() => { clearListingDraft(); void clearListingPhotoFiles(); router.push("/"); })} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={goBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-uf-text hover:bg-white"
            aria-label="Zurück"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
              <path
                d="M12.5 4.5 7 10l5.5 5.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-uf-border-soft">
            <div
              className="h-full rounded-full bg-uf-text transition-[width] duration-300"
              style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="h-9 w-9 shrink-0" aria-hidden />
        </div>

        <section className="w-full rounded-3xl bg-white p-5 shadow-sm sm:p-8">
          <h1 className="text-[24px] font-semibold tracking-tight text-uf-text sm:text-[28px]">
            {copy.title}
          </h1>
          <p className="mt-1 text-[15px] text-uf-text-secondary">{copy.subtitle}</p>
          {copy.tip && (
            <p className="mt-4 rounded-2xl bg-uf-bg-subtle px-4 py-3 text-[13px] text-uf-text-secondary">
              {copy.tip}
            </p>
          )}
          {step === "battery" && batteryMetric && (
            <div className="mt-4 rounded-2xl bg-uf-bg-subtle px-4 py-3 text-[13px] text-uf-text-secondary">
              <p className="font-medium text-uf-text">{BATTERY_GUIDES[batteryMetric].title}</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4">
                {BATTERY_GUIDES[batteryMetric].steps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-6 space-y-2">
            {step === "category" &&
              [...CATEGORIES].sort((a, b) => ["iphone", "ipad", "mac"].indexOf(a.id) - ["iphone", "ipad", "mac"].indexOf(b.id)).map((category) => (
                <OptionRow
                  key={category.id}
                  label={category.label}
                  selected={categoryId === category.id}
                  onSelect={() => {
                    setCategoryId(category.id);
                    setModelId("");
                    setShowAllModels(false);
                    setShowAllChips(false);
                    setModelQuery("");
                    resetSpecs();
                  }}
                />
              ))}

            {step === "model" && showAllModels && (
              <input
                value={modelQuery}
                onChange={(event) => setModelQuery(event.target.value)}
                placeholder="Gerät suchen"
                aria-label="Gerät suchen"
                className="w-full rounded-2xl border border-uf-border bg-uf-bg-subtle px-4 py-3.5 text-[15px] outline-none"
              />
            )}
            {step === "model" && showAllModels && modelQuery.trim() && visibleModels.length === 0 && (
              <p className="px-1 text-[14px] text-uf-text-secondary">Kein Gerät mit diesem Namen.</p>
            )}
            {step === "model" &&
              visibleModels.map((item) => (
                <OptionRow
                  key={item.id}
                  label={item.name}
                  selected={modelId === item.id}
                  onSelect={() => {
                    setModelId(item.id);
                    setShowAllChips(false);
                    resetSpecs();
                  }}
                />
              ))}
            {step === "model" && !showAllModels && currentModels.length > 0 && currentModels.length < models.length && (
              <button type="button" onClick={() => setShowAllModels(true)} className="w-full rounded-2xl border border-uf-border px-4 py-3.5 text-left text-[15px] text-uf-link">
                Mehr
              </button>
            )}

            {step === "chip" &&
              visibleChips.map((value) => (
                <OptionRow
                  key={value}
                  label={value}
                  selected={chip === value}
                  onSelect={() => {
                    setChip(value);
                    const years = yearsForChip(model, value);
                    setYear(years.length === 1 ? years[0] : undefined);
                    setColorId("");
                    setSize("");
                    setMemory("");
                    setStorage("");
                  }}
                />
              ))}
            {step === "chip" && currentChipChoices && !showAllChips && (
              <button type="button" onClick={() => setShowAllChips(true)} className="w-full rounded-2xl border border-uf-border px-4 py-3.5 text-left text-[15px] text-uf-link">
                Mehr
              </button>
            )}

            {step === "year" &&
              yearChoices.map((value) => (
                <OptionRow
                  key={value}
                  label={String(value)}
                  selected={year === value}
                  onSelect={() => {
                    setYear(value);
                    setColorId("");
                    setSize("");
                    setMemory("");
                    setStorage("");
                  }}
                />
              ))}

            {step === "color" &&
              yearOptions.colors.map((item) => (
                <OptionRow
                  key={item.id}
                  label={item.label}
                  swatch={item.hex}
                  selected={colorId === item.id}
                  onSelect={() => setColorId(item.id)}
                />
              ))}

            {step === "size" &&
              yearOptions.sizes?.map((value) => (
                <OptionRow
                  key={value}
                  label={value}
                  selected={size === value}
                  onSelect={() => setSize(value)}
                />
              ))}

            {step === "memory" &&
              memoryOptions.memory?.map((value) => (
                <OptionRow
                  key={value}
                  label={value}
                  selected={memory === value}
                  onSelect={() => setMemory(value)}
                />
              ))}

            {step === "storage" &&
              yearOptions.storage?.map((value) => (
                <OptionRow
                  key={value}
                  label={value.replace(" GB", "GB").replace(" TB", "TB")}
                  selected={storage === value}
                  onSelect={() => setStorage(value)}
                />
              ))}

            {step === "connectivity" &&
              IPAD_CONNECTIVITY.map((item) => (
                <OptionRow
                  key={item.id}
                  label={item.label}
                  selected={connectivity === item.id}
                  onSelect={() => { setConnectivity(item.id); setSimLock(undefined); }}
                />
              ))}

            {step === "simLock" && SIM_LOCK_OPTIONS.map((item) => (
              <OptionRow key={item.id} label={item.label} selected={simLock === item.id} onSelect={() => setSimLock(item.id)} />
            ))}

            {step === "accessories" && (
              <>
                {DESKTOP_ACCESSORIES.map((item) => (
                  <OptionRow
                    key={item.id}
                    label={item.label}
                    selected={Boolean(includedAccessories?.includes(item.id))}
                    onSelect={() => {
                      setIncludedAccessories((current) => {
                        const list = current ?? [];
                        if (list.includes(item.id)) {
                          const next = list.filter((id) => id !== item.id);
                          return next.length ? next : undefined;
                        }
                        return [...list, item.id];
                      });
                      if (item.id === "keyboard") {
                        setKeyboardLayout(undefined);
                        setKeyboardLayoutDetails("");
                      }
                    }}
                  />
                ))}
                <OptionRow
                  label="Kein Zubehör"
                  selected={includedAccessories?.length === 0}
                  onSelect={() => {
                    setIncludedAccessories([]);
                    setKeyboardLayout(undefined);
                    setKeyboardLayoutDetails("");
                  }}
                />
              </>
            )}

            {step === "keyboard" && (
              <>
                {KEYBOARD_LAYOUTS.map((item) => (
                  <OptionRow key={item.id} label={item.label}
                    selected={keyboardLayout === item.id}
                    onSelect={() => { setKeyboardLayout(item.id); setKeyboardLayoutDetails(""); }} />
                ))}
                {keyboardLayout === "other" && (
                  <label className="block text-[14px]">
                    Land / Variante und Tastenanordnung
                    <input className={fieldClass} value={keyboardLayoutDetails} maxLength={100}
                      placeholder="z. B. Italienisch (IT), QWERTY"
                      onChange={(event) => setKeyboardLayoutDetails(event.target.value)} />
                  </label>
                )}
                <a className="block text-[13px] text-uf-link" href="https://support.apple.com/de-at/102743" target="_blank" rel="noreferrer">
                  Tastaturlayout anhand der Tasten bestimmen
                </a>
              </>
            )}

            {step === "condition" &&
              CONDITIONS.map((item) => (
                <OptionRow
                  key={item.id}
                  label={item.label}
                  detail={item.hint}
                  selected={condition === item.id}
                  onSelect={() => setCondition(item.id)}
                />
              ))}

            {step === "packaging" && (
              <>
                <OptionRow
                  label="Ja, Originalverpackung ist vorhanden"
                  selected={originalBox === true}
                  onSelect={() => setOriginalBox(true)}
                />
                <OptionRow
                  label="Nein, ohne Originalverpackung"
                  selected={originalBox === false}
                  onSelect={() => setOriginalBox(false)}
                />
              </>
            )}

            {step === "warranty" && (
              <>
                <OptionRow
                  label="Nein, keine gültige Garantie"
                  selected={!hasAppleWarranty}
                  onSelect={() => {
                    setHasAppleWarranty(false);
                    setWarrantyUntil("");
                  }}
                />
                <OptionRow
                  label="Ja, Apple-Garantie ist noch gültig"
                  selected={hasAppleWarranty}
                  onSelect={() => setHasAppleWarranty(true)}
                />
                {hasAppleWarranty && (
                  <div className="pt-3">
                    <DateField
                      label="Gültig bis"
                      className={fieldClass}
                      value={warrantyUntil}
                      onChange={setWarrantyUntil}
                      onEnter={goNext}
                    />
                  </div>
                )}
              </>
            )}

            {step === "battery" && batteryMetric === "capacity" && (
              <input
                className={fieldClass}
                value={batteryCapacity}
                onChange={(e) => setBatteryCapacity(e.target.value)}
                inputMode="numeric"
                placeholder="z. B. 94"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goNext();
                  }
                }}
              />
            )}

            {step === "battery" && batteryMetric === "cycles" && (
              <input
                className={fieldClass}
                value={batteryCycles}
                onChange={(e) => setBatteryCycles(e.target.value)}
                inputMode="numeric"
                placeholder="z. B. 48"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    goNext();
                  }
                }}
              />
            )}

            {step === "price" && (
              <>
                <input
                  className={fieldClass}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder="z. B. 749"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !priceAdjust) {
                      e.preventDefault();
                      goNext();
                    }
                  }}
                />
                <button
                  type="button"
                  role="switch"
                  aria-checked={priceAdjust}
                  onClick={() => setPriceAdjust((open) => !open)}
                  className="mt-4 flex w-full items-center justify-between gap-4 rounded-2xl border border-uf-border-soft px-4 py-3 text-left"
                >
                  <span>
                    <span className="block text-[14px] text-uf-text">
                      Preis automatisch senken
                    </span>
                    <span className="mt-0.5 block text-[12px] text-uf-text-tertiary">
                      Solange niemand kauft oder reserviert, sinkt der Preis schrittweise
                    </span>
                  </span>
                  <span
                    className={`relative h-7 w-11 shrink-0 rounded-full transition-colors ${
                      priceAdjust ? "bg-uf-text" : "bg-[#d2d2d7]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-[left] ${
                        priceAdjust ? "left-[18px]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
                {priceAdjust ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {PRICE_ADJUSTMENT_PRESETS.map((preset) => {
                        const selected =
                          Number(dropAmount.replace(",", ".")) === preset.amount &&
                          Number(intervalCount.replace(",", ".")) * (intervalUnit === "weeks" ? 7 : 1) === preset.everyDays;
                        return (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => {
                              setDropAmount(String(preset.amount));
                              if (preset.everyDays % 7 === 0) {
                                setIntervalCount(String(preset.everyDays / 7));
                                setIntervalUnit("weeks");
                              } else {
                                setIntervalCount(String(preset.everyDays));
                                setIntervalUnit("days");
                              }
                            }}
                            className={`h-8 rounded-full px-3 text-[13px] ${
                              selected
                                ? "bg-uf-text text-white"
                                : "border border-uf-border bg-white text-uf-text hover:bg-uf-bg-subtle"
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <label className="block">
                        <span className="text-[12px] tracking-wide text-uf-text-secondary uppercase">Senkung in €</span>
                        <input
                          className={fieldClass}
                          value={dropAmount}
                          onChange={(e) => setDropAmount(e.target.value)}
                          inputMode="decimal"
                          placeholder="10"
                        />
                      </label>
                      <label className="block">
                        <span className="text-[12px] tracking-wide text-uf-text-secondary uppercase">Alle</span>
                        <input
                          className={fieldClass}
                          value={intervalCount}
                          onChange={(e) => setIntervalCount(e.target.value)}
                          inputMode="numeric"
                          placeholder="1"
                        />
                      </label>
                      <label className="col-span-2 block sm:col-span-1">
                        <span className="text-[12px] tracking-wide text-uf-text-secondary uppercase">Tage oder Wochen</span>
                        <select
                          className={fieldClass}
                          value={intervalUnit}
                          onChange={(e) => setIntervalUnit(e.target.value === "weeks" ? "weeks" : "days")}
                        >
                          <option value="days">Tage</option>
                          <option value="weeks">Wochen</option>
                        </select>
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-[12px] tracking-wide text-uf-text-secondary uppercase">
                        Mindestpreis (optional)
                      </span>
                      <input
                        className={fieldClass}
                        value={floorPrice}
                        onChange={(e) => setFloorPrice(e.target.value)}
                        inputMode="decimal"
                        placeholder="nicht unter …"
                      />
                    </label>
                    {(() => {
                      const parsed = Number(price.replace(",", "."));
                      const adjustment = wizardPriceAdjustment(parsed, true, dropAmount, intervalCount, intervalUnit, floorPrice);
                      if (!adjustment || Number.isNaN(parsed) || parsed <= 0) {
                        return (
                          <p className="text-[13px] text-uf-text-secondary">
                            Lege Betrag und Abstand fest. Die Senkung stoppt bei Verkauf oder Reservierung.
                          </p>
                        );
                      }
                      const start = new Date();
                      const next = listingDisplayPrice(
                        { price: parsed, listedPrice: parsed, priceAdjustment: adjustment, createdAt: start.toISOString() },
                        new Date(start.getTime() + adjustment.everyDays * 86_400_000),
                      );
                      return (
                        <p className="text-[13px] text-uf-text-secondary">
                          Ohne Kauf sinkt der Preis um {formatPriceAdjustment(adjustment)}. In{" "}
                          {adjustment.everyDays === 1 ? "einem Tag" : `${adjustment.everyDays} Tagen`}{" "}
                          wären es {formatPrice(next)}. Stoppt bei Verkauf oder Reservierung.
                        </p>
                      );
                    })()}
                  </div>
                ) : null}
              </>
            )}

            {step === "location" && (
              <>
                <LocationAutocomplete
                  value={locationQuery}
                  required
                  onChange={(query) => {
                    setLocationQuery(query);
                    setCity("");
                    setPostalCode("");
                    setLocality("");
                    setStreet("");
                    setShowFullAddress(false);
                  }}
                  onSelect={(place) => {
                    setLocationQuery(formatPlaceLabel(place));
                    setCity(place.city);
                    setPostalCode(place.postalCode);
                    setLocality("Mitte");
                    setStreet("");
                    setShowFullAddress(false);
                  }}
                  inputClassName={fieldClass.replace("mt-1.5 ", "")}
                  placeholder="Tippe PLZ oder Ort…"
                />
                {postalCode && city && (
                  <>
                    <p className="text-[12px] text-uf-text-secondary">
                      Gewählt: {postalCode} {city}
                    </p>
                    <label className="block pt-3">
                      <span className="text-[12px] tracking-wide text-uf-text-secondary uppercase">
                        Ortschaft (optional)
                      </span>
                      <input
                        className={fieldClass}
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        maxLength={40}
                        placeholder="z. B. City"
                        autoComplete="off"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            goNext();
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showFullAddress}
                      onClick={() => {
                        setShowFullAddress((open) => {
                          if (open) setStreet("");
                          return !open;
                        });
                      }}
                      className="mt-4 flex w-full items-center justify-between gap-4 rounded-2xl border border-uf-border-soft px-4 py-3 text-left"
                    >
                      <span>
                        <span className="block text-[14px] text-uf-text">
                          Vollständige Adresse anzeigen
                        </span>
                        <span className="mt-0.5 block text-[12px] text-uf-text-tertiary">
                          Erst dann kannst du die Straße eingeben
                        </span>
                      </span>
                      <span
                        className={`relative h-7 w-11 shrink-0 rounded-full transition-colors ${
                          showFullAddress ? "bg-uf-text" : "bg-[#d2d2d7]"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-[left] ${
                            showFullAddress ? "left-[18px]" : "left-0.5"
                          }`}
                        />
                      </span>
                    </button>
                    {showFullAddress ? (
                      <label className="block pt-3">
                        <span className="text-[12px] tracking-wide text-uf-text-secondary uppercase">
                          Straße
                        </span>
                        <input
                          className={fieldClass}
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          maxLength={80}
                          placeholder="z. B. Königstraße 12"
                          autoComplete="street-address"
                        />
                      </label>
                    ) : null}
                    <p className="pt-3 text-[12px] text-uf-text-tertiary">
                      {street.trim()
                        ? "Die Straße wird im Inserat veröffentlicht."
                        : "Ohne Straße erscheint nur ein ungefährer Ort."}
                    </p>
                  </>
                )}
              </>
            )}

            {step === "shipping" && (
              <>
                <OptionRow
                  label="Nur Abholung"
                  selected={shippingScope === "local"}
                  onSelect={() => setShippingScope("local")}
                />
                <OptionRow
                  label="Abholung und Versand"
                  selected={shippingScope === "deutschland"}
                  onSelect={() => setShippingScope("deutschland")}
                />
              </>
            )}

            {step === "photos" && (
              <div>
                {photos.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {photos.map((photo) => (
                      <div key={photo.key} className="relative aspect-square overflow-hidden rounded-2xl bg-uf-bg-subtle">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.preview} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.key)}
                          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-[16px] text-white"
                          aria-label="Foto entfernen"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {photos.length < LISTING_PHOTO_LIMIT && (
                  <label className="mt-4 flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-uf-border text-[14px] text-uf-text hover:border-uf-text">
                    Fotos auswählen
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={addPhotos}
                    />
                  </label>
                )}
                <p className="pt-3 text-[12px] text-uf-text-tertiary">
                  {photos.length} von {LISTING_PHOTO_LIMIT} Fotos. Die Standardbilder entfallen, es zählen nur deine Aufnahmen.
                </p>
              </div>
            )}
          </div>

          {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue() || uploading || (step === "photos" && (!profileReady || leavingForLogin))}
              className="h-11 rounded-full bg-uf-action px-6 text-[14px] font-medium text-white hover:bg-uf-link disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === "photos" ? (uploading ? "Wird veröffentlicht …" : signedIn ? "Veröffentlichen" : "Mit Apple anmelden & veröffentlichen") : "Weiter"}
            </button>
          </div>
        </section>
      </main>
    </div>
    </UnsavedGuard>
  );
}
