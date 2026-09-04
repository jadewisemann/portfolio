import type { ReactNode } from "react";
import type { SectionMeta } from "@/content/site";
import { Reveal } from "./Reveal";
import styles from "./Section.module.css";

/**
 * 절 하나의 껍데기. 머리말은 두 부분입니다 — 뒤에 깔린 큰 번호 · 앞의 제목.
 *
 * 번호는 `SECTIONS` 배열의 자리입니다. 배열 순서를 바꾸면 화면의 번호도 따라갑니다.
 *
 * 한 문장 설명(`meta.note`)은 화면에 내지 않습니다 (소유자 지시, 2026-09-04 — "설명이
 * 아니라 시각적으로 보면 이해가 되는 게 좋다"). 값은 `SECTIONS` 에 문서로 남습니다.
 * `aria-description` 으로 붙이려 했으나 `section`(region) 에는 허용되지 않는 속성이라
 * (jsx-a11y) 붙이지 않습니다.
 */
export interface SectionProps {
  meta: SectionMeta;
  index: number;
  children: ReactNode;
}

export function Section({ meta, index, children }: SectionProps) {
  return (
    <section
      className={styles.section}
      id={meta.id}
      aria-labelledby={`${meta.id}-title`}
    >
      <Reveal className={styles.head}>
        <p className={styles.index}>{String(index + 1).padStart(2, "0")}</p>
        <h2 className={styles.title} id={`${meta.id}-title`}>
          {meta.title}
        </h2>
      </Reveal>

      <div className={styles.body}>{children}</div>
    </section>
  );
}
