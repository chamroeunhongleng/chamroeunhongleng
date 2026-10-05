<script setup lang="ts">
import { useId } from 'vue'
import type { Profile } from '~~/shared/schemas/index'
import { useMotionAllowed } from '../../composables/useMotionAllowed'

/**
 * The hero portrait.
 *
 * Wide screens: a large, slightly tilted photo on an offset backplate, with a
 * round stamp naming the current role on its corner and a location label.
 * Phones: a compact profile row — small photo, location, and the same role as
 * a plain label — so the name stays on the first screen.
 *
 * The stamp is decorative (aria-hidden): the same fact is real text in the Now
 * section (profile.availability). It said "open to internships" until the
 * owner started at Angkor Byte and asked for that message to go (2026-10-05).
 * It turns slowly only when ambient motion is allowed. Alt text comes from
 * content.
 */
defineProps<{ photo: NonNullable<Profile['photo']>; location: string }>()

const motion = useMotionAllowed()
const ringId = `stamp-ring-${useId()}`
</script>

<template>
  <figure class="portrait">
    <div class="portrait-frame">
      <img
        :src="photo.src"
        :alt="photo.alt"
        width="640"
        height="640"
        fetchpriority="high"
        decoding="async"
        class="portrait-img"
      >
      <span class="portrait-fade" aria-hidden="true" />
    </div>

    <span class="stamp" aria-hidden="true" :data-animate="motion === 'allowed' ? '' : undefined">
      <svg viewBox="0 0 120 120" focusable="false">
        <defs>
          <path :id="ringId" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" />
        </defs>
        <g class="stamp-ring">
          <text class="stamp-text">
            <textPath :href="`#${ringId}`" textLength="266" lengthAdjust="spacing">SOFTWARE ENGINEERING INTERN · ANGKOR BYTE ·</textPath>
          </text>
        </g>
        <path class="stamp-star" d="M60 41c2 11 6 15 19 19-13 4-17 8-19 19-2-11-6-15-19-19 13-4 17-8 19-19z" />
      </svg>
    </span>

    <figcaption class="portrait-meta">
      <span class="pill portrait-pill">
        <span class="dot" aria-hidden="true" />
        {{ location }} · UTC+7
      </span>
      <span class="pill pill-live portrait-role">
        <span class="dot" aria-hidden="true" />
        Intern at Angkor Byte
      </span>
    </figcaption>
  </figure>
</template>

<style scoped>
.portrait {
  position: relative;
  isolation: isolate;
  justify-self: end;
  width: 100%;
  max-width: 26rem;
  margin: 0;
}

/* An offset sheet behind the photo, like a print laid on a second print. */
.portrait::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--color-accent-tint);
  border: 1.5px dashed var(--color-accent);
  border-radius: var(--radius-hero);
  transform: translate(-0.9rem, 0.9rem) rotate(-3deg);
}

.portrait-frame {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-hero);
  background: var(--color-surface-sunken);
  box-shadow: var(--shadow-raised);
  transform: rotate(1.5deg);
  transition: transform var(--duration-base) var(--ease-out);
}

.portrait:hover .portrait-frame {
  transform: rotate(0deg);
}

.portrait-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 22%;
}

.portrait-fade {
  position: absolute;
  inset: auto 0 0;
  height: 32%;
  background: linear-gradient(to bottom, transparent, color-mix(in srgb, var(--color-bg) 65%, transparent));
  pointer-events: none;
}

.portrait-meta {
  position: absolute;
  right: var(--space-4);
  bottom: var(--space-5);
  display: grid;
  gap: var(--space-2);
  justify-items: end;
}

.portrait-pill {
  font-size: var(--text-xs);
  border-color: var(--color-border);
  box-shadow: var(--shadow-card);
}

.portrait-pill .dot {
  background: var(--color-positive);
}

/* Wide screens say this with the stamp; phones say it in words. */
.portrait-role {
  display: none;
  font-size: var(--text-xs);
}

/* The stamp: a paper sticker pressed onto the photo's corner. */
.stamp {
  position: absolute;
  left: -2.75rem;
  bottom: 3.25rem;
  width: 7.5rem;
  height: 7.5rem;
  border-radius: 50%;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  box-shadow: var(--shadow-raised);
  transform: rotate(-10deg);
}

.stamp svg {
  display: block;
  width: 100%;
  height: 100%;
}

.stamp-ring {
  transform-box: view-box;
  transform-origin: 50% 50%;
}

.stamp-text {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.06em;
  fill: var(--color-text);
}

.stamp-star {
  fill: var(--color-accent-2);
}

@media (prefers-reduced-motion: no-preference) {
  .stamp[data-animate] .stamp-ring {
    animation: stamp-spin var(--duration-spin) linear infinite;
  }
}

@keyframes stamp-spin {
  to {
    transform: rotate(360deg);
  }
}

/* One column: the photo sits at the left, so the stamp moves to the corner
   that has room. */
@media (max-width: 1040px) {
  .portrait {
    justify-self: start;
    max-width: 22rem;
  }

  .stamp {
    left: auto;
    right: -2.5rem;
    bottom: auto;
    top: 2rem;
  }
}

/* Phones: a profile row. */
@media (max-width: 760px) {
  .portrait {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    max-width: none;
  }

  .portrait::before {
    inset: 0 auto 0 0;
    width: 6.25rem;
    border-radius: var(--radius-l);
    transform: translate(-0.35rem, 0.35rem) rotate(-5deg);
  }

  .portrait-frame {
    flex: 0 0 auto;
    width: 6.25rem;
    aspect-ratio: 1;
    border-radius: var(--radius-l);
    box-shadow: var(--shadow-card);
    transform: rotate(-2deg);
  }

  .portrait-fade,
  .stamp {
    display: none;
  }

  .portrait-meta {
    position: static;
    justify-items: start;
    min-width: 0;
  }

  .portrait-pill {
    box-shadow: none;
    white-space: normal;
  }

  .portrait-role {
    display: inline-flex;
  }
}
</style>
