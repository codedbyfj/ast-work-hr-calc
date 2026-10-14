# Tracking Work Hours - Chrome Extension

Chrome extension to track daily work hours, remaining time, completion time, lunch, and break durations across the ArsenalTech EMS portal.

---

## How To Install in Chrome

1. Download or clone this repository to a folder on your computer.
2. Open Google Chrome and navigate to: `chrome://extensions/`
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click the **Load unpacked** button in the top-left area.
5. Select the repository folder containing the `manifest.json` file.
6. The extension is now installed and active!

---

## Features (Version 1.0)

- **Floating Widget**: A fixed, unobtrusive floating button in the bottom-right corner displaying your live remaining time.
- **Interactive Details Card**: Click the floating button on any EMS page to view:
  - **Time Left** (countdown) or **Completed At / Additional Time** (overtime tracking).
  - **Completes at** target time.
  - **Lunch** and **Break** duration badges.
- **All EMS Pages Supported**: Automatically works on all pages under `https://corp.arsenaltech.com/ems/*` (Detailed Report, Dashboard, View Timesheet, etc.).
- **Graceful States**: Informative notices when not checked in yet or when timesheet data is unavailable.
- **Manifest V3 Compliant**: Uses modern Chrome extension standards with host permissions.
