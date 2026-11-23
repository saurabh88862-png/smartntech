// SmartNTech — React articles
// Format: [id, date, emoji, readTime, title, excerpt, body]
snt('React', 'from-cyan-400 to-blue-600', [

['r1', '2026-11-16', '⚛️', '7 min', 'React for Beginners: Components, JSX and Props',
'Create your first React app with Vite and understand how components fit together.',
`React is a JavaScript library for building user interfaces out of small, reusable pieces called **components**. It is used by companies of every size and is one of the most in-demand front-end skills in India.

## Create a project with Vite
Create React App is no longer recommended. Use Vite, which starts in seconds:

~~~bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
~~~

Open the local URL shown in the terminal and you will see your app running.

## What is a component?
A component is a JavaScript function that returns what should appear on screen:

~~~jsx
function Welcome() {
  return <h1>Welcome to SmartNTech</h1>;
}
~~~

Component names must start with a capital letter so React can tell them apart from HTML tags.

## JSX
The HTML-like syntax inside JavaScript is called **JSX**. It looks like HTML but has a few differences:
- Use [[className]] instead of [[class]].
- Use [[htmlFor]] instead of [[for]] on labels.
- Every tag must be closed, including [[<img />]] and [[<br />]].
- Put JavaScript expressions inside curly braces: [[<p>{2 + 2}</p>]].
- A component must return a single parent element. Use a fragment [[<>...</>]] when you do not want an extra div.

## Props: passing data to components
Props let a parent send data to a child, just like function arguments:

~~~jsx
function ToolCard({ title, description }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function App() {
  return (
    <>
      <ToolCard title="Word Counter" description="Count words instantly" />
      <ToolCard title="JSON Formatter" description="Beautify JSON" />
    </>
  );
}
~~~

Props are **read-only**. A component must never change its own props.

## Rendering lists
Use [[map]] to turn an array into elements, and give each one a unique [[key]]:

~~~jsx
const tools = ['Word Counter', 'JSON Formatter', 'Password Generator'];

function ToolList() {
  return (
    <ul>
      {tools.map(name => <li key={name}>{name}</li>)}
    </ul>
  );
}
~~~

Keys help React update lists efficiently. Avoid using the array index as a key when items can be reordered or deleted.

## Conditional rendering

~~~jsx
{isLoggedIn ? <Dashboard /> : <LoginForm />}
{error && <p className="error">{error}</p>}
~~~

## How to think in React
Break the page into a tree of components: a header, a sidebar, a list, and list items. Each component does one job. Data flows **down** through props. When something needs to change, you use **state**, which is the topic of our next guide on hooks.`],

['r2', '2026-11-09', '🪝', '9 min', 'React Hooks Explained: useState and useEffect with Examples',
'Manage state, side effects and data fetching in function components.',
`Hooks let function components store data and react to changes. The two hooks you will use most are [[useState]] and [[useEffect]].

## useState: remembering values
[[useState]] returns the current value and a function to update it. Updating state makes React re-render the component.

~~~jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
~~~

## Updating based on previous state
If the new value depends on the old one, pass a function. This avoids bugs when several updates happen quickly:

~~~jsx
setCount(prev => prev + 1);
~~~

## State with objects and arrays
Never mutate state directly. Create a new object or array instead:

~~~jsx
const [user, setUser] = useState({ name: '', email: '' });
setUser(prev => ({ ...prev, name: 'Asha' }));

const [items, setItems] = useState([]);
setItems(prev => [...prev, newItem]);
setItems(prev => prev.filter(i => i.id !== idToRemove));
~~~

## useEffect: running side effects
Side effects are anything outside rendering: fetching data, setting timers, subscribing to events or changing the document title.

~~~jsx
import { useEffect } from 'react';

useEffect(() => {
  document.title = 'You clicked ' + count + ' times';
}, [count]);
~~~

## The dependency array
- **No array:** runs after every render. This is rarely what you want.
- **Empty array [[ [] ]]:** runs once after the first render.
- **[[ [count] ]]:** runs after the first render and whenever [[count]] changes.

## Cleanup
Return a function to clean up timers or listeners when the component unmounts or before the effect runs again:

~~~jsx
useEffect(() => {
  const id = setInterval(() => setSeconds(s => s + 1), 1000);
  return () => clearInterval(id);
}, []);
~~~

## Fetching data safely

~~~jsx
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetch('/api/users')
      .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(data => { if (!ignore) setUsers(data); })
      .catch(err => { if (!ignore) setError(err.message); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
~~~

The [[ignore]] flag prevents setting state after the component has unmounted or a newer request has started.

## Rules of hooks
- Call hooks only at the **top level** of a component, never inside loops, conditions or nested functions.
- Call hooks only from React components or custom hooks.

The ESLint plugin for React hooks catches most mistakes automatically, so keep it enabled.`],

['r3', '2026-11-03', '🧰', '8 min', 'useRef, useMemo and useCallback: When to Use Each Hook',
'Access DOM elements, cache expensive calculations and keep functions stable.',
`After [[useState]] and [[useEffect]], three more hooks appear in almost every real React project. Each solves a specific problem, and using them in the wrong place adds complexity without benefit.

## useRef: a box that survives re-renders
[[useRef]] returns an object with a [[current]] property. Changing [[current]] does **not** trigger a re-render.

**Use case 1: accessing a DOM element**

~~~jsx
import { useRef } from 'react';

function SearchBox() {
  const inputRef = useRef(null);
  return (
    <>
      <input ref={inputRef} placeholder="Search..." />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}
~~~

**Use case 2: storing values that should not cause renders**, such as a timer id or the previous value of a prop.

~~~jsx
const timerRef = useRef(null);
timerRef.current = setTimeout(save, 1000);
~~~

## useMemo: caching expensive calculations
[[useMemo]] remembers the result of a calculation and only recomputes it when its dependencies change.

~~~jsx
import { useMemo } from 'react';

function ProductList({ products, query }) {
  const filtered = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query]);

  return <ul>{filtered.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
~~~

Use it when the calculation is genuinely slow, for example filtering or sorting thousands of items. For simple calculations, the overhead of [[useMemo]] is not worth it.

## useCallback: stable function references
Every render creates new function objects. Usually that is fine. It matters when you pass a function to a child wrapped in [[React.memo]], or list it as a dependency of [[useEffect]].

~~~jsx
import { useCallback, memo } from 'react';

const Row = memo(function Row({ item, onDelete }) {
  return <li>{item.name} <button onClick={() => onDelete(item.id)}>Delete</button></li>;
});

function List({ items, setItems }) {
  const handleDelete = useCallback(id => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, [setItems]);

  return <ul>{items.map(i => <Row key={i.id} item={i} onDelete={handleDelete} />)}</ul>;
}
~~~

Without [[useCallback]], [[handleDelete]] would be a new function each render, and every [[Row]] would re-render even though nothing changed.

## The simple rule
- Need to touch the DOM or keep a mutable value without re-rendering? **useRef**.
- Slow calculation running on every render? **useMemo**.
- Passing a callback to a memoized child or into an effect's dependency list? **useCallback**.

## Measure first
Do not wrap everything in these hooks by default. Use the React DevTools Profiler to find components that actually render slowly, then optimize those. The React Compiler, now stable, can also add many of these optimizations automatically.`],

['r4', '2026-10-28', '🗺️', '7 min', 'React Router v6: Navigation, Dynamic Routes and Protected Pages',
'Add multiple pages, URL parameters, nested layouts and login-only routes.',
`Single page applications still need multiple "pages" with their own URLs. React Router is the standard library for this, and version 6 made its API simpler and more powerful.

## Install and set up

~~~bash
npm install react-router-dom
~~~

~~~jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/blog/:slug" element={<Article />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
~~~

The [[*]] route catches any URL that does not match, which is perfect for a 404 page.

## Linking between pages
Use [[Link]] or [[NavLink]] instead of plain anchor tags, so the page does not reload:

~~~jsx
import { NavLink } from 'react-router-dom';

<NavLink to="/tools" className={({ isActive }) => isActive ? 'active' : ''}>
  Tools
</NavLink>
~~~

## Reading URL parameters

~~~jsx
import { useParams } from 'react-router-dom';

function Article() {
  const { slug } = useParams();
  // fetch the article using slug
  return <h1>{slug}</h1>;
}
~~~

For query strings such as [[?page=2]], use the [[useSearchParams]] hook.

## Navigating from code
After a form submits successfully, redirect the user:

~~~jsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/dashboard');
~~~

## Nested routes and shared layouts
Wrap pages in a layout with a header and footer, and render the current page with [[Outlet]]:

~~~jsx
function Layout() {
  return (
    <>
      <Header />
      <main><Outlet /></main>
      <Footer />
    </>
  );
}

<Route element={<Layout />}>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
</Route>
~~~

## Protected routes
Only allow logged-in users into certain pages:

~~~jsx
import { Navigate } from 'react-router-dom';

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

<Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
~~~

Remember that hiding a page in the front end is not real security. The server must also check permissions on every API request.

## Hosting tip
On static hosts, refreshing a deep URL like [[/blog/react-router]] can return a 404 because the server looks for a real file. Configure your host to serve [[index.html]] for all routes. Firebase Hosting, Netlify and Vercel all support this with a simple rewrite rule.`],

['r5', '2026-10-22', '🌍', '8 min', 'React State Management: Context API vs Redux Toolkit vs Zustand',
'Share data across components without prop drilling, and pick the right tool.',
`As apps grow, many components need the same data: the logged-in user, the theme, or the shopping cart. Passing props through five layers of components, known as **prop drilling**, quickly becomes painful. Here are the three most popular solutions.

## Option 1: Context API (built in)
Context lets you provide a value at the top of the tree and read it anywhere below.

~~~jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
~~~

Any component can now call [[const { theme, setTheme } = useTheme();]].

**Best for:** values that change rarely, such as theme, language and the current user.
**Drawback:** every component using the context re-renders when the value changes, which can hurt performance for frequently changing data.

## Option 2: Redux Toolkit
Redux keeps all global state in a single store and changes it through actions. Redux Toolkit removes most of the old boilerplate.

~~~jsx
import { createSlice, configureStore } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {
    addItem: (state, action) => { state.push(action.payload); },
    removeItem: (state, action) => state.filter(i => i.id !== action.payload)
  }
});

export const { addItem, removeItem } = cartSlice.actions;
export const store = configureStore({ reducer: { cart: cartSlice.reducer } });
~~~

Components use [[useSelector]] to read and [[useDispatch]] to update. RTK Query, included in Redux Toolkit, also handles API fetching and caching.

**Best for:** large apps, big teams, and complex state with strict patterns and excellent debugging tools.

## Option 3: Zustand
Zustand is a tiny library with a very simple API:

~~~jsx
import { create } from 'zustand';

const useCart = create(set => ({
  items: [],
  add: item => set(state => ({ items: [...state.items, item] })),
  clear: () => set({ items: [] })
}));

function CartCount() {
  const count = useCart(state => state.items.length);
  return <span>{count}</span>;
}
~~~

Components only re-render when the slice of state they select changes.

**Best for:** small to medium apps that want global state without ceremony.

## What about server data?
Data that comes from an API, such as products or posts, is better handled by a dedicated tool like **TanStack Query** or RTK Query. They manage caching, loading states, refetching and errors for you, so your global store only needs to hold real client state.

## Recommendation
- Start with **useState and props**.
- Add **Context** for a few global values.
- Choose **Zustand** for simple shared client state, or **Redux Toolkit** for large, complex apps.
- Use **TanStack Query** for server data in any case.`],

['r6', '2026-10-16', '📝', '7 min', 'Handling Forms in React: Controlled Inputs and Validation',
'Build sign-up and contact forms with validation, errors and React Hook Form.',
`Forms are where users give your app data, so they need to be reliable, accessible and friendly. React offers a few approaches, from simple controlled inputs to dedicated form libraries.

## Controlled inputs
In a controlled input, React state is the single source of truth:

~~~jsx
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  return (
    <form>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="email" type="email" value={form.email} onChange={handleChange} />
      <textarea name="message" value={form.message} onChange={handleChange} />
    </form>
  );
}
~~~

One [[handleChange]] function works for every field because it uses the input's [[name]] attribute.

## Submitting

~~~jsx
async function handleSubmit(e) {
  e.preventDefault();
  const errors = validate(form);
  if (Object.keys(errors).length) {
    setErrors(errors);
    return;
  }
  setSubmitting(true);
  try {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setForm({ name: '', email: '', message: '' });
  } finally {
    setSubmitting(false);
  }
}
~~~

## Simple validation

~~~jsx
function validate({ name, email, message }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Please enter your name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
  if (message.trim().length < 10) errors.message = 'Message is too short';
  return errors;
}
~~~

Show each error next to its field, and connect it with [[aria-describedby]] so screen readers announce it.

## React Hook Form
For larger forms, **React Hook Form** reduces re-renders and boilerplate:

~~~jsx
import { useForm } from 'react-hook-form';

function SignupForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async data => { await createAccount(data); };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: 'Email is required' })} />
      {errors.email && <p>{errors.email.message}</p>}

      <input type="password" {...register('password', { minLength: { value: 8, message: 'Min 8 characters' } })} />
      {errors.password && <p>{errors.password.message}</p>}

      <button disabled={isSubmitting}>Sign up</button>
    </form>
  );
}
~~~

Pair it with a schema library such as **Zod** to share validation rules between the front end and back end.

## User experience tips
- Disable the submit button while the request is running to prevent double submissions.
- Validate when the user leaves a field, not on every keystroke.
- Keep entered data if the server returns an error.
- Use the correct input types ([[email]], [[tel]], [[number]]) so mobile keyboards adapt.
- Always validate again on the server. Front-end validation is for convenience, not security.`],

['r7', '2026-10-09', '🚀', '8 min', 'React Performance Optimization: 10 Practical Techniques',
'Find slow renders and fix them with memo, code splitting, virtualization and more.',
`React is fast by default, but large apps can still feel sluggish. Before optimizing, measure. Then apply the technique that fits the problem.

## 1. Measure with the React Profiler
Open React DevTools, record an interaction in the Profiler tab, and look for components that render often or take a long time. Optimize only what the data shows is slow.

## 2. Keep state close to where it is used
If typing in a search box re-renders the whole page, move the search state into the search component. State placed too high causes unnecessary re-renders of everything below it.

## 3. Use React.memo for pure components
[[React.memo]] skips re-rendering when props are unchanged:

~~~jsx
const ProductCard = React.memo(function ProductCard({ product }) {
  return <div>{product.name}</div>;
});
~~~

## 4. Stabilize props with useCallback and useMemo
Memoized children still re-render if you pass a new object or function every time. Wrap those values in [[useMemo]] and [[useCallback]].

## 5. Use stable keys in lists
Use a unique id from your data as the [[key]]. Index keys can cause wrong items to update and unnecessary DOM work when lists change.

## 6. Code-split routes and heavy components
Load code only when it is needed:

~~~jsx
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./AdminPanel'));

<Suspense fallback={<p>Loading...</p>}>
  <AdminPanel />
</Suspense>
~~~

This shrinks the initial bundle and improves load time and Core Web Vitals.

## 7. Virtualize long lists
Rendering 5,000 rows creates 5,000 DOM nodes. Libraries such as **TanStack Virtual** or **react-window** render only the rows visible on screen.

## 8. Debounce expensive input handlers
For search-as-you-type, wait until the user pauses before filtering or calling an API. React's [[useDeferredValue]] hook can also keep typing responsive while a slow list updates in the background.

## 9. Optimize images
Use modern formats like WebP, set explicit width and height to avoid layout shift, and add [[loading="lazy"]] for images below the fold.

## 10. Check your bundle
Run a bundle analyzer, such as [[rollup-plugin-visualizer]] for Vite, to find large dependencies. Replace heavy libraries with lighter alternatives or import only the functions you need, for example individual lodash functions instead of the whole package.

## Bonus: the React Compiler
The React Compiler automatically memoizes components and values at build time. In many projects it removes the need for manual [[useMemo]] and [[useCallback]]. Check the official React documentation for setup steps.

## Summary
Measure first, fix the biggest problem, and measure again. Small, focused changes usually give the best results with the least risk.`],

['r8', '2026-10-02', '▲', '9 min', 'Next.js for React Developers: SSR, SSG and the App Router',
'Why Next.js helps SEO, how rendering modes work and how to build your first page.',
`Next.js is a React framework that adds routing, server rendering and performance optimizations out of the box. It is the most popular way to build React sites that need strong SEO, such as blogs, stores and tool websites.

## Why plain React can struggle with SEO
A typical React single page app sends an almost empty HTML file and builds the page in the browser with JavaScript. Google can render JavaScript, but it may take longer to index, and social media previews often fail. Next.js can send fully rendered HTML from the server instead.

## Create a project

~~~bash
npx create-next-app@latest my-site
cd my-site
npm run dev
~~~

## File-based routing with the App Router
Folders inside [[app/]] become URLs:
- [[app/page.js]] is the home page at [[/]].
- [[app/blog/page.js]] is [[/blog]].
- [[app/blog/[slug]/page.js]] is a dynamic route such as [[/blog/react-hooks]].
- [[app/layout.js]] wraps every page with shared HTML, such as the header and footer.

## Rendering modes
- **Static generation (SSG):** pages are built once at build time. They are the fastest and cheapest to serve. Ideal for blog posts and marketing pages.
- **Server-side rendering (SSR):** pages are built on every request. Use this for personalized or constantly changing data.
- **Incremental static regeneration (ISR):** static pages that refresh in the background after a set time, combining speed with fresh content.
- **Client components:** interactive parts that run in the browser, marked with [[use client]] at the top of the file.

## Server components fetch data directly
By default, components in the App Router are **server components**. They can be async and fetch data without [[useEffect]]:

~~~jsx
export default async function BlogPage() {
  const res = await fetch('https://api.example.com/posts', { next: { revalidate: 3600 } });
  const posts = await res.json();
  return (
    <ul>
      {posts.map(p => <li key={p.id}>{p.title}</li>)}
    </ul>
  );
}
~~~

[[revalidate: 3600]] regenerates the page at most once an hour.

## SEO metadata
Export a [[metadata]] object, or a [[generateMetadata]] function for dynamic pages:

~~~jsx
export const metadata = {
  title: 'Free Online Tools | SmartNTech',
  description: 'Word counter, JSON formatter and password generator.'
};
~~~

Next.js also generates sitemaps and robots files from simple configuration files.

## Built-in optimizations
- **next/image** resizes images, serves modern formats and lazy-loads automatically.
- **next/font** self-hosts fonts and prevents layout shift.
- Automatic code splitting per route keeps pages light.

## When to choose Next.js
Choose Next.js for public, content-heavy sites where SEO and fast first loads matter. A plain React app with Vite is still a fine choice for internal dashboards and tools behind a login, where search engines never visit.`],

['r9', '2026-09-25', '🧪', '7 min', 'Testing React Components with Vitest and React Testing Library',
'Write tests that check what users see, not implementation details.',
`Tests give you confidence to refactor and ship without breaking features. The modern standard for React is **Vitest** with **React Testing Library**, which encourages testing components the way users actually use them.

## Install

~~~bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
~~~

In [[vite.config.js]], add a test section:

~~~js
export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: './src/setupTests.js' }
});
~~~

In [[src/setupTests.js]], add [[import '@testing-library/jest-dom';]] to get helpful matchers such as [[toBeInTheDocument]].

## Your first test
Suppose we have a counter component:

~~~jsx
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;
}
~~~

The test:

~~~jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

test('increments when clicked', async () => {
  render(<Counter />);
  const button = screen.getByRole('button', { name: /count: 0/i });
  await userEvent.click(button);
  expect(screen.getByRole('button')).toHaveTextContent('Count: 1');
});
~~~

Run it with [[npx vitest]].

## Query priority
React Testing Library recommends queries that reflect how users find elements:
1. [[getByRole]] with an accessible name, such as buttons, links and headings.
2. [[getByLabelText]] for form fields.
3. [[getByPlaceholderText]] and [[getByText]].
4. [[getByTestId]] only as a last resort.

If you cannot find an element by role or label, that often signals an accessibility problem worth fixing.

## get, query and find
- **getBy** throws if the element is missing. Use it when the element should exist.
- **queryBy** returns null. Use it to assert that something is **not** present.
- **findBy** waits and returns a Promise. Use it for elements that appear after async work.

## Testing async data
Mock the network call, then wait for the result:

~~~jsx
vi.spyOn(global, 'fetch').mockResolvedValue({
  ok: true,
  json: async () => [{ id: 1, name: 'Asha' }]
});

render(<UserList />);
expect(await screen.findByText('Asha')).toBeInTheDocument();
~~~

For larger projects, **Mock Service Worker (MSW)** intercepts requests at the network level and gives more realistic tests.

## What to test
- Important user flows: logging in, submitting forms, adding to cart.
- Edge cases: empty lists, error messages, loading states.
- Bug fixes: write a test that reproduces the bug before fixing it.

## What not to test
Avoid testing internal state variables or which hooks were called. Test the visible result. Tests written this way keep passing when you refactor the implementation.`],

['a2', '2026-11-12', '🏆', '8 min', 'How to Optimize React Apps for a 100 SEO Score',
'Rendering strategy, metadata, Core Web Vitals and crawlable links for React sites.',
`A Lighthouse SEO score of 100 is a good start, but real search performance depends on whether Google can quickly find, render and understand every page. Here is how to get both right in a React application.

## 1. Choose the right rendering strategy
A client-only React app sends an almost empty HTML file and builds the page with JavaScript. Google can render it, but indexing may be slower and social previews often break. For public, content-focused pages, use:
- **Static site generation (SSG)** for articles, documentation and landing pages.
- **Server-side rendering (SSR)** for frequently changing or personalized pages.

Frameworks such as **Next.js**, **Remix** and **Astro** make this straightforward.

## 2. Give every page a unique URL
Each article, tool or product needs its own URL, such as [[/blog/react-hooks-guide]]. Content shown only in pop-ups or tabs on a single URL cannot rank individually.

## 3. Set unique titles and descriptions
In Next.js App Router:

~~~jsx
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title + ' | SmartNTech',
    description: post.excerpt,
    alternates: { canonical: 'https://www.example.com/blog/' + params.slug },
    openGraph: { title: post.title, description: post.excerpt, images: [post.cover] }
  };
}
~~~

In a Vite single page app, React 19 can render title and meta tags directly inside components.

## 4. Use real links
Use anchor tags with an href, which is what [[Link]] components render, so crawlers can discover pages. Navigation that only works through onClick handlers on buttons or divs is invisible to crawlers.

## 5. Write semantic HTML
- One [[h1]] per page, followed by logical [[h2]] and [[h3]] headings.
- [[nav]], [[main]], [[article]] and [[footer]] elements.
- Descriptive alt text on images.
- Labels on every form field.

Semantic HTML improves accessibility and helps search engines understand your content.

## 6. Improve Core Web Vitals
- **LCP:** preload the hero image, use [[next/image]] or responsive images, and avoid large blocking scripts.
- **INP:** split heavy JavaScript with [[React.lazy]], and avoid expensive work on every keystroke.
- **CLS:** reserve space for images, ads and embeds with explicit width, height or minimum heights.

## 7. Add structured data
Insert JSON-LD for articles, breadcrumbs, FAQs or software applications. Test it with Google's Rich Results Test.

## 8. Generate a sitemap and robots file
Next.js can generate both from [[app/sitemap.js]] and [[app/robots.js]]. Submit the sitemap in Google Search Console.

## 9. Handle errors properly
Return a real 404 status for missing pages instead of a "not found" message with status 200. Use 301 redirects when URLs change.

## 10. Measure in the real world
Lighthouse is a lab test. Check field data in PageSpeed Insights and the Core Web Vitals report in Search Console, and monitor indexing in the Pages report.

## Quick checklist
- Pre-rendered HTML for public pages.
- Unique URL, title, description and canonical for every page.
- Crawlable links and semantic headings.
- Good Core Web Vitals on mobile.
- Sitemap submitted and structured data validated.

Follow these steps and your React site will be fast for users and easy for search engines to index.`],

]);
