// --- filename: app/onboarding/page.tsx ---
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import AuthBackground from "@/components/AuthBackground";
import CursorEffect from "@/components/CursorEffect";
import { motion } from "framer-motion";
import Link from "next/link";
import { normalizePhone, isValidMatric } from "@/lib/validators";
import AvatarUploader from "@/components/AvatarUploader";
import OnboardingProgress from "@/components/OnboardingProgress";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOnboarding } from "@/lib/hooks/useOnboarding";

/* ---------- stable helpers outside component ---------- */
const REQUIRED_FIELDS = [
  "full_name",
  "display_name",
  "matric_number",
  "whatsapp_number",
  "avatar_url",
  "gender",
  "age",
] as const;

interface Profile {
  full_name?: string;
  display_name?: string;
  matric_number?: string;
  whatsapp_number?: string;
  avatar_url?: string;
  gender?: string;
  age?: number;
  school_id?: string;
  registration_step?: number;
  [key: string]: unknown;
}

function computeProgressValue(p: Profile): number {
  const total = REQUIRED_FIELDS.length;
  const done = REQUIRED_FIELDS.reduce(
    (acc, key) => (p[key as keyof Profile] ? acc + 1 : acc),
    0
  );
  return Math.round((done / total) * 100);
}

/* ---------- component ---------- */
export default function OnboardingPage(): React.JSX.Element {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { saveStep, checkConflict, uploadAvatar, completeOnboarding } = useOnboarding();

  // UI state
  const [loading, setLoading] = useState<boolean>(true); // onboarding data loading
  const [profile, setProfile] = useState<Profile>({});
  const localRef = useRef<Profile>({});
  const [step, setStep] = useState<number>(0);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [conflictField, setConflictField] = useState<string | null>(null);

  /* ---------- updateLocal helper ---------- */
  const updateLocal = useCallback((patch: Partial<Profile>) => {
    localRef.current = { ...localRef.current, ...patch };
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  /* ---------- auth redirect ---------- */
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [authLoading, user, router]);

  /* ---------- initial load ---------- */
  useEffect(() => {
    if (!user) return; // wait for user to be loaded

    let mounted = true;

    (async () => {
      try {
        const response = await fetch('/api/onboarding/resume');
        if (response.ok) {
          const data = await response.json();
          localRef.current = { ...data.data };
          setProfile({ ...data.data });
          setStep(data.step ?? 0);
        } else {
          localRef.current = {};
          setProfile({});
        }
      } catch (err) {
        console.error("onboarding load", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  /* ---------- progress (memoized) ---------- */
  const progress = useMemo(() => computeProgressValue(profile), [profile]);

  /* ---------- steps ---------- */
  const steps = useMemo(() => [
    {
      title: "Who are you?",
      fields: (
        <>
          <label className="text-sm">Full name</label>
          <input
            value={profile.full_name ?? ""}
            onChange={(e) => updateLocal({ full_name: e.target.value })}
            className="w-full p-3 rounded bg-transparent border border-gray-700 mb-3"
          />
          <label className="text-sm">Display name</label>
          <input
            value={profile.display_name ?? ""}
            onChange={(e) => updateLocal({ display_name: e.target.value })}
            className="w-full p-3 rounded bg-transparent border border-gray-700"
          />
          <div className="mt-3">
            <AvatarUploader
              initialUrl={profile.avatar_url ?? null}
              onChange={async (base64, filename, contentType) => {
                setMessage("Uploading avatar…");
                setSyncing(true);
                const result = await uploadAvatar(base64, filename, contentType);
                if (result.success && result.url) {
                  updateLocal({ avatar_url: result.url });
                  setMessage("Avatar uploaded");
                } else {
                  setMessage(result.error ?? "Avatar upload failed");
                }
                setSyncing(false);
              }}
            />
          </div>
        </>
      ),
    },
    {
      title: "Matric number",
      fields: (
        <>
          <label className="text-sm">Matric number</label>
          <input
            value={profile.matric_number ?? ""}
            onChange={(e) => {
              updateLocal({ matric_number: e.target.value });
              setConflictField(null);
            }}
            className={`w-full p-3 rounded bg-transparent border ${
              profile.matric_number && !isValidMatric(profile.matric_number)
                ? "border-rose-500"
                : "border-gray-700"
            }`}
          />
          {profile.matric_number && !isValidMatric(profile.matric_number) && (
            <div className="text-rose-400 text-sm mt-2">
              Matric format should be YYYY/FAC/DEPT/NUMBER e.g. 2024/CP/CSC/022
            </div>
          )}
        </>
      ),
    },
    {
      title: "WhatsApp",
      fields: (
        <>
          <label className="text-sm">WhatsApp number</label>
          <input
            value={profile.whatsapp_number ?? ""}
            onChange={(e) => {
              updateLocal({ whatsapp_number: e.target.value });
              setConflictField(null);
            }}
            className="w-full p-3 rounded bg-transparent border border-gray-700"
          />
          <div className="text-xs text-gray-500 mt-2">
            Enter as 0906..., +23490..., or 23490... — we&apos;ll normalize it for you.
          </div>
        </>
      ),
    },
    {
      title: "Profile details",
      fields: (
        <>
          <label className="text-sm">Age</label>
          <input
            type="number"
            value={profile.age ?? ""}
            onChange={(e) =>
              updateLocal({ age: Number(e.target.value) || undefined })
            }
            className="w-full p-3 rounded bg-transparent border border-gray-700 mb-3"
          />
          <label className="text-sm">Gender</label>
          <select
            value={profile.gender ?? ""}
            onChange={(e) => updateLocal({ gender: e.target.value })}
            className="w-full p-3 rounded bg-transparent border border-gray-700"
          >
            <option value="">Choose</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </>
      ),
    },
    {
      title: "School",
      fields: (
        <>
          <label className="text-sm">School (fixed)</label>
          <input
            value="FULAFIA"
            disabled
            className="w-full p-3 rounded bg-transparent border border-gray-700"
          />
        </>
      ),
    },
  ], [profile, updateLocal, uploadAvatar]);

  /* ---------- handleNext ---------- */
  const handleNext = useCallback(async () => {
    setMessage(null);
    setSyncing(true);

    try {
      if (step === 1) {
        const val = profile.matric_number ?? "";
        if (!isValidMatric(val)) {
          setMessage("Invalid matric format");
          setSyncing(false);
          return;
        }

        const conflict = await checkConflict({ matricNumber: val });
        if (conflict.conflict) {
          setMessage("That matric is already used by another user");
          setConflictField("matric");
          setSyncing(false);
          return;
        }
      }

      if (step === 2) {
        const val = profile.whatsapp_number ?? "";
        const normalized = normalizePhone(val);
        if (!normalized) {
          setMessage("Invalid phone");
          setSyncing(false);
          return;
        }

        const conflict = await checkConflict({ whatsappNumber: normalized });
        if (conflict.conflict) {
          setMessage("That WhatsApp number is already used by another user");
          setConflictField("whatsapp");
          setSyncing(false);
          return;
        }

        updateLocal({ whatsapp_number: normalized });
      }

      const nextStep = Math.min(steps.length - 1, step + 1);
      setStep(nextStep);

      const result = await saveStep(nextStep, localRef.current);
      if (!result.success) setMessage(result.error ?? "Failed to save");
    } catch (err) {
      console.error("handleNext error:", err);
      setMessage("Error saving progress");
    } finally {
      setSyncing(false);
    }
  }, [step, steps.length, profile, checkConflict, saveStep, updateLocal]);

  /* ---------- handleFinish ---------- */
  const handleFinish = useCallback(async (): Promise<void> => {
    setMessage(null);

    if (!profile.full_name || !profile.display_name) {
      setMessage("Please complete required fields");
      return;
    }

    setSyncing(true);

    try {
      const saveResult = await saveStep(steps.length, {
        ...localRef.current,
        school_id: "b3e9e6c1-e4d9-4b62-a2d1-c3f8f7e5a9d2",
      });
      if (!saveResult.success) {
        setMessage(saveResult.error ?? "Failed to save");
        setSyncing(false);
        return;
      }

      const completeResult = await completeOnboarding();
      if (!completeResult.success) {
        setMessage(completeResult.error ?? "Failed to complete");
        setSyncing(false);
        return;
      }

      setMessage("Onboarding complete — redirecting…");
      setTimeout(() => router.push("/paywall"), 700);
    } catch (err) {
      console.error("handleFinish error:", err);
      setMessage("Error completing onboarding");
    } finally {
      setSyncing(false);
    }
  }, [profile, steps.length, saveStep, completeOnboarding, router]);

  /* ---------- UI ---------- */
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-300">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AuthBackground />
      <CursorEffect />
      <header className="max-w-4xl mx-auto flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <button className="text-sm text-gray-300 underline" onClick={logout}>
            Logout
          </button>
          <Link href="/" className="text-xl font-bold">WDM</Link>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-sm text-gray-400">
            Step {step + 1} / {steps.length}
          </div>
          <div className="w-48 mt-2">
            <OnboardingProgress percent={progress} />
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {syncing ? "Syncing…" : "All changes saved"}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.4 }}
          className="bg-[#071233] p-6 rounded-xl shadow-lg"
        >
          {steps[step] ? (
            <>
              <h2 className="text-2xl font-semibold mb-4">{steps[step].title}</h2>
              <div className="space-y-4">{steps[step].fields}</div>
            </>
          ) : (
            <div className="text-rose-400">Invalid step</div>
          )}

          {message && <div className="mt-3 text-sm text-rose-400">{message}</div>}
          {conflictField && <div className="mt-2 text-xs text-rose-400">Conflict field: {conflictField}</div>}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="px-4 py-2 rounded border border-gray-700"
              disabled={syncing}
            >
              Back
            </button>
            <div>
              {step < steps.length - 1 ? (
                <button
                  id="onboarding-next-btn"
                  onClick={handleNext}
                  className="px-4 py-2 rounded bg-indigo-600"
                  disabled={syncing}
                >
                  {syncing ? "Saving..." : "Next"}
                </button>
              ) : (
                <button
                  id="onboarding-next-btn"
                  onClick={handleFinish}
                  className="px-4 py-2 rounded bg-emerald-500"
                  disabled={syncing}
                >
                  {syncing ? "Completing..." : "Finish"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
