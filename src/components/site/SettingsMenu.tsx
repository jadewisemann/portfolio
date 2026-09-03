"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  FONT_CHOICES,
  FONT_LABELS,
  THEME_CHOICES,
  THEME_LABELS,
} from "@/lib/preferences";
import {
  applyFont,
  applyTheme,
  syncSystemTheme,
  useFontChoice,
  useThemeChoice,
} from "@/lib/preferences-store";
import styles from "./SettingsMenu.module.css";

/**
 * 화면 오른쪽 위의 설정. 테마(시스템 · 라이트 · 다크)와 서체 조합(Grotesk · Serif ·
 * Plex)을 고릅니다.
 *
 * 상태의 실제 소재지는 리액트가 아니라 **`<html>` 의 데이터 속성**입니다 — 사유와
 * 읽고 쓰는 방법은 `src/lib/preferences-store.ts` 에 있습니다. 이 컴포넌트가 직접 가진
 * 상태는 패널이 열려 있는지 하나뿐입니다.
 */
export function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const theme = useThemeChoice();
  const font = useFontChoice();

  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /*
    「시스템」을 고른 동안에는 OS 설정을 따라간다. 고른 값이 `light` · `dark` 면
    `syncSystemTheme` 이 즉시 되돌아 나오므로, 구독은 하나로 충분하다.
  */
  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: light)");
    query.addEventListener("change", syncSystemTheme);
    return () => query.removeEventListener("change", syncSystemTheme);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    // 패널 바깥을 누르면 닫는다. `pointerdown` 이라야 스크롤바를 잡는 동작과도 맞는다.
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={styles.trigger}
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
        type="button"
      >
        <span aria-hidden="true" className={styles.triggerMark}>
          <span className={styles.dial} />
          <span className={styles.dial} />
          <span className={styles.dial} />
        </span>
        <span className={styles.triggerLabel}>설정</span>
      </button>

      <div className={styles.panel} hidden={!open} id={panelId}>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>테마</legend>
          <div className={styles.options}>
            {THEME_CHOICES.map((choice) => (
              <label className={styles.option} key={choice}>
                <input
                  checked={theme === choice}
                  className={styles.radio}
                  name="theme"
                  onChange={() => applyTheme(choice)}
                  type="radio"
                  value={choice}
                />
                <span className={styles.optionName}>{THEME_LABELS[choice]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.group}>
          <legend className={styles.legend}>서체</legend>
          <div className={styles.options}>
            {FONT_CHOICES.map((choice) => (
              <label className={styles.option} key={choice}>
                <input
                  checked={font === choice}
                  className={styles.radio}
                  name="font"
                  onChange={() => applyFont(choice)}
                  type="radio"
                  value={choice}
                />
                <span className={styles.optionName}>
                  {FONT_LABELS[choice].name}
                  <span className={styles.optionNote}>{FONT_LABELS[choice].note}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
