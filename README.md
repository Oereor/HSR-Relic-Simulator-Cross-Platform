# HSR Relic Simulator

A relic farming simulator for **Honkai: Star Rail**. Generate relic pieces with game-accurate stat distributions, level them up, compare reforge results, and track stats across full sets.

## Features

- **Relic generator** — create pieces with the same main- and sub-affix probabilities used in-game
- **Level-up simulation** — upgrade from +0 to +15 and watch sub-affixes roll at each breakpoint
- **Reforge comparison** — side-by-side view of a piece before and after reforging
- **Set statistics** — per-slot and full-set breakdowns of affix frequency and roll quality
- **Total affix values** — aggregated flat and percentage value contributions across all 6 relic slots
- **Character templates** — select a character to lock main affixes per slot and auto-configure useful sub-affixes
- **Out-of-Battle Stats** — combines base stats, trace bonuses (E0), and relic contributions into final HP/ATK/DEF/SPD and percentage stats. Based on **E0 + S1** (no Eidolons, Rank 1 character-exclusive light cone)
- **Custom highlight rules** — define your own stat priorities to flag pieces worth keeping
- **Import / export** — save your relic stash to a JSON file and load it back later
- **EN / CN toggle** — switch between English and Chinese on the fly

## Tech Stack

| Area | Library |
|------|---------|
| Framework | [Vue 3](https://vuejs.org/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| State | [Pinia](https://pinia.vuejs.org/) |
| Routing | [Vue Router](https://router.vuejs.org/) |
| Testing | [Vitest](https://vitest.dev/) |

## Getting Started

You'll need [Node.js](https://nodejs.org/) >= 18.

```bash
npm install        # install dependencies
npm run dev        # start dev server → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build locally
npm run typecheck  # run type checks
npm test           # run tests
npm run test:watch # run tests in watch mode
```

## Project Structure

```
src/
├── main.ts                     # app entry point
├── App.vue                     # root component
├── assets/
│   └── main.css                # global styles + Tailwind
├── components/
│   ├── ui/                     # shared primitives (buttons, combobox, card border)
│   ├── relic/                  # relic card, thumbnail, affix rows, reforge compare
│   ├── set/                    # relic set slot, statistics panel, total value panel, out-of-battle stats panel
│   ├── highlight/              # highlight rule config panel
│   ├── layout/                 # app shell (panels, language toggle)
│   ├── create/                 # relic creation form
│   └── template/               # character template selector
├── composables/
│   ├── useRelicCard.ts
│   └── useSubAffixRow.ts
├── data/                       # static game-data JSON
│   ├── MainAffixConfig.json
│   ├── SubAffixConfig.json
│   ├── MainAffixProbabilityConfig.json
│   ├── CharacterRelicTemplatesConfig.json
│   ├── CharacterBaseStats.json
│   ├── OutOfBattleStatsConfig.json
│   └── TextMap.json
├── logic/                      # core logic (framework-agnostic)
│   ├── AffixCalculator.ts      #   affix value computation
│   ├── ConfigService.ts        #   JSON config loader (incl. decimal-aware parser)
│   ├── HighlightService.ts     #   custom highlight rule engine
│   ├── LocalizationService.ts  #   i18n string lookup
│   ├── OutOfBattleStatsService.ts  #   final-stat computation (base + bonuses + relics)
│   ├── RelicCardStyling.ts     #   card-render helpers
│   ├── RelicData.ts            #   relic-piece data model
│   ├── RelicSystem.ts          #   high-level relic operations
│   ├── RngService.ts           #   seeded RNG wrapper
│   ├── RandomWrapper.ts        #   RNG abstraction layer
│   ├── SaveLoadService.ts      #   JSON import/export
│   └── StatisticsService.ts    #   set-statistics aggregation
├── router/
│   └── index.ts
├── stores/                     # Pinia stores
│   ├── useCharacterTemplateStore.ts
│   ├── useCreateRelicStore.ts
│   ├── useHighlightStore.ts
│   ├── useLocaleStore.ts
│   ├── useRelicSetStore.ts
│   └── useRelicStore.ts
├── types/
│   ├── characterTemplate.ts
│   ├── config.ts
│   ├── enums.ts
│   ├── highlight.ts
│   ├── index.ts
│   ├── outOfBattleStats.ts
│   ├── relic.ts
│   ├── statistics.ts
│   └── ui.ts
├── utils/
│   ├── fileIO.ts
│   └── format.ts
└── views/
    ├── MainView.vue
    └── RelicSetView.vue
```

## License

MIT
