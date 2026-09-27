/* ==========================================================================
   PINNACLE SCHOLARS ACADEMY - NEUMORPHIC AUTH FLIP CARD
   --------------------------------------------------------------------------
   Presentation only. The Faculty portal already had a login <-> signup
   toggle (toggleAuthViews); that function now rotates the 3D card and calls
   syncFlipHeight() defined here. This file does not read or write any form
   value, never submits anything and never talks to a backend.

   Its only job is to keep the flip stage exactly as tall as the face that is
   currently facing the viewer, so the two very different form heights
   animate smoothly instead of snapping.
   ========================================================================== */

(function () {
    'use strict';

    const flip = document.getElementById('authFlip');
    const stage = document.getElementById('authFlipStage');

    // Student portal has a single login form, so there is nothing to flip.
    if (!flip || !stage) return;

    const front = stage.querySelector('.neu-flip__face--front');
    const back = stage.querySelector('.neu-flip__face--back');
    if (!front || !back) return;

    function activeFace() {
        return flip.classList.contains('is-flipped') ? back : front;
    }

    function syncFlipHeight() {
        const face = activeFace();
        // The visible face sits in normal flow, so its own content height is
        // exactly what the stage should be. Reading it forces a synchronous
        // layout, which is what makes the measurement correct straight after
        // the .is-flipped class has been toggled.
        const height = face.getBoundingClientRect().height;
        if (height > 0) {
            stage.style.height = Math.ceil(height) + 'px';
        }
    }

    // Exposed so the portal's existing toggleAuthViews() can call it.
    window.syncFlipHeight = syncFlipHeight;

    function scheduleSync() {
        window.requestAnimationFrame(syncFlipHeight);
    }

    window.addEventListener('load', scheduleSync);
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('orientationchange', scheduleSync);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(scheduleSync);
    }

    // A failed validation alert can change nothing about height, but the
    // register face grows when its native date pickers are used on some
    // mobile browsers, so re-measure whenever a field changes.
    stage.addEventListener('input', scheduleSync);
    stage.addEventListener('change', scheduleSync);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleSync);
    } else {
        scheduleSync();
    }
}());
