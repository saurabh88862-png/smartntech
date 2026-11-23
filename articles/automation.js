// SmartNTech — Automation articles
// Format: [id, date, emoji, readTime, title, excerpt, body]
snt('Automation', 'from-emerald-400 to-cyan-600', [

['au1', '2026-11-23', '⚙️', '7 min', 'Automation for Beginners: Save Hours with Scripts and No-Code Tools',
'Find repetitive tasks, pick the right tool and automate them safely.',
`If you do the same task on a computer more than a few times a week, it can probably be automated. Automation saves time, reduces mistakes and frees you for work that actually needs your attention. Here is how to get started, even without being an expert programmer.

## Step 1: Find tasks worth automating
Good candidates are tasks that are:
- **Repetitive:** renaming files, copying data between sheets, sending the same report.
- **Rule-based:** "if an invoice arrives, save the attachment to this folder".
- **Frequent:** daily or weekly.
- **Error-prone:** manual copy-paste of numbers.

A simple test: time a task, multiply by how often you do it in a year, and compare that with the time needed to automate it.

## Step 2: Choose the right type of tool
**No-code and low-code tools**
- **Zapier, Make or n8n:** connect web apps. For example, when a form is submitted, add a row to a spreadsheet and send a Slack message.
- **Microsoft Power Automate:** automate Outlook, Excel, SharePoint and Teams workflows, plus desktop tasks on Windows.
- **Spreadsheet features:** formulas, macros and scheduled scripts in Google Sheets or Excel.

**Scripting**
- **Python:** the best all-rounder for files, Excel, PDFs, web APIs, emails and data processing.
- **PowerShell or Bash:** system administration, server tasks and file operations.

**Browser automation**
- **Playwright or Selenium:** control a real browser for testing or repetitive web workflows.

## Step 3: Start small
Automate one clear task end to end before building something bigger. A tiny Python example that organizes a messy Downloads folder by file type:

~~~python
from pathlib import Path
import shutil

downloads = Path.home() / "Downloads"
for file in downloads.iterdir():
    if file.is_file():
        folder = downloads / (file.suffix[1:].lower() or "other")
        folder.mkdir(exist_ok=True)
        shutil.move(str(file), folder / file.name)
~~~

## Step 4: Schedule it
- **Windows Task Scheduler** runs scripts at set times.
- **cron** does the same on Linux and macOS.
- **GitHub Actions** can run scheduled jobs in the cloud.
- No-code tools have built-in schedules and triggers.

## Step 5: Make it safe and reliable
- **Test on copies** of files before running on real data.
- **Log what happens** so you can see what the script did.
- **Handle errors** and send yourself a notification if a run fails.
- **Keep secrets safe:** store passwords and API keys in environment variables or a secrets manager, never inside the script.
- **Respect rules:** follow website terms of service and company policies; prefer official APIs over scraping.

## Ideas to try
- Generate and email a weekly sales summary from Excel.
- Rename hundreds of photos using their date.
- Back up important folders to cloud storage every night.
- Collect form responses into a database automatically.
- Check a list of website links and report broken ones.

## The mindset
Automation is a skill that compounds. Every small script you write saves time forever and teaches you something for the next one. Start with one annoying task this week.`],

['au2', '2026-11-22', '📊', '8 min', 'Automate Excel and File Tasks with Python',
'Read, update and create Excel reports, merge files and rename folders automatically.',
`Excel work often involves the same steps every week: combine files, clean columns, calculate totals and send a report. Python can do all of this in seconds, without mistakes. This guide uses **pandas** and **openpyxl**.

## Install

~~~bash
pip install pandas openpyxl
~~~

## Combine many Excel files into one
Suppose each branch sends a monthly file with the same columns:

~~~python
from pathlib import Path
import pandas as pd

folder = Path("reports/november")
frames = []
for file in folder.glob("*.xlsx"):
    df = pd.read_excel(file)
    df["branch"] = file.stem          # file name without extension
    frames.append(df)

combined = pd.concat(frames, ignore_index=True)
combined.to_excel("november_all_branches.xlsx", index=False)
~~~

## Clean and summarize

~~~python
combined["amount"] = pd.to_numeric(combined["amount"], errors="coerce").fillna(0)
summary = combined.groupby("branch")["amount"].sum().reset_index()
summary = summary.sort_values("amount", ascending=False)
~~~

## Write a multi-sheet report

~~~python
with pd.ExcelWriter("november_report.xlsx", engine="openpyxl") as writer:
    summary.to_excel(writer, sheet_name="Summary", index=False)
    combined.to_excel(writer, sheet_name="All data", index=False)
~~~

## Format cells with openpyxl
Make the report look professional:

~~~python
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill

wb = load_workbook("november_report.xlsx")
ws = wb["Summary"]
for cell in ws[1]:
    cell.font = Font(bold=True, color="FFFFFF")
    cell.fill = PatternFill("solid", fgColor="4F46E5")
ws.column_dimensions["A"].width = 20
ws.column_dimensions["B"].width = 15
for row in ws.iter_rows(min_row=2, min_col=2, max_col=2):
    row[0].number_format = "#,##0.00"
wb.save("november_report.xlsx")
~~~

## Update a value in an existing workbook

~~~python
wb = load_workbook("targets.xlsx")
ws = wb.active
ws["C2"] = 150000
wb.save("targets.xlsx")
~~~

Note: openpyxl writes formulas as text, and Excel calculates them when the file is opened.

## Rename files in bulk

~~~python
from pathlib import Path

for i, file in enumerate(sorted(Path("invoices").glob("*.pdf")), start=1):
    file.rename(file.with_name(f"invoice_{i:03d}.pdf"))
~~~

## Run it automatically
Save the script as [[monthly_report.py]] and schedule it with Windows Task Scheduler:
1. Open Task Scheduler and choose **Create Basic Task**.
2. Pick a trigger, for example monthly on day 1.
3. Action: start a program, [[python]], with the script path as the argument.

## Best practices
- Keep the original files untouched; write results to new files.
- Validate inputs: check that expected columns exist before processing.
- Log row counts so you can spot missing data.
- Store file paths in a small config section at the top of the script.

What used to take an afternoon of copy-paste becomes a one-click, or zero-click, task.`],

['au3', '2026-11-21', '🎭', '8 min', 'Selenium and Playwright: Browser Automation and Testing Guide',
'Automate web browsers to test your apps and run repetitive web tasks.',
`Browser automation lets code control a real web browser: open pages, click buttons, fill forms and check results. It is essential for testing web applications and useful for repetitive web workflows. The two most popular tools are **Selenium** and **Playwright**.

## Selenium vs Playwright
- **Selenium:** the long-established standard, with support for many languages (Java, Python, C#, JavaScript) and a huge community. Widely used in enterprise QA teams.
- **Playwright:** a newer framework from Microsoft. It automatically waits for elements, runs fast, supports Chromium, Firefox and WebKit, and includes excellent debugging tools.

For new projects, Playwright is often easier. Selenium remains valuable because many companies use it, especially with Java.

## Playwright with Python

~~~bash
pip install pytest-playwright
playwright install
~~~

A test for a login page of your own application:

~~~python
from playwright.sync_api import Page, expect

def test_login_shows_dashboard(page: Page):
    page.goto("http://localhost:3000/login")
    page.get_by_label("Email").fill("test.user@example.com")
    page.get_by_label("Password").fill("test-password-123")
    page.get_by_role("button", name="Sign in").click()
    expect(page.get_by_role("heading", name="Dashboard")).to_be_visible()
~~~

Run with [[pytest]]. Playwright waits automatically for elements to appear and be clickable, which removes most flaky timing issues.

## Selenium with Java

~~~java
WebDriver driver = new ChromeDriver();
try {
    driver.get("http://localhost:3000/login");
    driver.findElement(By.id("email")).sendKeys("test.user@example.com");
    driver.findElement(By.id("password")).sendKeys("test-password-123");
    driver.findElement(By.cssSelector("button[type=submit]")).click();

    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    wait.until(ExpectedConditions.visibilityOfElementLocated(By.tagName("h1")));
} finally {
    driver.quit();
}
~~~

Recent Selenium versions download the correct browser driver automatically through Selenium Manager.

## Choosing good locators
Fragile selectors are the main cause of broken tests. In order of preference:
1. Accessible roles and labels, such as "button named Sign in".
2. Dedicated test attributes like [[data-testid="submit-order"]].
3. Stable ids.
4. Avoid long CSS or XPath chains that depend on page layout.

## The Page Object pattern
Wrap each page in a class with meaningful methods such as [[login(email, password)]]. Tests then read like user stories, and when the page changes you only update one place.

## Useful Playwright features
- **Codegen:** [[playwright codegen http://localhost:3000]] records your clicks and generates test code.
- **Trace viewer:** replays a failed test step by step with screenshots and network logs.
- **Screenshots and videos** on failure.
- **Parallel runs** across browsers to finish suites quickly.

## Run tests in CI
Add your test suite to GitHub Actions so every pull request is checked automatically in headless browsers.

## Use automation responsibly
- Automate your **own applications** or sites where you have permission.
- Follow website terms of service and robots rules; prefer official APIs for data.
- Never automate CAPTCHA solving, account creation at scale or anything that bypasses security controls.
- Use **test accounts and test data**, never real customer credentials.

## Getting started
Pick one critical user flow in your app, such as sign-up or checkout, and write a single end-to-end test for it. Once it runs reliably in CI, add the next flow. A small, stable test suite is far more valuable than a large, flaky one.`],

]);
