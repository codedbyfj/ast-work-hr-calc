// Tracking Work Hours Extension - Floating Widget
// Version 1.0

(function () {
    // Exclude welcome/index and welcome/password pages
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.includes("/welcome/index") || pathname.includes("/welcome/password")) {
        return;
    }

    // Avoid double injection
    if (document.getElementById("ast-whc-container")) {
        return;
    }

    let cardVisible = false;

    // Structured data model
    let timesheetData = {
        dateStr: "",
        in_time: "",
        lunch_time: "",
        break_time: "",
        isLoaded: false
    };

    const clockSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

    // Create Floating Widget Container
    const container = document.createElement("div");
    container.id = "ast-whc-container";
    container.style.cssText = `
        position: fixed;
        bottom: 84px;
        right: 20px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        user-select: none;
        transition: bottom 0.2s ease;
    `;

    // Dynamic positioning above notification sticky button
    function updatePosition() {
        let sticky = document.querySelector(".notification-sticky, #notificationAjaxTrigger, .notificationAjaxTrigger, #notification-sticky");
        if (sticky) {
            let rect = sticky.getBoundingClientRect();
            let bottomOffset = window.innerHeight - rect.top + 14;
            container.style.bottom = Math.max(bottomOffset, 84) + "px";
        } else {
            container.style.bottom = "84px";
        }
    }

    // Popover Card
    const card = document.createElement("div");
    card.id = "ast-whc-card";
    card.style.cssText = `
        display: none;
        position: absolute;
        bottom: 54px;
        right: 0;
        width: 290px;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.08);
        border: 1px solid #e2e8f0;
        padding: 16px;
        box-sizing: border-box;
        color: #1e293b;
        transform-origin: bottom right;
        transition: opacity 0.15s ease, transform 0.15s ease;
    `;
    card.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 6px;">
                ${clockSvg}
                <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Work Hours</span>
            </div>
            <button id="ast-whc-close-btn" type="button" style="background: none; border: none; color: #94a3b8; font-size: 18px; line-height: 1; cursor: pointer; padding: 2px 6px; border-radius: 4px;">&times;</button>
        </div>
        <div id="ast-whc-card-body"></div>
    `;

    const cardBody = card.querySelector("#ast-whc-card-body");
    card.querySelector("#ast-whc-close-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        closeCard();
    });

    // Floating Trigger Button
    const trigger = document.createElement("button");
    trigger.id = "ast-whc-trigger";
    trigger.type = "button";
    trigger.title = "Click to view work hours";
    trigger.style.cssText = `
        display: flex;
        align-items: center;
        background: #FFF;
        color: #0f172a;
        border: 1px solid #e2e8f0;
        border-radius: 9999px;
        padding: 8px 16px;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
        outline: none;
        transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    `;

    trigger.innerHTML = `
        <span id="ast-whc-trigger-text" style="font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: 0.2px;">Calculating...</span>
    `;

    trigger.addEventListener("mouseenter", () => {
        trigger.style.transform = "scale(1.03)";
        trigger.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.18)";
        trigger.style.background = "#f8fafc";
    });

    trigger.addEventListener("mouseleave", () => {
        trigger.style.transform = "scale(1)";
        trigger.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.12)";
        trigger.style.background = "#FFF";
    });

    trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleCard();
    });

    card.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    document.addEventListener("click", () => {
        if (cardVisible) {
            closeCard();
        }
    });

    container.appendChild(card);
    container.appendChild(trigger);

    function injectContainer() {
        if (document.body) {
            document.body.appendChild(container);
            updatePosition();
        } else {
            document.addEventListener("DOMContentLoaded", () => {
                document.body.appendChild(container);
                updatePosition();
            });
        }
    }
    injectContainer();

    window.addEventListener("resize", updatePosition);
    setInterval(updatePosition, 3000);

    function toggleCard() {
        if (cardVisible) {
            closeCard();
        } else {
            openCard();
        }
    }

    function openCard() {
        cardVisible = true;
        trigger.style.borderColor = "#94a3b8";
        card.style.display = "block";
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        requestAnimationFrame(() => {
            card.style.opacity = "1";
            card.style.transform = "scale(1)";
        });
    }

    function closeCard() {
        cardVisible = false;
        trigger.style.borderColor = "#e2e8f0";
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        setTimeout(() => {
            if (!cardVisible) {
                card.style.display = "none";
            }
        }, 150);
    }

    // Load from cache on startup
    function loadCachedTimesheet() {
        try {
            let cached = localStorage.getItem("ast_cached_timesheet");
            if (cached) {
                let parsed = JSON.parse(cached);
                let today = new Date().toDateString();
                if (parsed.savedDate === today && parsed.dateStr) {
                    timesheetData = {
                        dateStr: parsed.dateStr,
                        in_time: parsed.in_time,
                        lunch_time: parsed.lunch_time,
                        break_time: parsed.break_time,
                        isLoaded: true
                    };
                    renderUI();
                }
            }
        } catch (e) {}
    }
    loadCachedTimesheet();

    // Time calculations
    function calculateTime() {
        if (!timesheetData.isLoaded || !timesheetData.in_time) return null;

        let date = new Date(timesheetData.dateStr);
        let current_date = new Date();

        let in_time = timesheetData.in_time.trim();
        if (!in_time || in_time === "-" || in_time === "") {
            return null;
        }

        let break_time = timesheetData.break_time || "0 min";
        let lunch_time = timesheetData.lunch_time || "0 min";

        let now_date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
        let timeStart = new Date(now_date + " " + in_time);
        if (isNaN(timeStart.getTime())) {
            return null;
        }

        let diff = (current_date - timeStart) / 60000;
        let minutes = diff % 60;
        let hours = (diff - minutes) / 60;

        let parsedLunch = parseDuration(lunch_time);
        let parsedBreak = parseDuration(break_time);

        let total_time = parsedLunch + parsedBreak;
        let startTime = hours * 60 + minutes;
        let elapsed_time = parseTime(startTime - total_time, current_date.getSeconds());
        let second_ticks = 59 - current_date.getSeconds();
        let remaining_time = time_diff("08:01:00", elapsed_time, second_ticks);
        let current_time = current_date.getHours() + ":" + current_date.getMinutes() + ":" + current_date.getSeconds();
        let leaving_time = addTime(remaining_time, current_time);
        return { remaining_time, leaving_time, current_date };
    }

    function parseDuration(val) {
        if (!val || val.trim() === "-" || val.trim() === "") return 0;
        let hrsMatch = val.match(/(\d+)\s*hrs?/);
        let minMatch = val.match(/(\d+)\s*min/);
        let hrs = hrsMatch ? parseInt(hrsMatch[1], 10) : 0;
        let mins = minMatch ? parseInt(minMatch[1], 10) : 0;
        if (!hrsMatch && !minMatch) {
            return parseInt(val, 10) || 0;
        }
        return hrs * 60 + mins;
    }

    function renderUI() {
        const triggerText = document.getElementById("ast-whc-trigger-text");
        if (!triggerText) return;

        if (!timesheetData.isLoaded) {
            renderUnavailable();
            return;
        }

        let date = new Date(timesheetData.dateStr);
        let current_date = new Date();

        if (current_date.toDateString() !== date.toDateString()) {
            renderUnavailable();
            return;
        }

        let calc = calculateTime();
        if (!calc) {
            renderNotCheckedIn();
            return;
        }

        let break_time = timesheetData.break_time ? timesheetData.break_time.trim() : "";
        let lunch_time = timesheetData.lunch_time ? timesheetData.lunch_time.trim() : "";

        let hasBreak = break_time && break_time !== "-";
        let hasLunch = lunch_time && lunch_time !== "-";

        if (calc.remaining_time.split(":")[0] >= 0) {
            // In progress
            let time_completed_at = tConvert(calc.leaving_time);
            localStorage.setItem("time_ended_at", time_completed_at);

            triggerText.innerText = calc.remaining_time;
            triggerText.style.color = "#0f172a";

            cardBody.innerHTML = `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center; margin-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Time Left</div>
                    <div style="font-size: 26px; font-weight: 700; color: #0f172a; font-family: monospace, sans-serif; letter-spacing: 0.5px; margin-top: 2px;">${calc.remaining_time}</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #334155; margin-bottom: ${hasLunch || hasBreak ? "12px" : "4px"}; padding: 0 4px;">
                    <span style="color: #64748b;">Completes at</span>
                    <b style="color: #0f172a;">${time_completed_at}</b>
                </div>
                ${(hasLunch || hasBreak) ? `
                <div style="display: flex; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                    ${hasLunch ? `<div style="flex: 1; background: #f1f5f9; border-radius: 8px; padding: 6px 8px; text-align: center; font-size: 11px;"><span style="color: #64748b; display: block;">Lunch</span><b>${lunch_time}</b></div>` : ""}
                    ${hasBreak ? `<div style="flex: 1; background: #f1f5f9; border-radius: 8px; padding: 6px 8px; text-align: center; font-size: 11px;"><span style="color: #64748b; display: block;">Break</span><b>${break_time}</b></div>` : ""}
                </div>` : ""}
            `;
        } else {
            // Completed / Overtime
            let time_ended_at = localStorage.getItem("time_ended_at") || "Completed";

            let additional_hrs = Math.abs(calc.remaining_time.split(":")[0]) - 1;
            let additional_mins = Math.abs(calc.remaining_time.split(":")[1]) - 1;
            let additional_time = String(additional_hrs).padStart(2, "0") + ":" + String(additional_mins).padStart(2, "0") + ":" + String(calc.current_date.getSeconds()).padStart(2, "0");

            triggerText.innerText = `+${additional_time}`;
            triggerText.style.color = "#16a34a";

            cardBody.innerHTML = `
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 12px; text-align: center; margin-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 600; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">Completed at ${time_ended_at}</div>
                    <div style="font-size: 24px; font-weight: 700; color: #15803d; font-family: monospace, sans-serif; letter-spacing: 0.5px; margin-top: 2px;">+${additional_time}</div>
                    <div style="font-size: 11px; color: #16a34a; margin-top: 2px;">Additional Time</div>
                </div>
                ${(hasLunch || hasBreak) ? `
                <div style="display: flex; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                    ${hasLunch ? `<div style="flex: 1; background: #f1f5f9; border-radius: 8px; padding: 6px 8px; text-align: center; font-size: 11px;"><span style="color: #64748b; display: block;">Lunch</span><b>${lunch_time}</b></div>` : ""}
                    ${hasBreak ? `<div style="flex: 1; background: #f1f5f9; border-radius: 8px; padding: 6px 8px; text-align: center; font-size: 11px;"><span style="color: #64748b; display: block;">Break</span><b>${break_time}</b></div>` : ""}
                </div>` : ""}
            `;
        }
    }

    function renderNotCheckedIn() {
        const triggerText = document.getElementById("ast-whc-trigger-text");
        if (triggerText) {
            triggerText.innerText = "Not Checked In";
            triggerText.style.color = "#64748b";
        }
        cardBody.innerHTML = `
            <div style="padding: 16px 8px; text-align: center; color: #64748b; font-size: 13px;">
                You haven't checked in yet for today.
            </div>
        `;
    }

    function renderUnavailable() {
        const triggerText = document.getElementById("ast-whc-trigger-text");
        if (triggerText) {
            triggerText.innerText = "No Data";
            triggerText.style.color = "#64748b";
        }
        cardBody.innerHTML = `
            <div style="padding: 16px 8px; text-align: center; color: #64748b; font-size: 13px;">
                Today's timesheet data isn't available yet.
            </div>
        `;
    }

    function parseTime(s, sec) {
        return Math.floor(parseInt(s) / 60) + ":" + (parseInt(s) % 60) + ":" + sec;
    }

    function addTime(remaining_time, current_time) {
        var a = remaining_time.split(":");
        var seconds = +a[0] * 60 * 60 + +a[1] * 60 + 0;
        var b = current_time.split(":");
        var seconds2 = +b[0] * 60 * 60 + +b[1] * 60 + 0;

        var d = new Date(1970, 0, 1);
        d.setSeconds(seconds + seconds2);

        return d.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    }

    function time_diff(t1, t2, sec) {
        var t1parts = t1.split(":");
        var t1cm = Number(t1parts[0]) * 60 + Number(t1parts[1]);

        var t2parts = t2.split(":");
        var t2cm = Number(t2parts[0]) * 60 + Number(t2parts[1]);

        var hour = Math.floor((t1cm - t2cm) / 60);
        var min = Math.floor((t1cm - t2cm) % 60);
        return String(hour).padStart(2, "0") + ":" + String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
    }

    function tConvert(time) {
        time = time.toString().match(/^([0-1]?\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
        if (time.length > 1) {
            time = time.slice(1);
            time[5] = +time[0] < 12 ? " AM" : " PM";
            time[0] = +time[0] % 12 || 12;
        }
        return time.join("");
    }

    // Extract values safely using textContent or innerText (DOMParser compatibility)
    function extractTimesheetFromRow(row) {
        if (!row) return null;
        let tds = row.getElementsByTagName("td");
        if (!tds || tds.length < 7) return null;

        let dateText = tds[1]?.textContent?.trim() || "";
        let inTimeText = tds[6]?.textContent?.trim() || "";
        let breakText = tds[3]?.textContent?.trim() || "0 min";
        let lunchText = tds[4]?.textContent?.trim() || "0 min";

        if (!dateText) return null;

        return {
            dateStr: dateText,
            in_time: inTimeText,
            lunch_time: lunchText,
            break_time: breakText,
            isLoaded: true
        };
    }

    function saveTimesheetData(data) {
        if (!data) return;
        timesheetData = data;
        try {
            localStorage.setItem("ast_cached_timesheet", JSON.stringify({
                dateStr: data.dateStr,
                in_time: data.in_time,
                lunch_time: data.lunch_time,
                break_time: data.break_time,
                savedDate: new Date().toDateString()
            }));
        } catch (e) {}
        renderUI();
    }

    function getDetailedReportUrl() {
        if (window.location.pathname.includes("generate_detailed_report")) {
            try {
                localStorage.setItem("ast_report_url", window.location.href);
            } catch (e) {}
            return window.location.href;
        }

        let linkEl = document.querySelector('a[href*="generate_detailed_report"]');
        if (linkEl && linkEl.href && !linkEl.href.includes("javascript") && linkEl.href.startsWith("http")) {
            try {
                localStorage.setItem("ast_report_url", linkEl.href);
            } catch (e) {}
            return linkEl.href;
        }

        let cached = localStorage.getItem("ast_report_url");
        if (cached) {
            return cached;
        }

        return window.location.origin + "/ems/timesheet/generate_detailed_report/";
    }

    // Initialize data fetching
    function fetchTimesheetData() {
        // If current page already has the timesheet table
        let localTable = document.getElementById("DataTables_Table_0") || document.querySelector(".table-bordered");
        if (localTable && localTable.getElementsByTagName("tr")[1]) {
            let extracted = extractTimesheetFromRow(localTable.getElementsByTagName("tr")[1]);
            if (extracted) {
                saveTimesheetData(extracted);
                return;
            }
        }

        let reportUrl = getDetailedReportUrl();
        fetch(reportUrl)
            .then((r) => r.text())
            .then((html) => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(html, "text/html");
                let fetchedTable = doc.querySelector(".table-bordered") || doc.getElementById("DataTables_Table_0");
                if (fetchedTable && fetchedTable.getElementsByTagName("tr")[1]) {
                    let extracted = extractTimesheetFromRow(fetchedTable.getElementsByTagName("tr")[1]);
                    if (extracted) {
                        saveTimesheetData(extracted);
                        return;
                    }
                }
                if (!timesheetData.isLoaded) {
                    renderUnavailable();
                }
            })
            .catch(() => {
                if (!timesheetData.isLoaded) {
                    renderUnavailable();
                }
            });
    }

    fetchTimesheetData();

    // Retry fetch after 800ms in case navigation elements render asynchronously on Dashboard
    setTimeout(() => {
        if (!timesheetData.isLoaded) {
            fetchTimesheetData();
        }
    }, 800);

    // Live update every second
    setInterval(() => {
        renderUI();
    }, 1000);

    // Refresh timesheet row every 3 minutes in background
    setInterval(() => {
        fetchTimesheetData();
    }, 1000 * 60 * 3);
})();