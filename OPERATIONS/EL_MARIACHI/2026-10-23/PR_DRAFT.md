# Add El Mariachi menu and Mariachi Rush prospect concept

Adds independent Fina Calle prospect routes at /el-mariachi and /el-mariachi/play. Jacksonville uses the current exact ordering-channel snapshot (260 items across 20 categories) with published descriptions/base prices, searchable categories and direct item links. All six NC locations have separate verified contact/hours/order destinations; Jacksonville prices do not appear under other locations.

The menu uses the actual official logo and three official food images with recorded provenance. Mariachi Rush is an original 30-second one-thumb rhythm prototype with keyboard input, pause/replay, reduced-motion cues, optional synthesized audio and an asset-independent SVG/DOM fallback. Selected-location routing is retained across Menu, Play and Order. Both routes clearly identify the Fina Calle concept and are noindex.

Scope is limited to the new El Mariachi route/assets and operations records. No dependencies, shared configuration, traffic reporting, other client routes, payments, restaurant systems or phone routing are changed.

Validation: source review completed. Scoped ESLint passed without warnings or errors. The production Webpack build passed compilation, TypeScript, 60 static pages and build traces. Both El Mariachi routes appear in the build route table. Existing CI remains unchanged; no remote CI has run for this branch. Per explicit user instruction, no post-build tests, browser QA, manual smoke checks or phone calls are run; visual, gameplay/audio and live ordering behavior are unverified.
