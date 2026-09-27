/* ==========================================================================
   PINNACLE SCHOLARS ACADEMY - NEUMORPHIC AUTH FLIP CARD
   --------------------------------------------------------------------------
   Presentation only. It never reads or writes a form value, never submits
   anything and never talks to a backend.

   Its only job is to keep a flip stage exactly as tall as the face currently
   facing the viewer, so two very different face heights animate smoothly
   instead of snapping.

   Used by both portals, so it discovers any .neu-flip on the page rather than
   assuming one hard-coded id: the Faculty portal uses #authFlip and rotates
   via its existing toggleAuthViews(), while the Student portal uses
   #studentAuthFlip and rotates via toggleStudentAuthViews().
   ========================================================================== */

(function () {
    'use strict';

    function setup(flip) {

        const stage = flip.querySelector('.neu-flip__stage');
        if (!stage) return null;

        const front = stage.querySelector('.neu-flip__face--front');
        const back = stage.querySelector('.neu-flip__face--back');
        if (!front || !back) return null;

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

        const scheduleSync = function () {
            window.requestAnimationFrame(syncFlipHeight);
        };

        window.addEventListener('resize', scheduleSync);
        window.addEventListener('orientationchange', scheduleSync);

        // Re-measure on any field change: the Faculty register face can grow
        // when its native date pickers are used on some mobile browsers. The
        // Student enrollment face is an iframe with a fixed height, so it needs
        // no special handling - and its events do not cross the frame boundary
        // anyway.
        stage.addEventListener('input', scheduleSync);
        stage.addEventListener('change', scheduleSync);

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(scheduleSync);
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', scheduleSync);
        } else {
            scheduleSync();
        }

        return { flip: flip, stage: stage, sync: syncFlipHeight };
    }

    const instances = Array.prototype.map.call(
        document.querySelectorAll('.neu-flip'),
        setup
    ).filter(Boolean);

    if (!instances.length) return;

    // Exposed so each portal's own toggle can call it after rotating. The
    // optional argument scopes the call to one specific flip; with a single
    // flip per page the bare call is enough.
    window.syncFlipHeight = function (scope) {
        const match = scope
            ? instances.filter(function (i) { return i.flip === scope || i.stage === scope || i.flip.contains(scope); })[0]
            : instances[0];
        if (match) match.sync();
    };

    // The Faculty portal's initial state is set in its own window.onload; give
    // every flip one final measurement after the full load event too.
    window.addEventListener('load', function () {
        instances.forEach(function (i) { i.sync(); });
    });
}());
