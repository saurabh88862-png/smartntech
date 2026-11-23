// SmartNTech — DevOps, Git & cloud articles
// Format: [id, date, emoji, readTime, title, excerpt, body]
snt('DevOps', 'from-cyan-400 to-blue-600', [

['d1', '2026-11-17', '🐧', '8 min', '25 Essential Linux Commands Every Developer Should Know',
'Navigate, manage files, inspect processes and debug servers from the terminal.',
`Most servers run Linux, and even on Windows you can use it through WSL. Being comfortable in the terminal makes deployments, debugging and automation much easier.

## Navigation
- [[pwd]] prints the current directory.
- [[ls -la]] lists all files, including hidden ones, with permissions and sizes.
- [[cd /var/log]] changes directory. [[cd ..]] goes up one level, and [[cd ~]] goes home.

## Files and folders
- [[mkdir -p projects/app]] creates nested folders.
- [[touch notes.txt]] creates an empty file.
- [[cp file.txt backup.txt]] copies, and [[cp -r dir1 dir2]] copies folders.
- [[mv old.txt new.txt]] moves or renames.
- [[rm file.txt]] deletes a file. [[rm -r folder]] deletes a folder. Be very careful: there is no recycle bin.

## Viewing files
- [[cat file.txt]] prints a whole file.
- [[less big.log]] scrolls through large files. Press q to quit.
- [[head -n 20 file]] and [[tail -n 50 file]] show the start or end.
- [[tail -f app.log]] follows a log file live, which is essential for debugging.

## Searching
- [[grep -rn "ERROR" /var/log/app]] searches text recursively with line numbers.
- [[find . -name "*.java"]] finds files by name.

~~~bash
# count errors in today's log
grep -c "ERROR" app.log

# show the 10 most common IP addresses in an access log
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head
~~~

## Permissions
- [[chmod +x deploy.sh]] makes a script executable.
- [[chmod 600 key.pem]] restricts a private key to its owner.
- [[chown user:group file]] changes ownership.
- [[sudo]] runs a command as administrator. Use it only when needed.

## Processes and resources
- [[ps aux | grep java]] finds running processes.
- [[top]] or [[htop]] shows live CPU and memory usage.
- [[kill PID]] stops a process gracefully. [[kill -9 PID]] forces it, as a last resort.
- [[df -h]] shows disk space, and [[du -sh *]] shows folder sizes.
- [[free -h]] shows memory usage.

## Networking
- [[curl -I https://example.com]] fetches response headers.
- [[ss -tulpn]] lists listening ports and the processes using them.
- [[ping]] and [[dig example.com]] check connectivity and DNS.
- [[ssh user@server]] connects to a remote server, and [[scp file user@server:/path]] copies files to it.

## Services
On most modern distributions, [[systemctl]] manages services:

~~~bash
sudo systemctl status nginx
sudo systemctl restart nginx
journalctl -u nginx -f   # follow the service logs
~~~

## Pipes and redirection
- [[|]] sends the output of one command into another.
- [[>]] writes output to a file, replacing it. [[>>]] appends.
- [[2>&1]] combines error output with normal output.

## Tips for learning
Practice in a safe environment such as WSL, a virtual machine or a free cloud instance. Read built-in help with [[man ls]] or [[ls --help]]. Within a few weeks of daily use, these commands become second nature.`],

['d2', '2026-11-11', '🤖', '8 min', 'CI/CD with GitHub Actions: Automate Testing and Deployment',
'Build, test and deploy automatically on every push with a simple YAML workflow.',
`Continuous Integration (CI) automatically builds and tests your code on every change. Continuous Delivery or Deployment (CD) automatically releases it. GitHub Actions makes both free and easy for public repositories, with generous free minutes for private ones.

## How GitHub Actions works
- A **workflow** is a YAML file in [[.github/workflows/]].
- It runs on **events** such as a push or pull request.
- It contains **jobs** that run on fresh virtual machines called **runners**.
- Each job has **steps**: commands or reusable **actions** from the marketplace.

## CI for a Java Maven project
Create [[.github/workflows/ci.yml]]:

~~~yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
          cache: maven

      - name: Build and test
        run: ./mvnw -B verify
~~~

Every push to main and every pull request now runs your tests. A red cross on the pull request means something broke before it reaches production.

## CI for a Node.js or React project

~~~yaml
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
~~~

[[npm ci]] installs exact versions from the lock file, which makes builds reproducible.

## Secrets
Never put passwords or API keys in workflow files. Add them under **Settings, Secrets and variables, Actions**, then reference them:

~~~yaml
        env:
          FIREBASE_TOKEN: secrets.FIREBASE_TOKEN
~~~

In real workflows, wrap the reference in GitHub's double-curly-brace expression syntax. GitHub hides secret values in logs automatically.

## Deploying
Add a deploy job that runs only after tests pass, and only on main:

~~~yaml
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploy to your host here"
~~~

Most hosts provide official actions: Firebase Hosting, AWS, Azure, Google Cloud, Netlify and Vercel. Where available, prefer OpenID Connect over long-lived cloud keys.

## Branch protection
In repository settings, protect the main branch: require pull requests, require the CI workflow to pass, and require at least one review. This prevents broken code from being merged.

## Useful extras
- **Matrix builds** test several Java or Node versions in parallel.
- **Caching** dependencies speeds up runs considerably.
- **Scheduled workflows** with [[on: schedule]] can run nightly tests or dependency checks.
- **Dependabot** opens pull requests to update vulnerable dependencies, and CI tests them automatically.

## Why it matters
Automation catches bugs early, makes releases boring and repeatable, and frees you from manual deployment steps. Even a solo developer benefits from a simple CI pipeline.`],

['d3', '2026-11-06', '🌳', '7 min', 'Git Branching Strategies: GitHub Flow, Git Flow and Trunk-Based',
'Choose a workflow that keeps your team productive and releases predictable.',
`A branching strategy is an agreement about how your team uses Git branches. The right one reduces merge conflicts, keeps the main branch stable and makes releases predictable.

## GitHub Flow: simple and popular
1. The [[main]] branch is always deployable.
2. Create a short-lived feature branch: [[git switch -c feature/login-page]].
3. Commit and push regularly.
4. Open a pull request, get a review and let CI run.
5. Merge into main and deploy.

**Best for:** web apps and teams that deploy frequently, which describes most modern projects.

## Git Flow: structured releases
Git Flow uses several long-lived branches:
- [[main]] holds production releases, tagged with versions.
- [[develop]] collects completed features.
- [[feature/*]] branches start from develop.
- [[release/*]] branches prepare a version for launch.
- [[hotfix/*]] branches fix urgent production bugs from main.

**Best for:** software with scheduled versioned releases, such as mobile apps, desktop software or libraries. For continuously deployed web apps it adds unnecessary overhead.

## Trunk-based development
Everyone commits small changes to main (the trunk) at least daily, either directly or through very short-lived branches lasting hours, not weeks. Unfinished features are hidden behind **feature flags**.

**Best for:** experienced teams with strong automated tests and CI. It minimizes merge conflicts and is used by many high-performing engineering teams.

## Naming branches
Use clear prefixes:
- [[feature/user-profile]]
- [[fix/login-redirect]]
- [[chore/upgrade-spring-boot]]
- [[docs/readme-setup]]

Adding a ticket number, such as [[feature/SNT-42-dark-mode]], links work to your issue tracker.

## Writing good commit messages
The Conventional Commits format is widely used:

~~~text
feat: add dark mode toggle
fix: prevent double form submission
docs: update setup instructions
refactor: extract price calculation into service
~~~

It makes history readable and can generate changelogs automatically.

## Pull request best practices
- Keep pull requests small: under about 400 lines of change is much easier to review.
- Write a description explaining what changed and why, with screenshots for UI changes.
- Make sure CI passes before requesting review.
- Respond to feedback respectfully and resolve conversations before merging.

## Handling merge conflicts
Conflicts happen when two branches change the same lines. To reduce them:
- Pull from main frequently and keep branches short-lived.
- Communicate when working on shared files.
- When a conflict occurs, open the files, choose the correct code, remove the conflict markers, test, then commit.

## Our recommendation
Start with **GitHub Flow**. It is simple, works well with CI/CD and suits most teams. Move to Git Flow only if you need parallel versioned releases, or to trunk-based development once your test automation is strong.`],

['d4', '2026-10-30', '☸️', '9 min', 'Kubernetes for Beginners: Pods, Deployments and Services',
'Understand the core concepts and deploy your first containerized app.',
`Docker packages an app into a container. Kubernetes (often written K8s) runs and manages many containers across many machines: it restarts crashed apps, scales them under load and rolls out new versions without downtime.

## Why Kubernetes?
Running one container is easy. Running fifty, across several servers, with zero-downtime updates and automatic recovery, is hard. Kubernetes automates that work.

## Core concepts
- **Cluster:** a group of machines (nodes) managed by a control plane.
- **Pod:** the smallest deployable unit, usually one container plus its shared network and storage.
- **Deployment:** describes how many copies (replicas) of a pod to run and how to update them.
- **Service:** a stable network address that load-balances traffic across matching pods.
- **Ingress:** routes external HTTP traffic to services by domain or path.
- **ConfigMap and Secret:** configuration values and sensitive data injected into pods.
- **Namespace:** a way to divide one cluster into separate areas, such as dev and prod.

## Try it locally
Install **kubectl** plus a local cluster such as **minikube**, **kind** or the Kubernetes option in Docker Desktop.

~~~bash
minikube start
kubectl get nodes
~~~

## A Deployment

~~~yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shop-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: shop-api
  template:
    metadata:
      labels:
        app: shop-api
    spec:
      containers:
        - name: shop-api
          image: myrepo/shop-api:1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests: { cpu: 250m, memory: 256Mi }
            limits: { memory: 512Mi }
          readinessProbe:
            httpGet: { path: /actuator/health, port: 8080 }
~~~

## A Service

~~~yaml
apiVersion: v1
kind: Service
metadata:
  name: shop-api
spec:
  selector:
    app: shop-api
  ports:
    - port: 80
      targetPort: 8080
~~~

Apply both and check the result:

~~~bash
kubectl apply -f deployment.yaml -f service.yaml
kubectl get pods
kubectl logs deploy/shop-api
~~~

## Self-healing and scaling
Delete a pod and Kubernetes creates a replacement within seconds, because the Deployment always tries to match the desired replica count. Scale manually with [[kubectl scale deploy/shop-api --replicas=5]], or automatically with a **HorizontalPodAutoscaler** based on CPU usage.

## Rolling updates
Change the image tag to [[1.1.0]] and apply again. Kubernetes gradually replaces old pods with new ones, waiting for readiness checks to pass. If something goes wrong, roll back with [[kubectl rollout undo deploy/shop-api]].

## Health probes
- **Readiness probe:** is the pod ready to receive traffic?
- **Liveness probe:** is the pod stuck and in need of a restart?

Spring Boot Actuator and simple health endpoints in Node.js make these easy to implement.

## Do you need Kubernetes?
For a small website or a single API, managed platforms such as Cloud Run, Render, Railway or a simple virtual machine are much simpler and cheaper. Kubernetes shines when you run many services, need fine-grained scaling, or have a team dedicated to platform operations. Managed offerings like GKE, EKS and AKS remove much of the cluster maintenance.`],

['d5', '2026-10-23', '☁️', '8 min', 'AWS for Beginners: EC2, S3, RDS and IAM Explained',
'The core Amazon Web Services you need to host a web application.',
`Amazon Web Services is the largest cloud platform, with over two hundred services. You only need a handful to host most web applications. Here are the core ones, explained simply.

## IAM: identity and access management
IAM controls who can do what in your AWS account.
- **Never use the root account** for daily work. Secure it with multi-factor authentication and lock it away.
- Create IAM users or, better, use IAM Identity Center for people.
- Use **roles** for applications. An EC2 server with a role can access S3 without storing keys on disk.
- Follow **least privilege**: grant only the permissions actually needed.

## EC2: virtual servers
EC2 gives you virtual machines in the cloud. You choose the operating system, instance size and region.
- Connect with SSH or AWS Systems Manager.
- **Security groups** act as firewalls. Open only the ports you need, for example 443 for HTTPS, and restrict SSH to your own IP address.
- Attach an **Elastic IP** for a fixed public address.

EC2 suits apps that need full control of the server.

## S3: object storage
S3 stores files called objects inside buckets. It is extremely durable and cheap.
- Use it for images, uploads, backups and log archives.
- Host static websites, such as a React build, directly from S3, usually behind **CloudFront** for speed and HTTPS.
- **Keep buckets private by default.** Many data leaks happen because a bucket was accidentally made public. Use the Block Public Access settings.

~~~bash
aws s3 cp ./dist s3://my-site-bucket --recursive
~~~

## RDS: managed databases
RDS runs PostgreSQL, MySQL and other databases for you, handling backups, patching and optional failover.
- Place databases in **private subnets**, unreachable from the internet.
- Enable automated backups and test restoring them.
- Aurora is AWS's higher-performance, compatible option for larger workloads.

## Other services worth knowing
- **Route 53:** DNS and domain management.
- **CloudFront:** content delivery network for fast global delivery.
- **Lambda:** run code without managing servers, billed per request.
- **Elastic Beanstalk or App Runner:** deploy apps without configuring servers manually.
- **CloudWatch:** logs, metrics and alarms.
- **VPC:** your private network in AWS.

## A typical architecture
- A React front end in S3, served through CloudFront.
- A Spring Boot API on EC2, App Runner or ECS, behind a load balancer.
- PostgreSQL on RDS in a private subnet.
- Domains in Route 53 and certificates from AWS Certificate Manager.

## Control your costs
- Set up **AWS Budgets** alerts on day one.
- Use the Free Tier carefully; some services and data transfer still cost money.
- Stop or delete resources you are not using, especially EC2 instances, NAT gateways and idle databases.
- Use the Pricing Calculator before launching anything large.

## Learning path
Start by hosting a static site on S3 with CloudFront, then deploy an API on EC2 or App Runner, then connect it to RDS. The AWS Certified Cloud Practitioner exam is a good first certification if you want a structured goal.`],

['d6', '2026-10-15', '🔀', '7 min', 'Nginx as a Reverse Proxy: Serve Your App with HTTPS',
'Configure Nginx in front of Node.js or Spring Boot, with free SSL certificates.',
`Nginx is a fast, lightweight web server that often sits in front of application servers. As a **reverse proxy**, it receives requests from the internet and forwards them to your app, adding HTTPS, compression, caching and security along the way.

## Why put Nginx in front of your app?
- Terminate HTTPS so your app only handles plain HTTP internally.
- Serve static files such as images, CSS and JavaScript very efficiently.
- Route different paths or domains to different apps.
- Add gzip compression, caching headers and rate limits.
- Keep application ports like 8080 or 3000 closed to the public.

## Install

~~~bash
sudo apt update
sudo apt install nginx
sudo systemctl enable --now nginx
~~~

Visit your server's IP address and you should see the Nginx welcome page.

## A basic reverse proxy
Create [[/etc/nginx/sites-available/myapp]]:

~~~nginx
server {
    listen 80;
    server_name example.com www.example.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
~~~

Enable it and reload:

~~~bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t            # test the configuration
sudo systemctl reload nginx
~~~

The forwarded headers let your application know the real client IP address and original protocol.

## Free HTTPS with Let's Encrypt

~~~bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
~~~

Certbot obtains a certificate, updates your Nginx configuration and sets up automatic renewal. Certificates renew automatically every few months.

## Serving a React build and an API together

~~~nginx
server {
    listen 443 ssl;
    server_name example.com;
    root /var/www/myapp/dist;

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
    }

    location / {
        try_files $uri /index.html;
    }
}
~~~

[[try_files]] sends unknown paths to [[index.html]], so client-side routes work after a page refresh.

## Performance and security tweaks
- Enable compression with [[gzip on;]] and [[gzip_types]] for text, CSS, JavaScript and JSON.
- Cache static assets with long [[expires]] headers when filenames contain content hashes.
- Hide the version number with [[server_tokens off;]].
- Limit request body size with [[client_max_body_size 10m;]].
- Add rate limiting on login endpoints with [[limit_req_zone]].

## Troubleshooting
- **502 Bad Gateway:** your app is not running or is listening on a different port. Check it with [[ss -tulpn]].
- **Configuration errors:** always run [[nginx -t]] before reloading.
- **Logs:** check [[/var/log/nginx/error.log]] and [[access.log]].

With Nginx in front, even a small virtual server can host several fast, secure applications.`],

['d7', '2026-10-09', '🔃', '6 min', 'Git Merge vs Rebase: Differences and When to Use Each',
'Understand both ways of integrating changes and avoid rewriting shared history.',
`Both [[git merge]] and [[git rebase]] combine work from one branch into another, but they shape your project history differently. Knowing when to use each keeps history clean and prevents painful mistakes.

## The situation
You created [[feature/search]] from [[main]]. While you worked, teammates added new commits to main. Now you want your branch to include those changes.

## Merge
~~~bash
git switch feature/search
git merge main
~~~

Git creates a new **merge commit** that ties the two histories together.

**Pros:**
- Preserves the exact history of what happened and when.
- Safe: it never rewrites existing commits.

**Cons:**
- Frequent merges can produce a cluttered history with many merge commits.

## Rebase
~~~bash
git switch feature/search
git rebase main
~~~

Rebase takes your branch's commits and replays them on top of the latest main, as if you had started your work from there.

**Pros:**
- Creates a clean, linear history that is easy to read.
- Makes tools like [[git bisect]] simpler to use.

**Cons:**
- It rewrites commit hashes. If others have based work on your old commits, rebasing causes confusion and duplicate commits.

## The golden rule
**Never rebase commits that others are already using.** Rebase your own local or personal feature branches freely. Do not rebase shared branches such as main or develop.

If you rebase a branch you already pushed, you must force-push it. Use the safer form:

~~~bash
git push --force-with-lease
~~~

It refuses to overwrite the remote branch if someone else has pushed to it in the meantime.

## Resolving conflicts during a rebase
Conflicts are handled one commit at a time:
1. Fix the conflicting files.
2. [[git add]] the resolved files.
3. [[git rebase --continue]].

If things go wrong, [[git rebase --abort]] returns to the state before you started.

## Cleaning up with interactive rebase
Before opening a pull request, you can tidy your commits:

~~~bash
git rebase -i HEAD~4
~~~

In the editor you can **squash** small "fix typo" commits into meaningful ones, **reword** messages or reorder commits.

## Merge strategies on GitHub
When merging pull requests, GitHub offers three options:
- **Create a merge commit:** keeps every commit plus a merge commit.
- **Squash and merge:** combines all pull request commits into one clean commit on main. This is popular for feature branches.
- **Rebase and merge:** replays commits onto main without a merge commit.

## A practical workflow
1. Work on a feature branch.
2. Regularly run [[git pull --rebase]] or rebase onto main to stay current.
3. Clean up commits with interactive rebase if needed.
4. Open a pull request and merge with squash or a merge commit, depending on your team's convention.

Both tools are valuable. Use rebase to keep your own work tidy, and merge to integrate shared work safely.`],

['d8', '2026-09-29', '🚢', '8 min', 'Deploy a Spring Boot App to the Cloud: Step-by-Step Guide',
'Package with Docker, choose a platform, configure secrets and go live with HTTPS.',
`Building an API locally is only half the journey. This guide takes a Spring Boot application from your laptop to a live HTTPS URL using a container and a managed platform.

## Step 1: Prepare the application
- Read configuration from environment variables instead of hard-coding values:

~~~properties
spring.datasource.url=jdbc:postgresql://localhost:5432/shop
spring.datasource.username=postgres
spring.datasource.password=change_me
server.port=8080
~~~

In production, override each value with environment variables such as [[SPRING_DATASOURCE_URL]] and [[SPRING_DATASOURCE_PASSWORD]]; Spring Boot maps them automatically. Most platforms set a [[PORT]] variable, which you can use with [[server.port]].

- Add **Spring Boot Actuator** and expose [[/actuator/health]] for health checks.
- Manage database schema changes with **Flyway** migrations rather than [[ddl-auto=update]].

## Step 2: Build a container image
A multi-stage Dockerfile keeps the final image small:

~~~dockerfile
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./mvnw -B package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
~~~

Test it locally:

~~~bash
docker build -t shop-api .
docker run -p 8080:8080 shop-api
~~~

## Step 3: Choose a platform
- **Google Cloud Run:** runs containers, scales to zero when idle, and includes HTTPS.
- **AWS App Runner or ECS:** good options inside the AWS ecosystem.
- **Render, Railway or Fly.io:** very simple developer experience with free or low-cost tiers.
- **A virtual machine with Nginx:** the most control, but you maintain the server yourself.

## Step 4: Create a managed database
Use a managed PostgreSQL service such as Cloud SQL, RDS, Neon or Supabase. Enable automated backups, and restrict access so only your application can connect.

## Step 5: Deploy
Example with Google Cloud Run:

~~~bash
gcloud run deploy shop-api --source . --region asia-south1 --allow-unauthenticated
~~~

The command builds your container, deploys it and prints a public HTTPS URL. Choose a region close to your users, such as Mumbai for Indian audiences.

## Step 6: Configure secrets
Store the database password and JWT secret in the platform's secret manager, such as Google Secret Manager or AWS Secrets Manager, and expose them to the app as environment variables. Never commit secrets to Git.

## Step 7: Add a custom domain
Map your domain in the platform's settings and add the DNS records it provides at your registrar. Managed platforms provision HTTPS certificates automatically.

## Step 8: Automate with CI/CD
Add a GitHub Actions workflow that runs tests and deploys on every push to main. Deployments then become routine instead of stressful.

## Step 9: Monitor
- Check logs in the platform console.
- Set up uptime checks and alerts for errors and high latency.
- Watch memory usage and tune JVM options such as [[-XX:MaxRAMPercentage=75]] so the JVM respects container memory limits.

## Final checklist
- Health check endpoint works.
- Secrets are stored securely.
- Database backups are enabled and tested.
- HTTPS and a custom domain are configured.
- Logs and alerts are in place.

Congratulations: your Spring Boot app is live and ready for real users.`],

]);
