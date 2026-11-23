// SmartNTech — Python articles
// Format: [id, date, emoji, readTime, title, excerpt, body]
snt('Python', 'from-sky-400 to-yellow-400', [

['py1', '2026-11-23', '🐍', '8 min', 'Python for Beginners: Variables, Lists, Loops and Functions',
'Install Python and learn the core building blocks with small, runnable examples.',
`Python is one of the easiest programming languages to learn and one of the most useful. It powers data science, AI, automation scripts, web backends and much more. This guide covers the basics you need to start writing real programs.

## Install Python
Download Python 3 from **python.org**. On Windows, tick **Add Python to PATH** during installation. Then open a terminal and check:

~~~bash
python --version
~~~

Write code in VS Code with the Python extension, or try short snippets in the interactive shell by typing [[python]].

## Variables and data types
Python does not need type declarations. The type comes from the value:

~~~python
name = "Asha"        # str
age = 25             # int
price = 499.99       # float
is_active = True     # bool
~~~

Use [[type(age)]] to check a value's type. Use **f-strings** to build text:

~~~python
print(f"{name} is {age} years old")
~~~

## Lists and dictionaries
A **list** holds an ordered collection:

~~~python
skills = ["Python", "SQL", "Git"]
skills.append("Docker")
print(skills[0])      # Python
print(len(skills))    # 4
~~~

A **dictionary** stores key-value pairs:

~~~python
user = {"name": "Ravi", "city": "Pune"}
user["age"] = 30
print(user.get("city"))
~~~

## Conditions

~~~python
marks = 82
if marks >= 90:
    grade = "A"
elif marks >= 75:
    grade = "B"
else:
    grade = "C"
~~~

Indentation is part of Python's syntax. Use four spaces consistently.

## Loops

~~~python
for skill in skills:
    print("I know", skill)

count = 0
while count < 3:
    count += 1
~~~

[[range(5)]] gives the numbers 0 to 4, which is handy for counting loops.

## Functions

~~~python
def gst_price(amount, rate=0.18):
    return round(amount * (1 + rate), 2)

print(gst_price(1000))        # 1180.0
print(gst_price(1000, 0.05))  # 1050.0
~~~

Default parameter values, like [[rate=0.18]], make functions flexible.

## List comprehensions
A compact way to build lists:

~~~python
squares = [n * n for n in range(1, 6)]
evens = [n for n in range(20) if n % 2 == 0]
~~~

## Handling errors

~~~python
try:
    number = int(input("Enter a number: "))
except ValueError:
    print("That is not a valid number")
~~~

## What to build next
Practice with small projects: a number guessing game, a to-do list saved to a file, a unit converter, or a script that renames files in a folder. Then explore libraries such as **requests** for APIs, **pandas** for data and **FastAPI** for web services.`],

['py2', '2026-11-22', '🐼', '8 min', 'Python Data Analysis with Pandas: A Practical Introduction',
'Load, clean, filter, group and visualize data from CSV and Excel files.',
`Pandas is the most popular Python library for working with tables of data. If you use Excel for reports, pandas can automate the same work in seconds and handle files far too large for a spreadsheet.

## Install

~~~bash
pip install pandas openpyxl matplotlib
~~~

## Load data

~~~python
import pandas as pd

df = pd.read_csv("sales.csv")
# or: df = pd.read_excel("sales.xlsx")

print(df.head())     # first 5 rows
print(df.shape)      # (rows, columns)
df.info()            # column types and missing values
~~~

A **DataFrame** is a table. Each column is a **Series**.

## Select and filter

~~~python
df["amount"]                         # one column
df[["region", "amount"]]             # several columns
big = df[df["amount"] > 10000]       # rows matching a condition
north = df[(df["region"] == "North") & (df["amount"] > 5000)]
~~~

Use [[&]] for AND and [[|]] for OR, with each condition in parentheses.

## Clean the data
Real data is messy. Common fixes:

~~~python
df = df.drop_duplicates()
df["region"] = df["region"].str.strip().str.title()
df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
df["date"] = pd.to_datetime(df["date"])
df = df.dropna(subset=["amount"])
~~~

[[errors="coerce"]] turns invalid numbers into missing values instead of crashing.

## Add calculated columns

~~~python
df["amount_with_gst"] = df["amount"] * 1.18
df["month"] = df["date"].dt.to_period("M")
~~~

## Group and summarize
This is where pandas shines, much like a pivot table:

~~~python
summary = (
    df.groupby("region")["amount"]
      .agg(["count", "sum", "mean"])
      .sort_values("sum", ascending=False)
)
print(summary)

monthly = df.pivot_table(index="month", columns="region", values="amount", aggfunc="sum")
~~~

## Sort and rank

~~~python
top10 = df.sort_values("amount", ascending=False).head(10)
~~~

## Visualize

~~~python
import matplotlib.pyplot as plt

monthly.plot(kind="line", figsize=(10, 5), title="Monthly sales by region")
plt.tight_layout()
plt.savefig("monthly_sales.png")
~~~

## Save the results

~~~python
summary.to_excel("summary.xlsx")
top10.to_csv("top10.csv", index=False)
~~~

## Tips
- Avoid looping over rows with for loops; vectorized operations on whole columns are much faster.
- Use [[df.copy()]] when you want to modify a filtered subset safely.
- Jupyter Notebook or VS Code notebooks are great for exploring data step by step.

With a few lines of pandas, a report that took an hour in Excel can run automatically every morning.`],

['py3', '2026-11-21', '⚡', '8 min', 'Build a REST API with Python FastAPI',
'Create fast, documented APIs with type hints, validation and automatic Swagger docs.',
`FastAPI is a modern Python web framework for building APIs. It is fast, easy to learn and generates interactive documentation automatically from your code. It has become one of the most popular choices for Python backends and AI services.

## Install and run

~~~bash
pip install "fastapi[standard]"
~~~

Create [[main.py]]:

~~~python
from fastapi import FastAPI

app = FastAPI(title="SmartNTech Notes API")

@app.get("/api/health")
def health():
    return {"status": "ok"}
~~~

Run it in development mode:

~~~bash
fastapi dev main.py
~~~

Open **http://127.0.0.1:8000/docs** to see interactive Swagger documentation where you can try every endpoint.

## Request and response models
FastAPI uses **Pydantic** models with Python type hints for validation:

~~~python
from pydantic import BaseModel, Field

class NoteIn(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    body: str = ""

class Note(NoteIn):
    id: int
~~~

If a client sends invalid data, FastAPI automatically returns a clear 422 error explaining which field is wrong.

## CRUD endpoints

~~~python
from fastapi import HTTPException, status

notes: dict[int, Note] = {}
next_id = 1

@app.get("/api/notes")
def list_notes() -> list[Note]:
    return list(notes.values())

@app.get("/api/notes/{note_id}")
def get_note(note_id: int) -> Note:
    if note_id not in notes:
        raise HTTPException(status_code=404, detail="Note not found")
    return notes[note_id]

@app.post("/api/notes", status_code=status.HTTP_201_CREATED)
def create_note(data: NoteIn) -> Note:
    global next_id
    note = Note(id=next_id, **data.model_dump())
    notes[next_id] = note
    next_id += 1
    return note

@app.delete("/api/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int):
    notes.pop(note_id, None)
~~~

Path parameters such as [[note_id: int]] are converted and validated automatically.

## Query parameters

~~~python
@app.get("/api/search")
def search(q: str, limit: int = 10):
    return [n for n in notes.values() if q.lower() in n.title.lower()][:limit]
~~~

## Async endpoints
For I/O-heavy work such as calling other APIs or databases, define endpoints with [[async def]] and use async libraries like **httpx** to handle many requests efficiently.

## Add a database
Replace the dictionary with a real database using **SQLModel** or **SQLAlchemy** with PostgreSQL. Use FastAPI's dependency injection with [[Depends]] to provide a database session to each request.

## CORS for front-end apps

~~~python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(CORSMiddleware, allow_origins=["https://www.example.com"], allow_methods=["*"], allow_headers=["*"])
~~~

## Deploy
Run in production with [[fastapi run main.py]] or Uvicorn behind a reverse proxy, or package it in a Docker container for Cloud Run, Render or Railway.

FastAPI's combination of speed, validation and automatic docs makes it an excellent first backend framework for Python developers.`],

]);
