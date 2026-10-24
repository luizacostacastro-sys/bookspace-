const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { useAuth } from "@/lib/AuthContext";

const STORAGE_KEY = "bookspace.a11y";

export const A11Y_DEFAULTS = {
  font_scale: 100,
  line_spacing: 160,
  letter_spacing: 0,
  theme: "light",
  reading_font: "default",
  simplified: false,
  reduced_motion: false,
  highlight_links: false,
  big_targets: false
};

const FONT_STACKS = {
  default: '"Manrope", ui-sans-serif, system-ui, sans-serif',
  atkinson: '"Atkinson Hyperlegible", "Manrope", ui-sans-serif, sans-serif',
  lexend: '"Lexend", "Manrope", ui-sans-serif, sans-serif'
};

const AccessibilityContext = createContext({
  prefs: A11Y_DEFAULTS,
  update: () => {},
  reset: () => {},
  saved: false
});

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...A11Y_DEFAULTS, ...JSON.parse(raw) } : { ...A11Y_DEFAULTS };
  } catch (error) {
    return { ...A11Y_DEFAULTS };
  }
}

function applyToDocument(prefs) {
  const root = document.documentElement;
  root.style.fontSize = `${Math.round((16 * prefs.font_scale) / 100)}px`;
  root.style.setProperty("--a11y-line-height", String((prefs.line_spacing || 160) / 100));
  root.style.setProperty("--a11y-letter-spacing", `${prefs.letter_spacing || 0}px`);
  root.style.setProperty("--a11y-word-spacing", `${Math.round((prefs.letter_spacing || 0) * 0.6)}px`);
  root.style.setProperty("--font-body", FONT_STACKS[prefs.reading_font] || FONT_STACKS.default);

  root.classList.toggle("dark", prefs.theme === "dark");
  root.classList.toggle("contrast", prefs.theme === "contrast");
  root.classList.toggle("a11y-simplified", Boolean(prefs.simplified));
  root.classList.toggle("a11y-reduced-motion", Boolean(prefs.reduced_motion));
  root.classList.toggle("a11y-links", Boolean(prefs.highlight_links));
  root.classList.toggle("a11y-big-targets", Boolean(prefs.big_targets));
}

export function AccessibilityProvider({ children }) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState(readLocal);
  const [saved, setSaved] = useState(false);
  const recordId = useRef(null);
  const emailRef = useRef(null);

  useEffect(() => {
    applyToDocument(prefs);
    if (!user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch (error) {
        /* preferências seguem apenas em memória */
      }
    }
  }, [prefs, user]);

  useEffect(() => {
    let cancelled = false;
    if (!user || !user.email) {
      recordId.current = null;
      emailRef.current = null;
      setSaved(false);
      return () => {
        cancelled = true;
      };
    }
    const load = async () => {
      try {
        const rows = await db.entities.AccessibilityPreference.filter({ user_email: user.email });
        const list = Array.isArray(rows) ? rows : rows.items || [];
        if (cancelled) return;
        if (list[0]) {
          recordId.current = list[0].id;
          setPrefs({ ...A11Y_DEFAULTS, ...list[0], id: undefined });
          setSaved(true);
        } else {
          recordId.current = null;
          setSaved(false);
        }
        emailRef.current = user.email;
      } catch (error) {
        setSaved(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const persist = useCallback(
    async (next) => {
      if (!user || !user.email) return;
      try {
        const payload = {};
        Object.keys(A11Y_DEFAULTS).forEach((key) => {
          payload[key] = next[key];
        });
        payload.user_email = user.email;
        if (recordId.current) {
          await db.entities.AccessibilityPreference.update(recordId.current, payload);
        } else {
          const created = await db.entities.AccessibilityPreference.create(payload);
          recordId.current = created.id;
        }
        setSaved(true);
      } catch (error) {
        setSaved(false);
      }
    },
    [user]
  );

  const update = useCallback(
    (patch) => {
      setPrefs((current) => {
        const next = { ...current, ...patch };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const reset = useCallback(() => {
    setPrefs({ ...A11Y_DEFAULTS });
    persist({ ...A11Y_DEFAULTS });
  }, [persist]);

  return (
    <AccessibilityContext.Provider value={{ prefs, update, reset, saved: Boolean(saved && user) }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}