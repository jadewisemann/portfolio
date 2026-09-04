import { SECTIONS, SKILL_LEVEL_LABELS, type SkillLevel, skillGroups } from "@/content/site";
import { Reveal } from "./Reveal";
import { Section } from "./Section";
import { SKILL_ICONS } from "./skill-icons";
import styles from "./SkillsSection.module.css";

/** 등급을 칸 세 개의 채움 수로 읽습니다 — A 는 셋, B 는 둘, C 는 하나입니다. */
const FILLED: Record<SkillLevel, number> = { A: 3, B: 2, C: 1 };

function LevelMeter({ level }: { level: SkillLevel }) {
  return (
    <span
      className={styles.meter}
      /*
        범례는 화면에 없습니다 (소유자 지시, 2026-09-04 — 설명을 뺀다). 그래서 등급의
        정의 문장은 보조 기술에만 읽힙니다. 눈에는 칸 셋의 채움만 보이고, 그것으로
        충분합니다 — 색만으로 구분하지 않는 것은 그대로입니다 (DESIGN_SYSTEM.md §3).
      */
      role="img"
      aria-label={`${level} 등급 — ${SKILL_LEVEL_LABELS[level]}`}
    >
      {[0, 1, 2].map((slot) => (
        <span key={slot} className={slot < FILLED[level] ? styles.pipOn : styles.pipOff} />
      ))}
    </span>
  );
}

function SkillIcon({ name }: { name: string }) {
  const icon = SKILL_ICONS[name];
  if (!icon) return <span className={styles.iconDot} aria-hidden="true" />;
  return (
    <svg
      className={styles.icon}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
    >
      <path d={icon.path} fill={`#${icon.hex}`} />
    </svg>
  );
}

/**
 * 둘째 절(스킬). 흐르는 알약 줄 여섯 — 줄마다 방향이 번갈아 바뀌고, 알약 하나가 기술
 * 하나다 (참조 aarab.me 의 SKILLS).
 *
 * 화면에 글자는 알약 안의 이름뿐이다 (소유자 지시, 2026-09-04 — "설명은 제외하고
 * 카테고리도 제거"). 영역 이름 · 범례 · 고지 문장은 전부 뺐다. 목록에서 뺀 기술에 대한
 * 고지는 페이지 끝(`Footer`)에 작게 남아 있다 — 조용히 자르지 않는다는 규율은 지키되,
 * 그것을 읽는 자리를 아래로 옮겼다.
 *
 * 흐름의 구현: 알약 묶음을 **두 벌** 놓고 트랙을 -50% 까지 옮긴 뒤 처음으로 되돌린다.
 * 둘째 벌은 `aria-hidden` 이라 보조 기술은 기술을 한 번만 읽는다. 축소 모션에서는
 * 트랙이 멈추고 둘째 벌이 사라지고 알약이 줄바꿈된다.
 */
export function SkillsSection() {
  const meta = SECTIONS[1];

  return (
    <Section meta={meta} index={1}>
      <div className={styles.rows}>
        {skillGroups.map((group, index) => (
          <Reveal className={styles.row} key={group.area} delay={Math.min(index, 3) * 0.05}>
            <div
              className={`${styles.track} ${index % 2 ? styles.reverse : ""}`}
              style={{ "--pills": group.items.length } as React.CSSProperties}
            >
              {[false, true].map((dup) => (
                <ul
                  className={styles.pills}
                  key={dup ? "dup" : "main"}
                  aria-hidden={dup || undefined}
                  aria-label={dup ? undefined : group.area}
                  data-dup={dup || undefined}
                >
                  {group.items.map((item) => (
                    <li className={styles.pill} key={item.name}>
                      <SkillIcon name={item.name} />
                      <span className={styles.pillName}>{item.name}</span>
                      <LevelMeter level={item.level} />
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
