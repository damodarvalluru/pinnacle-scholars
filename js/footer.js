/* ==========================================================================
   PINNACLE SCHOLARS ACADEMY - SHARED SITE FOOTER COMPONENT
   Single source of truth for the premium footer markup.

   Every entry below maps to a navigation option that ALREADY exists in the
   site header (see the <nav id="mobileNavMenu"> blocks). No new destinations,
   services or categories are introduced.

   Rendered into <footer id="siteFooter" class="pinnacle-footer"></footer>.
   If no placeholder exists, one is created and appended to <body>.
   ========================================================================== */
(function () {
    "use strict";

    var FULL_NAME = "Pinnacle Scholars Academy";

    /* Reused header navigation, grouped for the footer. `home: true` marks an
       in-page section of index.html, so it is prefixed when viewed elsewhere.
       `exam` mirrors the header's startTest() handlers. */
    var COLUMNS = [
        {
            id: "footer-col-academics",
            title: "Academics",
            links: [
                { label: "Intermediate (JEE & NEET)", href: "programs.html?program=intermediate" },
                { label: "GATE (M.Tech)", href: "programs.html?program=gate" },
                { label: "JEE Syllabus 2026", href: "syllabus-jee.html" },
                { label: "GATE Syllabus 2026", href: "syllabus-gate.html" },
                { label: "Faculty Directory", href: "#faculty-directory-section", home: true }
            ]
        },
        {
            id: "footer-col-examinations",
            title: "Examinations",
            links: [
                { label: "JEE Test", href: "index.html?exam=jee", exam: "jee" },
                { label: "GATE Test", href: "index.html?exam=gate", exam: "gate" },
                { label: "Timetables", href: "examinations.html?view=timetables" },
                { label: "Notifications", href: "examinations.html?view=notifications" },
                { label: "Guidelines", href: "examinations.html?view=guidelines" },
                { label: "Schemas", href: "examinations.html?view=schemas" }
            ]
        },
        {
            id: "footer-col-portals",
            title: "Portals",
            links: [
                { label: "Student Login", href: "student-portal.html" },
                { label: "Faculty Portal", href: "faculty-portal.html" },
                { label: "Result Portal", href: "result-portal.html" },
                { label: "GATE AI Career Portal", href: "career-ai/index.html" },
                { label: "All Portals", href: "#portals", home: true }
            ]
        },
        {
            id: "footer-col-admissions",
            title: "Admissions & Fees",
            links: [
                { label: "Enroll Now", href: "enrollment.html" },
                { label: "Pay Fees Online", href: "fees-payment.html" },
                { label: "Contact Us", href: "#contact-us", home: true }
            ]
        }
    ];

    function isHomePage() {
        var path = window.location.pathname.replace(/\\/g, "/");
        var file = path.substring(path.lastIndexOf("/") + 1);
        return file === "" || file === "index.html";
    }

    function resolveHref(link, home) {
        if (link.home) {
            return home ? link.href : "index.html" + link.href;
        }
        return link.href;
    }

    function el(tag, className, attrs) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (attrs) {
            Object.keys(attrs).forEach(function (key) {
                node.setAttribute(key, attrs[key]);
            });
        }
        return node;
    }

    function buildColumn(column, home) {
        var nav = el("nav", "pinnacle-footer__col", { "aria-labelledby": column.id });

        var heading = el("h2", "pinnacle-footer__title", { id: column.id });
        heading.textContent = column.title;
        nav.appendChild(heading);

        var list = el("ul", "pinnacle-footer__list");
        column.links.forEach(function (link) {
            var item = el("li");
            var anchor = el("a", "pinnacle-footer__link", {
                href: resolveHref(link, home)
            });
            anchor.textContent = link.label;

            if (link.exam) {
                anchor.addEventListener("click", function (event) {
                    if (home && typeof window.startTest === "function") {
                        event.preventDefault();
                        window.startTest(link.exam);
                    }
                });
            }

            item.appendChild(anchor);
            list.appendChild(item);
        });
        nav.appendChild(list);
        return nav;
    }

    function buildBrand(home) {
        var brand = el("div", "pinnacle-footer__brand");

        var logo = el("a", "pinnacle-footer__logo", {
            href: "index.html",
            "aria-label": FULL_NAME + " home"
        });
        var mark = el("span", "pinnacle-footer__logo-mark", { "aria-hidden": "true" });
        mark.textContent = "P";
        var text = el("span", "pinnacle-footer__logo-text");
        var name = el("span", "pinnacle-footer__logo-name");
        name.textContent = "Pinnacle Scholars";
        var sub = el("span", "pinnacle-footer__logo-sub");
        sub.textContent = "Academy";
        text.appendChild(name);
        text.appendChild(sub);
        logo.appendChild(mark);
        logo.appendChild(text);

        var tagline = el("p", "pinnacle-footer__tagline");
        tagline.textContent = "Noida's Premier Academic Academy";

        var motto = el("p", "pinnacle-footer__motto");
        motto.textContent = "Empowering Futures.";

        brand.appendChild(logo);
        brand.appendChild(tagline);
        brand.appendChild(motto);
        return brand;
    }

    function buildBackToTop() {
        var button = el("button", "pinnacle-footer__top", {
            type: "button",
            "aria-label": "Back to top"
        });
        button.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
            ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
            '<path d="M12 19V5M5 12l7-7 7 7"/></svg>' +
            "<span>Back to top</span>";
        button.addEventListener("click", function () {
            var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        });
        return button;
    }

    function render() {
        var host = document.querySelector("footer.pinnacle-footer, #siteFooter, footer");
        if (!host) {
            host = document.createElement("footer");
            document.body.appendChild(host);
        }
        host.id = "siteFooter";
        host.classList.add("pinnacle-footer");
        if (!host.getAttribute("aria-label")) {
            host.setAttribute("aria-label", "Site footer");
        }
        host.innerHTML = "";

        var home = isHomePage();

        var inner = el("div", "pinnacle-footer__inner");
        inner.appendChild(buildBrand(home));
        COLUMNS.forEach(function (column) {
            inner.appendChild(buildColumn(column, home));
        });
        host.appendChild(inner);

        var bar = el("div", "pinnacle-footer__bar");
        var copy = el("p", "pinnacle-footer__copy");
        copy.textContent =
            "\u00A9 " + new Date().getFullYear() + " " + FULL_NAME + ", Noida. Empowering Futures.";
        bar.appendChild(copy);
        bar.appendChild(buildBackToTop());
        host.appendChild(bar);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", render);
    } else {
        render();
    }
})();
