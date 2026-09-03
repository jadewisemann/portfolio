import type { ReactNode } from "react";
import type { SectionMeta } from "@/content/site";
import { Reveal } from "./Reveal";
import styles from "./Section.module.css";

/**
 * 절 하나의 껍데기. 머리말은 세 부분입니다 — 등폭 번호 · 제목 · 한 문장 설명.
 *
 * 번호는 `SECTIONS` 배열의 자리입니다. 배열 순서를 바꾸면 화면의 번호도 따라갑니다.
 */
export interface SectionProps {
  meta: SectionMeta;
  index: number;
  children: ReactNode;
}

export function Section({ meta, index, children }: SectionProps) {
  return (
    <section className={styles.section} id={meta.id} aria-labelledby={`${meta.id}-title`}>
      <div className={styles.head}>
        <Reveal>
          <p className={styles.index}>{String(index + 1).padStart(2, "0")}</p>
        </Reveal>
        {/* 제목만 닦아 올립니다 — 한 낱말이므로 한 덩어리로 드러나는 것이 맞습니다. */}
        <Reveal delay={0.05} mask>
          <h2 className={styles.title} id={`${meta.id}-title`}>
            {meta.title}
          </h2>
        </Reveal>
        <Reveal delay={0.13}>
          <p className={styles.note}>{meta.note}</p>
        </Reveal>
      </div>

      <div className={styles.body}>{children}</div>
    </section>
  );
}
