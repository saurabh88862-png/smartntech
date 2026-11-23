// SmartNTech — JavaScript articles
// Format: [id, date, emoji, readTime, title, excerpt, body]
snt('JavaScript', 'from-amber-400 to-orange-600', [

['js1', '2026-11-17', '🟨', '7 min', 'JavaScript Basics: Variables with let, const and var',
'Why modern JavaScript avoids var, and how block scope and hoisting really work.',
`Variables are the first thing you learn in any language, but JavaScript has three ways to declare them. Choosing the right one prevents a whole class of confusing bugs.

## const: the default choice
Use [[const]] for any value you will not reassign. It makes your intent clear and protects you from accidental changes.

~~~js
const siteName = 'SmartNTech';
const maxUsers = 100;
~~~

Note that [[const]] prevents reassignment, not mutation. You can still change the contents of an object or array:

~~~js
const user = { name: 'Asha' };
user.name = 'Ravi';   // allowed
// user = {};         // TypeError: assignment to constant variable
~~~

## let: when the value changes
Use [[let]] for counters, accumulators and values that change over time.

~~~js
let total = 0;
for (let i = 1; i <= 5; i++) {
  total += i;
}
~~~

## var: the legacy keyword
[[var]] was the only option before ES2015. It has two surprising behaviors that cause bugs.

**1. Function scope instead of block scope.** A [[var]] declared inside an if block or loop is visible outside it:

~~~js
if (true) {
  var message = 'hi';
}
console.log(message); // 'hi' — leaked out of the block
~~~

**2. Hoisting with undefined.** Declarations are moved to the top of the function, so you can read a [[var]] before it is assigned and silently get [[undefined]]:

~~~js
console.log(count); // undefined, no error
var count = 5;
~~~

[[let]] and [[const]] are also hoisted, but they sit in a **temporal dead zone** until the declaration line runs. Reading them early throws a clear [[ReferenceError]], which is much easier to debug.

## The classic loop bug
With [[var]], all callbacks in a loop share the same variable:

~~~js
for (var i = 0; i < 3; i++) {
  setTimeout(function () { console.log(i); }, 100);
}
// prints 3, 3, 3
~~~

Change [[var]] to [[let]] and each iteration gets its own copy, printing 0, 1, 2.

## Naming conventions
- Use **camelCase** for variables and functions: [[userName]], [[getTotal]].
- Use **UPPER_SNAKE_CASE** for true constants that never change: [[API_URL]].
- Choose descriptive names. [[daysUntilExpiry]] is far better than [[d]].

## Summary
Use [[const]] by default, [[let]] when you must reassign, and avoid [[var]] in new code. Most linters, such as ESLint, can enforce this rule automatically.`],

['js2', '2026-11-11', '🔁', '8 min', 'JavaScript Array Methods: map, filter, reduce and More',
'Transform and analyze data with the array methods every developer uses daily.',
`Arrays are everywhere in JavaScript: lists of products, API results, form fields. Modern array methods let you process them in clean, readable chains instead of manual loops.

## forEach: do something with each item

~~~js
const fruits = ['apple', 'mango', 'banana'];
fruits.forEach(function (fruit, index) {
  console.log(index + ': ' + fruit);
});
~~~

[[forEach]] returns nothing. Use it for side effects such as logging or updating the DOM.

## map: transform every item
[[map]] returns a new array of the same length.

~~~js
const prices = [100, 250, 499];
const withGst = prices.map(p => Math.round(p * 1.18));
// [118, 295, 589]
~~~

## filter: keep only matching items

~~~js
const products = [
  { name: 'Laptop', price: 55000, inStock: true },
  { name: 'Mouse', price: 499, inStock: false },
  { name: 'Keyboard', price: 1299, inStock: true }
];
const available = products.filter(p => p.inStock);
~~~

## reduce: combine items into one value
[[reduce]] takes a callback and a starting value. It is ideal for totals, counts and grouping.

~~~js
const cartTotal = products.reduce((sum, p) => sum + p.price, 0);
// 56798
~~~

Grouping by a property:

~~~js
const byStock = products.reduce((groups, p) => {
  const key = p.inStock ? 'available' : 'soldOut';
  (groups[key] = groups[key] || []).push(p.name);
  return groups;
}, {});
~~~

## find and findIndex
[[find]] returns the first matching item, or [[undefined]]. [[findIndex]] returns its position, or -1.

~~~js
const mouse = products.find(p => p.name === 'Mouse');
~~~

## some and every
- [[some]] returns true if at least one item matches.
- [[every]] returns true only if all items match.

~~~js
products.some(p => p.price > 50000);  // true
products.every(p => p.price > 100);   // true
~~~

## includes, sort and flat
- [[includes]] checks whether a value exists: [[fruits.includes('mango')]].
- [[sort]] sorts in place. For numbers always pass a compare function: [[nums.sort((a, b) => a - b)]], otherwise values are compared as strings.
- [[flat]] flattens nested arrays one level deep.

## Chaining methods
Because [[map]] and [[filter]] return new arrays, you can chain them:

~~~js
const names = products
  .filter(p => p.inStock)
  .map(p => p.name.toUpperCase());
// ['LAPTOP', 'KEYBOARD']
~~~

## Immutability tip
[[map]], [[filter]] and [[reduce]] do not change the original array, which makes them safe in React state updates. [[sort]], [[reverse]] and [[splice]] do mutate it. In modern browsers you can use [[toSorted()]] and [[toReversed()]] to get sorted copies instead.`],

['js3', '2026-11-05', '🧭', '8 min', 'DOM Manipulation in JavaScript: Select, Change and Create Elements',
'Build interactive pages with querySelector, classList, events and createElement.',
`The Document Object Model (DOM) is the browser's live representation of your HTML page. JavaScript can read and change it, which is how buttons open menus, forms validate input and tools like our word counter update instantly.

## Selecting elements
- [[document.getElementById('title')]] returns one element by id.
- [[document.querySelector('.card')]] returns the first element matching any CSS selector.
- [[document.querySelectorAll('li')]] returns all matches as a NodeList.

~~~js
const heading = document.querySelector('h1');
const buttons = document.querySelectorAll('.btn');
buttons.forEach(btn => console.log(btn.textContent));
~~~

## Changing content
- [[textContent]] sets plain text and is safe from HTML injection.
- [[innerHTML]] parses HTML. Never use it with text typed by users, because it can run malicious scripts (an XSS attack).

~~~js
heading.textContent = 'Welcome to SmartNTech';
~~~

## Changing styles and classes
Prefer toggling CSS classes over setting inline styles:

~~~js
const box = document.querySelector('#box');
box.classList.add('active');
box.classList.remove('hidden');
box.classList.toggle('dark');
box.classList.contains('active'); // true
~~~

## Working with attributes and form values

~~~js
const link = document.querySelector('a');
link.setAttribute('target', '_blank');

const email = document.querySelector('#email').value.trim();
~~~

## Creating and removing elements

~~~js
const list = document.querySelector('#todo-list');
const item = document.createElement('li');
item.textContent = 'Learn the DOM';
item.className = 'todo-item';
list.append(item);

// later
item.remove();
~~~

When adding many elements, build them in a [[DocumentFragment]] first and append once. This avoids repeated layout recalculations and keeps the page fast.

## Handling events

~~~js
const button = document.querySelector('#save');
button.addEventListener('click', function (event) {
  console.log('Saved!');
});
~~~

Common events include [[click]], [[input]], [[submit]], [[keydown]], [[change]] and [[scroll]]. For forms, call [[event.preventDefault()]] inside the submit handler to stop the page from reloading.

## Event delegation
Instead of attaching a listener to every list item, attach one listener to the parent and check the target:

~~~js
list.addEventListener('click', function (e) {
  if (e.target.matches('.todo-item')) {
    e.target.classList.toggle('done');
  }
});
~~~

This also works for items added later, and it uses less memory.

## Wait for the DOM to load
Place your script at the end of the body, add the [[defer]] attribute to the script tag, or listen for [[DOMContentLoaded]] so elements exist before you select them.`],

['js4', '2026-10-30', '🎯', '7 min', 'JavaScript Closures Explained with Real Examples',
'What closures are, why they matter and how they power counters, privacy and callbacks.',
`Closures sound intimidating, but you use them every time you write a callback. Once you understand them, many JavaScript patterns suddenly make sense.

## The definition
A **closure** is a function that remembers the variables from the place where it was created, even after that outer function has finished running.

~~~js
function makeGreeter(greeting) {
  return function (name) {
    return greeting + ', ' + name + '!';
  };
}

const sayHello = makeGreeter('Hello');
const sayNamaste = makeGreeter('Namaste');

sayHello('Asha');    // 'Hello, Asha!'
sayNamaste('Ravi');  // 'Namaste, Ravi!'
~~~

[[makeGreeter]] has already returned, yet the inner function still remembers [[greeting]]. That memory is the closure.

## Example 1: a private counter
JavaScript did not have private class fields for many years, so closures were used to hide data:

~~~js
function createCounter() {
  let count = 0;
  return {
    increment() { count++; return count; },
    reset() { count = 0; }
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
// count cannot be changed directly from outside
~~~

## Example 2: event handlers
Each button remembers its own label:

~~~js
['Save', 'Delete'].forEach(function (label) {
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.addEventListener('click', function () {
    console.log(label + ' clicked');
  });
  document.body.append(btn);
});
~~~

## Example 3: debounce
Debouncing waits until the user stops typing before running a search. The timer id lives in a closure:

~~~js
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const search = debounce(q => console.log('Searching', q), 300);
~~~

## Example 4: memoization
A closure can cache expensive results:

~~~js
function memoize(fn) {
  const cache = {};
  return function (n) {
    if (!(n in cache)) cache[n] = fn(n);
    return cache[n];
  };
}
~~~

## A common pitfall
Closures keep variables alive. If a closure references a large object and you store the closure for a long time, that object cannot be garbage collected. Remove event listeners and clear timers when they are no longer needed.

## Interview answer in one line
"A closure is a function bundled together with references to its surrounding scope, which lets it access outer variables even after the outer function has returned."`],

['js5', '2026-10-24', '✨', '8 min', 'ES6+ Features Every JavaScript Developer Should Know',
'Arrow functions, destructuring, spread, optional chaining, modules and more.',
`ECMAScript 2015 (ES6) and the yearly releases after it transformed JavaScript into a modern language. These features appear in almost every codebase and tutorial, so learning them is essential.

## Arrow functions
Shorter syntax, and they do not have their own [[this]], which makes them great for callbacks:

~~~js
const square = n => n * n;
const add = (a, b) => a + b;
~~~

## Destructuring
Pull values out of objects and arrays in one line:

~~~js
const user = { name: 'Asha', city: 'Pune', age: 28 };
const { name, city } = user;

const [first, second] = ['red', 'green', 'blue'];
~~~

You can also set defaults and rename: [[const { role = 'guest', name: userName } = user;]]

## Spread and rest
The spread operator [[...]] copies or merges arrays and objects:

~~~js
const base = { theme: 'light', lang: 'en' };
const settings = { ...base, theme: 'dark' }; // overrides theme

const all = [...[1, 2], ...[3, 4]]; // [1, 2, 3, 4]
~~~

The same syntax in function parameters collects remaining arguments: [[function sum(...nums) {}]]

## Default parameters

~~~js
function greet(name = 'friend') {
  return 'Hello, ' + name;
}
~~~

## Optional chaining and nullish coalescing
Safely read deeply nested data from APIs:

~~~js
const pin = order?.customer?.address?.pincode;
const pageSize = settings.pageSize ?? 20;
~~~

[[??]] only falls back when the value is [[null]] or [[undefined]], unlike [[||]], which also replaces [[0]] and empty strings.

## Classes
Cleaner syntax for constructor functions, including private fields with [[#]]:

~~~js
class Account {
  #balance = 0;
  deposit(amount) { this.#balance += amount; }
  get balance() { return this.#balance; }
}
~~~

## Modules
Split code into files with [[export]] and [[import]]:

~~~js
// math.js
export function add(a, b) { return a + b; }

// app.js
import { add } from './math.js';
~~~

In the browser, load the entry file with [[type="module"]] on the script tag.

## Other useful additions
- **Promises and async/await** for asynchronous code.
- **Map and Set** for key-value data and unique values.
- **Array.prototype.at(-1)** to read the last item.
- **Object.entries and Object.fromEntries** to convert between objects and arrays.
- **structuredClone** to deep-copy objects.

## Browser support
All of these work in current versions of Chrome, Edge, Firefox and Safari. If you must support very old browsers, a build tool such as Vite or Babel can convert modern syntax automatically.`],

['js6', '2026-10-18', '🌐', '8 min', 'Fetch API in JavaScript: Calling REST APIs the Right Way',
'GET and POST requests, JSON, headers, error handling and loading states.',
`Almost every modern web app talks to a server. The built-in [[fetch]] function lets you call REST APIs directly from the browser without any library.

## A simple GET request

~~~js
async function loadPosts() {
  const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
  const posts = await response.json();
  console.log(posts);
}
~~~

[[fetch]] returns a Promise that resolves to a Response object. Calling [[response.json()]] reads the body and parses it as JSON, which is also asynchronous.

## Always check response.ok
This is the most common mistake. [[fetch]] only rejects on network failures. A 404 or 500 response still resolves successfully, so you must check the status yourself:

~~~js
const response = await fetch('/api/products/99');
if (!response.ok) {
  throw new Error('Request failed with status ' + response.status);
}
const product = await response.json();
~~~

## Sending data with POST

~~~js
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Asha', message: 'Hello!' })
});
~~~

Use [[PUT]] or [[PATCH]] for updates and [[DELETE]] for removals in the same way.

## Adding authentication
Many APIs require a token in a header:

~~~js
fetch('/api/orders', {
  headers: { Authorization: 'Bearer ' + token }
});
~~~

Never put secret API keys in front-end code. Anyone can read them in the browser's developer tools. Call such APIs through your own backend instead.

## A complete pattern with loading and errors

~~~js
async function showUsers() {
  const box = document.querySelector('#users');
  box.textContent = 'Loading...';
  try {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const users = await res.json();
    box.textContent = '';
    users.forEach(u => {
      const li = document.createElement('li');
      li.textContent = u.name;
      box.append(li);
    });
  } catch (err) {
    box.textContent = 'Could not load users. Please try again.';
    console.error(err);
  }
}
~~~

## Timeouts and cancelling
Use [[AbortController]] to cancel slow requests, for example when a user types a new search:

~~~js
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
await fetch('/api/search?q=java', { signal: controller.signal });
~~~

Newer browsers also support [[AbortSignal.timeout(5000)]] as a shortcut.

## CORS errors
If the browser blocks a request with a CORS error, the server is not allowing your website's origin. This must be fixed on the server by sending the correct [[Access-Control-Allow-Origin]] header. It cannot be fixed from front-end code.`],

['js7', '2026-10-12', '🔄', '7 min', 'The JavaScript Event Loop Explained Visually',
'Call stack, Web APIs, callback queue and microtasks: why setTimeout 0 runs later.',
`JavaScript runs on a single thread, yet it handles timers, network requests and user clicks without freezing. The secret is the **event loop**. Understanding it explains many puzzling outputs and is a favorite interview topic.

## The call stack
The call stack keeps track of which function is currently running. When you call a function, it is pushed onto the stack. When it returns, it is popped off. JavaScript can only run what is on top of the stack, one thing at a time.

## Web APIs
Slow operations such as [[setTimeout]], [[fetch]] and DOM events are not handled by the JavaScript engine itself. The browser (or Node.js) handles them in the background. When they finish, their callbacks are placed in a queue.

## Task queue and microtask queue
There are two important queues:
- **Task queue (macrotasks):** callbacks from [[setTimeout]], [[setInterval]], and user events.
- **Microtask queue:** Promise callbacks ([[then]], [[catch]], code after [[await]]) and [[queueMicrotask]].

## How the loop works
1. Run all synchronous code until the call stack is empty.
2. Run **every** microtask in the microtask queue.
3. Let the browser render if needed.
4. Take **one** task from the task queue and run it.
5. Repeat.

## The classic puzzle

~~~js
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');
~~~

The output is **1, 4, 3, 2**:
- 1 and 4 are synchronous and run first.
- 3 is a microtask, so it runs as soon as the stack is empty.
- 2 is a task. Even with a 0 ms delay, it must wait for all microtasks to finish.

## async/await follows the same rules

~~~js
async function demo() {
  console.log('A');
  await null;
  console.log('B');
}
demo();
console.log('C');
// A, C, B
~~~

Everything after [[await]] is scheduled as a microtask.

## Why this matters in real apps
- **Long synchronous code blocks everything.** A loop that runs for two seconds freezes clicks, scrolling and animations. Split heavy work into chunks or move it to a **Web Worker**.
- **Endless microtasks can starve rendering.** A Promise chain that keeps scheduling more microtasks prevents the page from repainting.
- **Timers are not exact.** [[setTimeout(fn, 1000)]] means "at least 1000 ms", not exactly 1000 ms.

## Key takeaway
Synchronous code runs first, then all microtasks, then one task at a time. Keep tasks short and your interface will stay smooth and responsive.`],

['js8', '2026-10-05', '💾', '6 min', 'localStorage vs sessionStorage vs Cookies: Which Should You Use?',
'Store data in the browser safely: limits, lifetimes, security and examples.',
`Web apps often need to remember things: a dark-mode preference, a draft message, or a login session. Browsers offer three main storage options, and each one suits a different job.

## localStorage
- Stores key-value strings with roughly **5 MB** per site.
- Data stays until code or the user clears it, even after the browser is closed.
- Only readable by JavaScript on the same origin.

~~~js
localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme'); // 'dark'
localStorage.removeItem('theme');
~~~

Storage only holds strings, so convert objects with JSON:

~~~js
localStorage.setItem('cart', JSON.stringify([{ id: 1, qty: 2 }]));
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
~~~

## sessionStorage
- Same API and similar size as localStorage.
- Data lasts only for the current browser tab. Closing the tab clears it.
- Each tab has its own separate copy.

It is perfect for temporary data such as a multi-step form in progress.

## Cookies
- Small, at about **4 KB** each.
- Automatically sent to the server with every matching HTTP request.
- Can have an expiry date, and can be restricted to HTTPS or hidden from JavaScript.

~~~js
document.cookie = 'lang=en; max-age=2592000; path=/; SameSite=Lax';
~~~

## Security considerations
- **Never store passwords** or sensitive personal data in any browser storage.
- localStorage and sessionStorage can be read by any script running on your page. If your site has an XSS vulnerability, an attacker can steal everything stored there.
- For login sessions, servers usually set cookies with the **HttpOnly**, **Secure** and **SameSite** flags. HttpOnly cookies cannot be read by JavaScript at all, which protects them from XSS.

## Handle storage failures
Storage can throw errors in private browsing modes, when the quota is full, or when the user blocks site data. Wrap access in try/catch:

~~~js
function safeGet(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}
~~~

## Quick guide
- **User preferences** such as theme or language: localStorage.
- **Temporary data for one tab**: sessionStorage.
- **Authentication sessions**: HttpOnly cookies set by the server.
- **Large or structured data** such as offline files: IndexedDB.

Choosing the right storage keeps your app fast, private and secure.`],

]);
