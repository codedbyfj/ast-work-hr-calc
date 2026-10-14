// Tracking Work Hours Extension - Floating Widget
// Version 1.0

(function () {
    // Avoid double injection
    if (document.getElementById("ast-whc-container")) {
        return;
    }

    const total_seconds = 59;
    let elapsed_time, remaining_time, leaving_time, hours, minutes, diff, startTime, total_time, current_time, date, current_date, second_ticks, time_completed_at;
    let activeRow = null;
    let cardVisible = false;

    // Get icon URL from extension
    let iconUrl = "";
    try {
        iconUrl = chrome.runtime.getURL("alarm-clock32.png");
    } catch (e) {
        iconUrl = "";
    }

    const clockSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;

    // Create Floating Widget Container
    const container = document.createElement("div");
    container.id = "ast-whc-container";
    container.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        user-select: none;
    `;

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

    // Floating Trigger Button
    const trigger = document.createElement("button");
    trigger.id = "ast-whc-trigger";
    trigger.type = "button";
    trigger.title = "Click to view work hours";
    trigger.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        background: #0f172a;
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 9999px;
        padding: 8px 14px 8px 10px;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
        outline: none;
        transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
    `;

    trigger.innerHTML = `
        ${iconUrl ? `<img src="${iconUrl}" width="20" height="20" alt="Clock" style="display:block; flex-shrink:0;" onerror="this.style.display='none'" />` : clockSvg}
        <span id="ast-whc-trigger-text" style="font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: 0.2px;">Calculating...</span>
    `;

    trigger.addEventListener("mouseenter", () => {
        trigger.style.transform = "scale(1.03)";
        trigger.style.boxShadow = "0 6px 18px rgba(0, 0, 0, 0.3)";
    });

    trigger.addEventListener("mouseleave", () => {
        trigger.style.transform = "scale(1)";
        trigger.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.22)";
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
        } else {
            document.addEventListener("DOMContentLoaded", () => document.body.appendChild(container));
        }
    }
    injectContainer();

    function toggleCard() {
        if (cardVisible) {
            closeCard();
        } else {
            openCard();
        }
    }

    function openCard() {
        cardVisible = true;
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
        card.style.opacity = "0";
        card.style.transform = "scale(0.95)";
        setTimeout(() => {
            if (!cardVisible) {
                card.style.display = "none";
            }
        }, 150);
    }

    // Time calculations
    function calculateTime() {
        if (!activeRow) return;

        date = new Date(activeRow.getElementsByTagName("td")[1]?.innerText);
        current_date = new Date();

        let in_time = activeRow.getElementsByTagName("td")[6]?.innerText;
        let break_time = activeRow.getElementsByTagName("td")[3]?.innerText || "0 min";
        let lunch_time = activeRow.getElementsByTagName("td")[4]?.innerText || "0 min";

        let now_date = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear();
        let timeStart = new Date(now_date + " " + in_time);

        diff = (current_date - timeStart) / 60000;
        minutes = diff % 60;
        hours = (diff - minutes) / 60;

        let parsedLunch = parseDuration(lunch_time);
        let parsedBreak = parseDuration(break_time);

        total_time = parsedLunch + parsedBreak;
        startTime = converToMinutes(hours + "." + minutes);
        elapsed_time = parseTime(startTime - total_time, current_date.getSeconds());
        second_ticks = total_seconds - current_date.getSeconds();
        remaining_time = time_diff("08:01:00", elapsed_time, second_ticks);
        current_time = current_date.getHours() + ":" + current_date.getMinutes() + ":" + current_date.getSeconds();
        leaving_time = addTime(remaining_time, current_time);
    }

    function parseDuration(val) {
        if (!val || val.trim() === "-" || val.trim() === "") return 0;
        if (val.split("hrs").length === 2) {
            let hr = val.split("hrs")[0];
            let min = val.split("hrs")[1].split("min")[0];
            return converToMinutes(hr + "." + min);
        }
        return +(val.replace("min", "").trim()) || 0;
    }

    function renderUI() {
        const triggerText = document.getElementById("ast-whc-trigger-text");
        if (!triggerText) return;

        if (!activeRow) {
            renderUnavailable();
            return;
        }

        date = new Date(activeRow.getElementsByTagName("td")[1]?.innerText);
        current_date = new Date();

        let isToday = current_date.getDate() === date.getDate() &&
                      current_date.getMonth() === date.getMonth() &&
                      current_date.getFullYear() === date.getFullYear();

        if (!isToday) {
            renderUnavailable();
            return;
        }

        calculateTime();

        let break_time = activeRow.getElementsByTagName("td")[3]?.innerText?.trim() || "";
        let lunch_time = activeRow.getElementsByTagName("td")[4]?.innerText?.trim() || "";

        let hasBreak = break_time && break_time !== "-";
        let hasLunch = lunch_time && lunch_time !== "-";

        if (remaining_time.split(":")[0] >= 0) {
            // In progress
            time_completed_at = tConvert(leaving_time);
            localStorage.setItem("time_ended_at", time_completed_at);

            triggerText.innerText = remaining_time;

            card.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        ${clockSvg}
                        <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Work Hours</span>
                    </div>
                    <button id="ast-whc-close-btn" type="button" style="background: none; border: none; color: #94a3b8; font-size: 18px; line-height: 1; cursor: pointer; padding: 2px 6px; border-radius: 4px;">&times;</button>
                </div>
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; text-align: center; margin-bottom: 12px;">
                    <div style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Time Left</div>
                    <div style="font-size: 26px; font-weight: 700; color: #0f172a; font-family: monospace, sans-serif; letter-spacing: 0.5px; margin-top: 2px;">${remaining_time}</div>
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
            let time_ended_at;
            if (time_completed_at != null && time_completed_at !== "undefined" && time_completed_at !== "null") {
                time_ended_at = time_completed_at;
                localStorage.setItem("time_ended_at", time_completed_at);
            } else {
                time_ended_at = localStorage.getItem("time_ended_at") || "Completed";
            }

            let additional_hrs = Math.abs(remaining_time.split(":")[0]) - 1;
            let additional_mins = Math.abs(remaining_time.split(":")[1]) - 1;
            let additional_time = ("00" + additional_hrs).substr(-2) + ":" + ("00" + additional_mins).substr(-2) + ":" + ("00" + current_date.getSeconds()).substr(-2);

            triggerText.innerText = `+${additional_time}`;

            card.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        ${clockSvg}
                        <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Work Hours</span>
                    </div>
                    <button id="ast-whc-close-btn" type="button" style="background: none; border: none; color: #94a3b8; font-size: 18px; line-height: 1; cursor: pointer; padding: 2px 6px; border-radius: 4px;">&times;</button>
                </div>
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

        const closeBtn = document.getElementById("ast-whc-close-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                closeCard();
            });
        }
    }

    function renderUnavailable() {
        const triggerText = document.getElementById("ast-whc-trigger-text");
        if (triggerText) {
            triggerText.innerText = "No Data";
        }
        card.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 6px;">
                    ${clockSvg}
                    <span style="font-size: 13px; font-weight: 700; color: #0f172a;">Work Hours</span>
                </div>
                <button id="ast-whc-close-btn" type="button" style="background: none; border: none; color: #94a3b8; font-size: 18px; line-height: 1; cursor: pointer; padding: 2px 6px; border-radius: 4px;">&times;</button>
            </div>
            <div style="padding: 16px 8px; text-align: center; color: #64748b; font-size: 13px;">
                Today's timesheet data isn't available yet.
            </div>
        `;
        const closeBtn = document.getElementById("ast-whc-close-btn");
        if (closeBtn) {
            closeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                closeCard();
            });
        }
    }

    function converToMinutes(s) {
        var c = s.split(".");
        return parseInt(c[0]) * 60 + parseInt(c[1]);
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
        return ("00" + hour).substr(-2) + ":" + ("00" + min).substr(-2) + ":" + ("00" + sec).substr(-2);
    }

    function tConvert(time) {
        time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
        if (time.length > 1) {
            time = time.slice(1);
            time[5] = +time[0] < 12 ? " AM" : " PM";
            time[0] = +time[0] % 12 || 12;
        }
        return time.join("");
    }

    // Initialize data fetching
    function fetchTimesheetData() {
        // If current page already has the timesheet table
        let localTable = document.getElementById("DataTables_Table_0") || document.querySelector(".table-bordered");
        if (localTable && localTable.getElementsByTagName("tr")[1]) {
            activeRow = localTable.getElementsByTagName("tr")[1];
            renderUI();
            return;
        }

        // Otherwise fetch the detailed report page
        let reportUrl = "";
        try {
            let subNav = document.querySelector("#navType .subNav");
            if (subNav) {
                let linkEl = subNav.getElementsByTagName("li")[2]?.getElementsByTagName("a")[0];
                if (linkEl && linkEl.href) {
                    reportUrl = linkEl.href;
                }
            }
        } catch (e) {}

        if (!reportUrl) {
            reportUrl = window.location.origin + "/ems/timesheet/generate_detailed_report/";
        }

        fetch(reportUrl)
            .then((r) => r.text())
            .then((html) => {
                let parser = new DOMParser();
                let doc = parser.parseFromString(html, "text/html");
                let fetchedTable = doc.querySelector(".table-bordered") || doc.getElementById("DataTables_Table_0");
                if (fetchedTable && fetchedTable.getElementsByTagName("tr")[1]) {
                    activeRow = fetchedTable.getElementsByTagName("tr")[1];
                    renderUI();
                } else {
                    renderUnavailable();
                }
            })
            .catch(() => {
                renderUnavailable();
            });
    }

    fetchTimesheetData();

    // Live update every second
    setInterval(() => {
        renderUI();
    }, 1000);

    // Refresh timesheet row every 3 minutes in background
    setInterval(() => {
        fetchTimesheetData();
    }, 1000 * 60 * 3);
})();