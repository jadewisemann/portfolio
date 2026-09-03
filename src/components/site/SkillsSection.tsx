import {
  SECTIONS,
  SKILL_LEVEL_LABELS,
  type SkillLevel,
  skillGroups,
  skillsDisclosure,
} from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import styles from "./SkillsSection.module.css";

/** 등급을 칸 세 개의 채움 수로 읽습니다 — A 는 셋, B 는 둘, C 는 하나입니다. */
const FILLED: Record<SkillLevel, number> = { A: 3, B: 2, C: 1 };

function LevelMeter({ level }: { level: SkillLevel }) {
  return (
    <span
      className={styles.meter}
      /*
        칸 세 개는 장식이므로 보조 기술에는 등급 정의 문장을 그대로 읽힙니다.
        색만으로 등급을 구분하지 않기 위한 것이기도 합니다 (DESIGN_SYSTEM.md §3).
      */
      role="img"
      aria-label={`${level} 등급 — ${SKILL_LEVEL_LABELS[level]}`}
    >
      {[0, 1, 2].map((slot) => (
        <span
          key={slot}
          className={slot < FILLED[level] ? styles.pipOn : styles.pipOff}
        />
      ))}
    </span>
  );
}

/**
 * 둘째 절(스킬). `CONTENT.md` §6 표를 그대로 옮기고, 그 절의 ⚠️ 두 항목(뺀 기술과
 * 표기 충돌)을 아래에 함께 적습니다. 목록에 없는 기술은 근거가 없어서 없는 것입니다.
 */
export function SkillsSection() {
  const meta = SECTIONS[1];

  return (
    <Section meta={meta} index={1}>
      <Reveal className={styles.legend}>
        <ul className={styles.legendList}>
          {(["A", "B", "C"] as const).map((level) => (
            <li className={styles.legendItem} key={level}>
              <LevelMeter level={level} />
              <span className={styles.legendText}>{SKILL_LEVEL_LABELS[level]}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <div className={styles.grid}>
        {skillGroups.map((group, index) => (
          <Reveal
            className={styles.group}
            key={group.area}
            delay={Math.min(index, 3) * 0.05}
          >
            <h3 className={styles.area}>{group.area}</h3>
            <ul className={styles.items}>
              {group.items.map((item) => (
                <li className={styles.item} key={item.name}>
                  <span className={styles.itemName}>{item.name}</span>
                  <LevelMeter level={item.level} />
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <Reveal className={styles.disclosure}>
        <ul className={styles.disclosureList}>
          {skillsDisclosure.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
