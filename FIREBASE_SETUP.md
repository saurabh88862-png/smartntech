# SmartNTech — Go live with Firebase (free)

Without Firebase the site runs in **local demo mode**: admin edits, visitor counts and
messages are saved only in the browser you are using. Follow these steps once and every
visitor is counted live, and your edits show for everyone.

## 1. Create a Firebase project
1. Go to https://console.firebase.google.com → **Add project** → name it `smartntech`.
2. Google Analytics is optional. You can turn it off.

## 2. Create the admin login
1. Left menu → **Build → Authentication → Get started**.
2. **Sign-in method** tab → enable **Email/Password** → Save.
3. **Users** tab → **Add user** → enter the admin email (`rlakshminarayan66@gmail.com`)
   and your admin password.
4. **Settings** tab → **User actions** → untick **Enable create (sign-up)**,
   so nobody else can create an account.

## 3. Create the database
1. Left menu → **Build → Firestore Database → Create database** → choose a location
   near India (e.g. `asia-south1`) → **Start in production mode**.
2. Open the **Rules** tab, delete what is there, paste the contents of `firestore.rules`
   from this folder, and click **Publish**.

## 4. Connect the website
1. Project settings (⚙️) → **General** → *Your apps* → click the **</>** (Web) icon →
   register the app (no hosting needed yet).
2. Copy the `firebaseConfig = { ... }` object.
3. Open `index.html`, find `const FIREBASE_CONFIG = null;` and replace `null` with the
   copied object, for example:
   ```js
   const FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "smartntech.firebaseapp.com",
     projectId: "smartntech",
     storageBucket: "smartntech.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
   (These values are safe to have in a public page. Security comes from the rules.)

## 5. Publish the website
Firebase Hosting (free) is the easiest:
```powershell
npm install -g firebase-tools
```
```powershell
firebase login
```
`firebase.json` is already included, so just link the folder to your project and deploy:
```powershell
cd $HOME\Downloads\smartntech; firebase use --add
```
(pick your project, alias `default`)
```powershell
firebase deploy
```
This uploads the website and the Firestore security rules together.
You get a link like `https://smartntech.web.app`. You can connect your own domain under
**Hosting → Add custom domain**. A custom domain is strongly recommended for AdSense.

Then add that domain under **Authentication → Settings → Authorized domains**
(Firebase adds `*.web.app` automatically).

## Article pages, sitemap and robots.txt (important for Google & AdSense)
Every article has its own page in `blog/` (for example
`blog/java-streams-and-lambda-expressions-a-practical-guide.html`), plus `blog/index.html`,
`sitemap.xml` and `robots.txt`. These are generated from the files in `articles/`.

1. Open `site.config.js` and set `url` to your real address, e.g. `https://www.smartntech.com`.
2. Rebuild the pages:
   ```powershell
   cd $HOME\Downloads\smartntech; powershell -ExecutionPolicy Bypass -File .\build.ps1
   ```
   Your browser opens the builder, writes all files and shows "Done!".
3. Deploy (`firebase deploy`), then submit `https://your-domain/sitemap.xml` in
   **Google Search Console → Sitemaps**.

Run `build.ps1` again whenever you add or change articles in the `articles/` folder.
Articles added from the **admin dashboard** show on the homepage straight away, but open in a
pop-up and don't get their own page. For SEO, add important articles to an `articles/*.js` file and rebuild.

## Using the admin panel
- Open the site and click **🔒 Admin** in the footer (or add `#admin` to the URL).
- Log in with the admin email and password from step 2.
- **Overview:** visitors today, online now, last 7 days, all-time, 14-day chart. Updates live.
- **Site content:** announcement bar, hero text, about text, contact details.
- **Articles:** add, edit and delete blog posts.
- **Messages:** contact form submissions, with Reply and Delete buttons.

## How visitors are counted
- Each browser counts as **one visitor per day** (refreshing the page doesn't add more).
- **Online now** = browsers that sent a heartbeat in the last 2 minutes.
- No names, emails or IP addresses are stored for visitors.
