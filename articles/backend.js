// SmartNTech — Backend articles (Spring Boot, Node.js, APIs, security)
// Format: [id, date, emoji, readTime, title, excerpt, body]
snt('Backend', 'from-violet-500 to-fuchsia-500', [

['b1', '2026-11-19', '🌱', '8 min', 'Spring Boot Tutorial for Beginners: Build Your First REST API',
'Create a project with Spring Initializr and expose CRUD endpoints in minutes.',
`Spring Boot is the most popular framework for building Java backends. It removes most of the configuration that made classic Spring difficult, so you can focus on business logic. In this guide we build a small product API.

## Create the project
Go to **start.spring.io** and choose:
- Project: Maven, Language: Java, Java version 21.
- Dependencies: **Spring Web**, **Spring Data JPA**, **PostgreSQL Driver** (or H2 for quick testing) and **Validation**.

Download, unzip and open the project in IntelliJ IDEA or VS Code.

## Configure the database
In [[src/main/resources/application.properties]]:

~~~properties
spring.datasource.url=jdbc:postgresql://localhost:5432/shop
spring.datasource.username=postgres
spring.datasource.password=change_me
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
~~~

[[ddl-auto=update]] is convenient while learning. In production, manage schema changes with Flyway or Liquibase instead.

## The entity

~~~java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private BigDecimal price;

    // getters and setters
}
~~~

## The repository

~~~java
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String name);
}
~~~

Spring Data generates the implementation, including the custom finder, from the method name.

## The controller

~~~java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository repo;

    public ProductController(ProductRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Product> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> one(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product p) {
        Product saved = repo.save(p);
        return ResponseEntity.created(URI.create("/api/products/" + saved.getId())).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
~~~

Notice **constructor injection**: dependencies are passed into the constructor. It is the recommended style because it makes classes easy to test and fields can be final.

## Run and test
Start the app with [[./mvnw spring-boot:run]], then test with curl or Postman:

~~~bash
curl -X POST http://localhost:8080/api/products -H "Content-Type: application/json" -d '{"name":"Pen","price":20}'
curl http://localhost:8080/api/products
~~~

## Recommended structure
As the project grows, separate it into layers:
- **controller:** HTTP handling only.
- **service:** business rules and transactions.
- **repository:** data access.
- **dto:** request and response objects, so entities are never exposed directly.

## Next steps
Add input validation, global error handling, security with JWT, and tests with [[@SpringBootTest]] and MockMvc. Each of these is covered in other guides on SmartNTech.`],

['b2', '2026-11-12', '🔑', '9 min', 'JWT Authentication in Spring Boot with Spring Security',
'Secure your REST API with login, tokens, password hashing and role checks.',
`Most REST APIs need to know who is calling them. **JSON Web Tokens (JWT)** are a popular way to authenticate stateless APIs used by React, Angular or mobile apps.

## How JWT authentication works
1. The user sends an email and password to [[/api/auth/login]].
2. The server verifies the password and returns a signed token.
3. The client sends the token in the [[Authorization: Bearer <token>]] header on every request.
4. The server verifies the signature and expiry before allowing access.

A JWT has three parts separated by dots: header, payload (claims such as user id and roles) and signature. The payload is only encoded, not encrypted, so **never put secrets in it**.

## Hash passwords correctly
Never store plain passwords. Use BCrypt:

~~~java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
~~~

When registering, save [[passwordEncoder.encode(rawPassword)]]. When logging in, check with [[passwordEncoder.matches(raw, hash)]].

## Generate a token
Using the popular **jjwt** library:

~~~java
public String generateToken(String email, List<String> roles) {
    return Jwts.builder()
        .subject(email)
        .claim("roles", roles)
        .issuedAt(new Date())
        .expiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000))
        .signWith(secretKey)
        .compact();
}
~~~

Load the secret key from an environment variable, never from source code. It should be at least 256 bits of random data.

## A filter that checks every request

~~~java
public class JwtFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String header = req.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            if (jwtService.isValid(token)) {
                var auth = jwtService.toAuthentication(token);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(req, res);
    }
}
~~~

## Security configuration

~~~java
@Bean
SecurityFilterChain filterChain(HttpSecurity http, JwtFilter jwtFilter) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated())
        .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}
~~~

Disabling CSRF is acceptable here only because the API is stateless and uses bearer tokens instead of cookies.

## Refresh tokens
Keep access tokens short-lived, around 15 minutes, to limit damage if one is stolen. Issue a longer-lived **refresh token**, store it securely, and let the client exchange it for a new access token. Store refresh tokens in the database so they can be revoked on logout.

## Security checklist
- Always use HTTPS.
- Rate-limit the login endpoint to slow down password guessing.
- Return the same error for "unknown email" and "wrong password".
- Validate the token's signature, expiry and issuer.
- Prefer HttpOnly cookies over localStorage for tokens in browser apps, to reduce XSS risk.

For many projects, a managed identity provider such as Keycloak, Auth0 or Firebase Authentication saves time and reduces the chance of security mistakes.`],

['b3', '2026-11-04', '✅', '7 min', 'Validation and Global Exception Handling in Spring Boot',
'Return clean, consistent error responses with @Valid and @RestControllerAdvice.',
`An API that crashes with a stack trace or returns vague errors is frustrating to use. Spring Boot makes it easy to validate requests and return consistent, helpful error responses.

## Add the dependency
Include **spring-boot-starter-validation** in your project. It provides Jakarta Bean Validation annotations.

## Validate a request DTO

~~~java
public record CreateUserRequest(
    @NotBlank(message = "Name is required")
    @Size(max = 80)
    String name,

    @NotBlank @Email(message = "Enter a valid email")
    String email,

    @NotNull @Min(value = 18, message = "Must be at least 18")
    Integer age
) {}
~~~

Common annotations include [[@NotNull]], [[@NotBlank]], [[@Size]], [[@Email]], [[@Min]], [[@Max]], [[@Pattern]], [[@Past]] and [[@Positive]].

## Trigger validation in the controller

~~~java
@PostMapping("/api/users")
public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
    return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(req));
}
~~~

If validation fails, Spring throws [[MethodArgumentNotValidException]] before your method runs.

## A consistent error format
Spring supports the standard **Problem Details** format (RFC 9457) through [[ProblemDetail]]. Here is a global handler:

~~~java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setTitle("Validation failed");
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
          .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        pd.setProperty("errors", errors);
        return pd;
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Not found");
        return pd;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleUnexpected(Exception ex) {
        log.error("Unexpected error", ex);
        return ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong");
    }
}
~~~

## The response clients receive

~~~json
{
  "type": "about:blank",
  "title": "Validation failed",
  "status": 400,
  "errors": {
    "email": "Enter a valid email",
    "age": "Must be at least 18"
  }
}
~~~

A front-end can show each message next to the matching form field.

## Custom business exceptions

~~~java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String resource, Object id) {
        super(resource + " with id " + id + " not found");
    }
}
~~~

Throw it from the service layer: [[orElseThrow(() -> new ResourceNotFoundException("User", id))]].

## Best practices
- Validate at the API boundary with DTOs, not on entities exposed to the web.
- Never return stack traces or SQL errors to clients. Log them on the server instead.
- Use correct status codes: 400 for bad input, 404 for missing resources, 409 for conflicts such as a duplicate email, 422 for business-rule violations if your team prefers it.
- Keep error messages helpful but do not reveal sensitive information.`],

['b4', '2026-10-29', '🟩', '8 min', 'Build a REST API with Node.js and Express',
'Routes, middleware, JSON bodies, error handling and project structure.',
`Node.js lets you run JavaScript on the server, and Express is its most popular web framework. If you already know JavaScript, it is one of the fastest ways to build a backend.

## Set up the project

~~~bash
mkdir notes-api && cd notes-api
npm init -y
npm install express
~~~

Add [["type": "module"]] to [[package.json]] to use modern [[import]] syntax.

## A minimal server

~~~js
import express from 'express';

const app = express();
app.use(express.json()); // parse JSON request bodies

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
~~~

Run it with [[node index.js]], or [[node --watch index.js]] to restart automatically on changes.

## CRUD routes

~~~js
let notes = [];
let nextId = 1;

app.get('/api/notes', (req, res) => res.json(notes));

app.get('/api/notes/:id', (req, res) => {
  const note = notes.find(n => n.id === Number(req.params.id));
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

app.post('/api/notes', (req, res) => {
  const { title, body } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const note = { id: nextId++, title, body: body || '' };
  notes.push(note);
  res.status(201).json(note);
});

app.delete('/api/notes/:id', (req, res) => {
  notes = notes.filter(n => n.id !== Number(req.params.id));
  res.status(204).end();
});
~~~

In a real app, replace the array with a database such as PostgreSQL through Prisma, or MongoDB through Mongoose.

## Middleware
Middleware functions run before your route handlers. They can log requests, check authentication or reject bad input:

~~~js
function logger(req, res, next) {
  console.log(req.method, req.url);
  next();
}
app.use(logger);
~~~

Popular packages include **cors** for cross-origin requests, **helmet** for security headers and **express-rate-limit** to slow down abuse.

## Central error handling
An error handler has four parameters and goes after all routes:

~~~js
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.expose ? err.message : 'Internal server error' });
});
~~~

Express 5 automatically forwards errors thrown in async handlers to this middleware.

## Organize with routers
Split routes into files as the app grows:

~~~js
// routes/notes.js
import { Router } from 'express';
const router = Router();
router.get('/', listNotes);
router.post('/', createNote);
export default router;

// index.js
app.use('/api/notes', notesRouter);
~~~

## Environment variables
Store secrets such as database URLs in a [[.env]] file, read them through [[process.env]], and add [[.env]] to [[.gitignore]]. Recent Node.js versions can load the file with [[node --env-file=.env index.js]].

## Validation
Use a schema library such as **Zod** to validate request bodies in one place rather than writing manual checks in every route.

With these building blocks you can build anything from a contact-form backend to a full e-commerce API.`],

['b5', '2026-10-20', '🔗', '8 min', 'Spring Data JPA Relationships: OneToMany, ManyToOne and ManyToMany',
'Map related tables correctly and avoid the N+1 query problem.',
`Real data is connected: a customer has many orders, an order has many items, a student joins many courses. Spring Data JPA, built on Hibernate, maps these relationships to Java objects. Getting them right is essential for correct and fast applications.

## ManyToOne: the most common relationship
Many orders belong to one customer. The foreign key lives in the **orders** table:

~~~java
@Entity
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;
}
~~~

Always set [[fetch = FetchType.LAZY]] on [[@ManyToOne]]. The default is EAGER, which loads the customer every time you load an order, even when you do not need it.

## OneToMany: the other side
A customer can list their orders. This side is optional and uses [[mappedBy]] to point at the owning field:

~~~java
@Entity
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();

    public void addOrder(Order o) {
        orders.add(o);
        o.setCustomer(this);
    }
}
~~~

The helper method keeps both sides in sync, which avoids subtle bugs.

## ManyToMany
Students and courses need a join table:

~~~java
@ManyToMany
@JoinTable(
    name = "student_course",
    joinColumns = @JoinColumn(name = "student_id"),
    inverseJoinColumns = @JoinColumn(name = "course_id"))
private Set<Course> courses = new HashSet<>();
~~~

Use a [[Set]] instead of a [[List]] for many-to-many collections to avoid duplicate rows. If the relationship needs extra data, such as an enrollment date or grade, create a separate **Enrollment** entity with two [[@ManyToOne]] fields instead.

## The N+1 query problem
Loading 100 orders and then accessing [[order.getCustomer().getName()]] in a loop can trigger 1 query for the orders plus 100 more for the customers. Fix it by fetching what you need in one query:

~~~java
@Query("SELECT o FROM Order o JOIN FETCH o.customer WHERE o.status = :status")
List<Order> findWithCustomer(@Param("status") String status);
~~~

Or use an entity graph:

~~~java
@EntityGraph(attributePaths = "customer")
List<Order> findByStatus(String status);
~~~

Turn on [[spring.jpa.show-sql=true]] while developing so you can spot extra queries early.

## Avoid infinite JSON loops
Returning entities with two-way relationships directly from a controller can cause infinite recursion when converting to JSON. The clean solution is to return **DTOs** containing only the fields the client needs.

## Cascade carefully
[[CascadeType.ALL]] makes sense from parent to child, such as from an order to its items. Avoid cascading from a child to a parent, for example from an order to its customer, or deleting one order could delete the customer too.

## Summary
- Make [[@ManyToOne]] lazy.
- Keep both sides in sync with helper methods.
- Watch for N+1 queries and fix them with JOIN FETCH or entity graphs.
- Return DTOs instead of entities.`],

['b6', '2026-10-14', '⚡', '7 min', 'Caching with Redis in Spring Boot to Speed Up Your API',
'Cut response times with @Cacheable, TTLs and smart cache invalidation.',
`If your API runs the same expensive database query again and again, caching can cut response times from hundreds of milliseconds to just a few. Redis is the most popular in-memory store for this job.

## What is Redis?
Redis keeps data in memory, so reads and writes are extremely fast. Besides caching, it is used for sessions, rate limiting, leaderboards, queues and real-time counters.

Start it locally with Docker:

~~~bash
docker run -d --name redis -p 6379:6379 redis:7
~~~

## Add Redis to Spring Boot
Add the **spring-boot-starter-data-redis** and **spring-boot-starter-cache** dependencies, then configure:

~~~properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.cache.type=redis
spring.cache.redis.time-to-live=10m
~~~

Enable caching on your main class:

~~~java
@SpringBootApplication
@EnableCaching
public class ShopApplication { }
~~~

## Cache method results

~~~java
@Service
public class ProductService {

    @Cacheable(value = "products", key = "#id")
    public ProductDto getProduct(Long id) {
        // runs only on a cache miss
        return repo.findById(id).map(ProductDto::from).orElseThrow();
    }

    @CachePut(value = "products", key = "#result.id")
    public ProductDto update(Long id, UpdateProductRequest req) {
        // saves and refreshes the cached value
        return ProductDto.from(repo.save(apply(id, req)));
    }

    @CacheEvict(value = "products", key = "#id")
    public void delete(Long id) {
        repo.deleteById(id);
    }
}
~~~

- **@Cacheable** returns the cached value if present; otherwise it runs the method and stores the result.
- **@CachePut** always runs the method and updates the cache.
- **@CacheEvict** removes stale entries.

Cached objects must be serializable. Configuring a JSON serializer makes cached values readable when debugging.

## Time to live (TTL)
Every cache entry should expire. A TTL limits how long users might see stale data and stops memory from growing forever. Choose it per data type: a product catalog might use 10 minutes, while exchange rates might use 30 seconds.

## Cache invalidation strategies
- **Expire by TTL:** simplest, accepts brief staleness.
- **Evict on write:** remove the entry whenever data changes, as shown above.
- **Write-through:** update the cache and database together.

## What to cache
- Data that is read often and changes rarely: product details, settings, category lists.
- Results of expensive aggregations, such as dashboard statistics.

## What not to cache
- Data that must always be perfectly fresh, such as account balances during payment.
- Large, rarely used objects that waste memory.
- Personal data without careful key design, or users could see each other's information.

## Watch out for the cache stampede
When a popular entry expires, many requests can hit the database at once. Use a slightly randomized TTL, or a lock so that only one request rebuilds the value.

## Measure the result
Compare response times before and after, and monitor the cache hit rate. A good cache often turns a slow endpoint into one of your fastest.`],

['b7', '2026-10-06', '🏗️', '9 min', 'Microservices vs Monolith: Architecture Guide for Beginners',
'Trade-offs, communication patterns and when microservices are actually worth it.',
`Microservices are often presented as the modern way to build software, but they come with real costs. Understanding the trade-offs helps you make the right choice and answer system design interview questions with confidence.

## What is a monolith?
A monolith is a single application containing all features: users, products, orders and payments. It is built, tested and deployed as one unit, usually with one database.

**Advantages:**
- Simple to develop, run and debug locally.
- One deployment and one place to look for logs.
- Function calls between modules are fast and easy to change.
- Transactions across features are straightforward.

**Disadvantages at large scale:**
- Large codebases slow down builds and tests.
- One bug can take down the whole application.
- Teams step on each other's changes.
- You must scale the entire app even if only one feature is busy.

## What are microservices?
Microservices split the application into small, independently deployable services, each owning one business capability and usually its own database.

**Advantages:**
- Teams deploy their service independently.
- Each service scales separately.
- A failure can be isolated to one service.
- Different services can use different technologies when it truly helps.

**Disadvantages:**
- Network calls are slower and can fail.
- Data consistency across services is hard, with no simple cross-service transactions.
- Debugging needs distributed tracing and centralized logging.
- Much more infrastructure: service discovery, API gateways, CI/CD pipelines and monitoring.

## How services communicate
- **Synchronous:** REST or gRPC calls. Simple, but the caller waits and is affected if the other service is slow.
- **Asynchronous:** events through a message broker such as Kafka or RabbitMQ. Services are loosely coupled and more resilient, but the flow is harder to follow.

## Key patterns
- **API Gateway:** a single entry point that routes requests, handles authentication and applies rate limits.
- **Database per service:** each service owns its data, and others access it only through its API.
- **Saga pattern:** a sequence of local transactions with compensating actions, used instead of distributed transactions. For example, if payment fails, the order service cancels the order.
- **Circuit breaker:** stop calling a failing service for a while to prevent cascading failures. Resilience4j provides this for Java.
- **Observability:** centralized logs, metrics and traces with tools like OpenTelemetry, Prometheus and Grafana.

## The modular monolith
A practical middle ground is a **modular monolith**: one deployable application, but with strict module boundaries inside, each with its own package and data access. If one module later needs independent scaling, it can be extracted into a service with much less pain.

## When microservices make sense
- Several teams need to deploy independently.
- Parts of the system have very different scaling needs.
- The domain is well understood, so service boundaries are stable.

## When to avoid them
- Small teams and early-stage products.
- Unclear requirements that will change often.
- No experience with DevOps, monitoring and automation.

## Our advice
Start with a well-structured monolith. Split out services only when a clear, measurable problem demands it. Many successful companies run large monoliths for years.`],

['a1', '2026-11-15', '🐘', '9 min', 'Spring Boot + PostgreSQL: Production-Ready REST API Setup',
'Profiles, Flyway migrations, HikariCP tuning, DTOs and service layers done right.',
`A tutorial API and a production API look very different. This guide covers the practices that make a Spring Boot and PostgreSQL backend reliable once real users arrive.

## Use profiles for each environment
Keep shared settings in [[application.properties]] and environment-specific ones in [[application-dev.properties]] and [[application-prod.properties]]. Activate a profile with the environment variable [[SPRING_PROFILES_ACTIVE=prod]]. Never commit production passwords; read them from environment variables or a secret manager.

## Manage the schema with Flyway
Instead of letting Hibernate change tables automatically, write versioned SQL migrations. Add the **flyway-core** and **flyway-database-postgresql** dependencies and create files such as:

~~~sql
-- src/main/resources/db/migration/V1__create_products.sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_name ON products (lower(name));
~~~

Set [[spring.jpa.hibernate.ddl-auto=validate]] so Hibernate only checks that entities match the schema. Every environment now has an identical, versioned database.

## Tune the connection pool
Spring Boot uses **HikariCP**. A small pool is usually faster than a large one, because PostgreSQL performs best with a limited number of active connections:

~~~properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.connection-timeout=5000
~~~

If you run several instances, remember that the total connections are pool size multiplied by instances.

## Separate the layers

~~~java
@Service
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) { this.repo = repo; }

    @Transactional(readOnly = true)
    public Page<ProductResponse> search(String q, Pageable pageable) {
        return repo.findByNameContainingIgnoreCase(q, pageable).map(ProductResponse::from);
    }

    @Transactional
    public ProductResponse create(CreateProductRequest req) {
        Product p = new Product(req.name(), req.price());
        return ProductResponse.from(repo.save(p));
    }
}
~~~

Controllers handle HTTP, services hold business rules and transactions, and repositories access data. [[readOnly = true]] lets the database and Hibernate skip unnecessary work.

## Use DTOs, not entities, at the API boundary

~~~java
public record CreateProductRequest(@NotBlank String name, @NotNull @PositiveOrZero BigDecimal price) {}
public record ProductResponse(Long id, String name, BigDecimal price) {
    static ProductResponse from(Product p) { return new ProductResponse(p.getId(), p.getName(), p.getPrice()); }
}
~~~

DTOs prevent leaking internal fields, avoid lazy-loading errors during JSON conversion and let your database evolve without breaking clients.

## Paginate every list endpoint

~~~java
@GetMapping
public Page<ProductResponse> list(@RequestParam(defaultValue = "") String q,
                                  @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
    return service.search(q, pageable);
}
~~~

## Money and time
- Use [[BigDecimal]] and [[NUMERIC]] for prices. Floating-point types introduce rounding errors.
- Store timestamps as [[TIMESTAMPTZ]] and use [[Instant]] or [[OffsetDateTime]] in Java.

## Observability
Add **Spring Boot Actuator** for health and metrics, use structured logging, and enable [[spring.jpa.open-in-view=false]] so lazy-loading problems appear during development instead of silently running extra queries in production.

## Test against real PostgreSQL
**Testcontainers** starts a real PostgreSQL instance in Docker during tests, so your queries and migrations are verified exactly as they will run in production.

With these practices, your API will be easier to deploy, debug and scale.`],

['a6', '2026-10-28', '🔐', '7 min', 'Password Security Best Practices for Users and Developers',
'Length over complexity, password managers, 2FA and how servers should store passwords.',
`Weak and reused passwords remain one of the most common causes of account takeovers. Good password security has two sides: what users should do, and how developers should build login systems.

## For users: length beats complexity
Modern guidance, including NIST SP 800-63B, favors **long passwords** over complicated rules. A passphrase such as four or five random words is easier to remember and harder to crack than a short string full of symbols. Aim for at least 12 to 16 characters.

## Never reuse passwords
When one website is breached, attackers try the same email and password on banking, email and social media sites. This is called **credential stuffing**. A unique password for every site stops it completely.

## Use a password manager
A password manager generates and remembers strong, unique passwords for every account. You only need to remember one strong master password. Bitwarden, 1Password and the managers built into browsers and phones are all good options.

## Turn on two-factor authentication
Even if a password leaks, a second factor blocks most attacks. From strongest to weakest:
- **Passkeys and hardware security keys:** resistant to phishing.
- **Authenticator apps** that generate time-based codes.
- **SMS codes:** better than nothing, but vulnerable to SIM-swap attacks.

## Watch for phishing
No password is strong enough if you type it into a fake website. Check the address bar carefully, and be suspicious of urgent messages asking you to log in through a link.

## For developers: never store plain passwords
Store only a salted hash created with a slow, purpose-built algorithm:
- **Argon2id:** the current first choice.
- **bcrypt:** widely supported and still a solid option.
- **scrypt:** also acceptable.

Never use fast hashes such as MD5, SHA-1 or plain SHA-256 for passwords. They are designed to be fast, which lets attackers test billions of guesses per second.

~~~java
PasswordEncoder encoder = new BCryptPasswordEncoder(12);
String hash = encoder.encode(rawPassword);
boolean ok = encoder.matches(attempt, hash);
~~~

## Sensible password rules
- Require a minimum length of at least 8 characters, preferably more, and allow long passwords of 64 characters or more.
- Allow all characters, including spaces and emoji.
- Check new passwords against lists of known breached passwords.
- Do not force periodic password changes unless there is evidence of compromise.
- Do not use security questions; their answers are often public.

## Protect the login endpoint
- Rate-limit attempts per account and per IP address.
- Show the same message for wrong email and wrong password.
- Notify users of new sign-ins and password changes.
- Use HTTPS everywhere and secure, HttpOnly session cookies.

## Password reset done safely
Send a single-use, time-limited token by email, never the old password. Invalidate other sessions after a reset.

Our free password generator creates strong random passwords locally in your browser using the cryptographic random number generator, so nothing is ever sent to a server.`],

]);
