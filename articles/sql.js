// SmartNTech — SQL & database articles
// Format: [id, date, emoji, readTime, title, excerpt, body]
snt('SQL', 'from-blue-500 to-indigo-700', [

['s1', '2026-11-15', '🗃️', '7 min', 'SQL Basics: SELECT, WHERE, ORDER BY and LIMIT',
'Write your first queries and learn to filter, sort and limit results.',
`SQL (Structured Query Language) is how applications talk to relational databases such as PostgreSQL, MySQL and SQL Server. Even front-end developers and data analysts benefit from knowing it. Let us start with the most common statement: [[SELECT]].

## Our example table
Imagine a table called **products**:

~~~sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  price NUMERIC(10, 2),
  stock INT DEFAULT 0
);
~~~

## Selecting columns

~~~sql
SELECT name, price FROM products;
~~~

[[SELECT *]] returns every column. It is handy for exploring, but in application code list the columns you need. This is faster and does not break when columns are added.

## Filtering with WHERE

~~~sql
SELECT name, price
FROM products
WHERE category = 'Electronics' AND price < 20000;
~~~

Useful operators:
- [[=]], [[<>]], [[<]], [[>]], [[<=]], [[>=]]
- [[BETWEEN 500 AND 2000]] for ranges, inclusive of both ends
- [[IN ('Books', 'Toys')]] to match a list
- [[LIKE 'Lap%']] for patterns, where [[%]] means any characters. PostgreSQL also has [[ILIKE]] for case-insensitive matching.
- [[IS NULL]] and [[IS NOT NULL]]. Never write [[= NULL]], because it is never true.

## Sorting with ORDER BY

~~~sql
SELECT name, price
FROM products
ORDER BY price DESC, name ASC;
~~~

## Limiting results
Show the five most expensive products:

~~~sql
SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 5;
~~~

Add [[OFFSET 10]] to skip rows for simple pagination. For very large tables, keyset pagination ([[WHERE id > last_seen_id]]) is faster than large offsets.

## Removing duplicates

~~~sql
SELECT DISTINCT category FROM products;
~~~

## Aliases and calculated columns

~~~sql
SELECT name, price, price * 1.18 AS price_with_gst
FROM products;
~~~

## Order of execution
SQL is written in one order but executed in another: [[FROM]], then [[WHERE]], then [[GROUP BY]], [[HAVING]], [[SELECT]], [[ORDER BY]] and finally [[LIMIT]]. This explains why you cannot use a column alias from [[SELECT]] inside [[WHERE]].

## Practice tip
Install PostgreSQL locally or use a free online playground, create a small table, and write ten queries a day. Within a week, reading and writing basic SQL will feel natural.`],

['s2', '2026-11-07', '📊', '7 min', 'SQL GROUP BY and HAVING: Aggregations Made Easy',
'COUNT, SUM, AVG, MIN and MAX with grouping, and the difference between WHERE and HAVING.',
`Reports and dashboards are built on aggregation: total sales per month, number of users per city, average order value. SQL handles this with aggregate functions and [[GROUP BY]].

## Aggregate functions
- [[COUNT(*)]] counts rows. [[COUNT(column)]] counts only non-null values.
- [[SUM(column)]] adds values.
- [[AVG(column)]] calculates the average.
- [[MIN(column)]] and [[MAX(column)]] find the smallest and largest values.

~~~sql
SELECT COUNT(*) AS total_orders,
       SUM(amount) AS revenue,
       AVG(amount) AS avg_order
FROM orders;
~~~

## Grouping rows
[[GROUP BY]] splits rows into groups and runs the aggregate for each group:

~~~sql
SELECT city, COUNT(*) AS customers
FROM customers
GROUP BY city
ORDER BY customers DESC;
~~~

**Rule:** every column in [[SELECT]] must either be inside an aggregate function or listed in [[GROUP BY]].

## Grouping by multiple columns

~~~sql
SELECT category, EXTRACT(YEAR FROM created_at) AS year, SUM(amount) AS revenue
FROM orders
GROUP BY category, year
ORDER BY year, revenue DESC;
~~~

## Filtering groups with HAVING
[[WHERE]] filters rows **before** grouping. [[HAVING]] filters groups **after** aggregation.

~~~sql
SELECT customer_id, COUNT(*) AS orders, SUM(amount) AS spent
FROM orders
WHERE status = 'delivered'
GROUP BY customer_id
HAVING SUM(amount) > 10000
ORDER BY spent DESC;
~~~

This finds customers who spent more than 10,000 on delivered orders.

## Monthly sales report
PostgreSQL's [[DATE_TRUNC]] makes monthly grouping easy:

~~~sql
SELECT DATE_TRUNC('month', created_at) AS month,
       COUNT(*) AS orders,
       SUM(amount) AS revenue
FROM orders
GROUP BY month
ORDER BY month;
~~~

In MySQL, use [[DATE_FORMAT(created_at, '%Y-%m')]] instead.

## Conditional aggregation
Count different statuses in one query using [[FILTER]] in PostgreSQL, or [[CASE]] everywhere:

~~~sql
SELECT
  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
FROM orders;
~~~

## Common mistakes
- Using [[WHERE COUNT(*) > 5]]. Aggregates are not allowed in [[WHERE]]; use [[HAVING]].
- Forgetting that [[AVG]] ignores nulls, which may or may not be what you want.
- Grouping by a high-cardinality column like a timestamp and getting one group per row.

Master these patterns and you can answer most business questions with a single query.`],

['s3', '2026-10-31', '🪆', '8 min', 'SQL Subqueries and CTEs: Write Cleaner Complex Queries',
'Nested queries, EXISTS, correlated subqueries and readable WITH clauses.',
`Some questions cannot be answered with a single simple query. Subqueries and Common Table Expressions (CTEs) let you break complex logic into understandable steps.

## Subquery in WHERE
Find products priced above the average:

~~~sql
SELECT name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products);
~~~

The inner query runs first and returns one value.

## Subquery with IN
Find customers who have placed at least one order:

~~~sql
SELECT name
FROM customers
WHERE id IN (SELECT customer_id FROM orders);
~~~

## EXISTS: often faster and null-safe
[[EXISTS]] stops as soon as it finds a match:

~~~sql
SELECT c.name
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id
);
~~~

Prefer [[NOT EXISTS]] over [[NOT IN]] when the subquery column can contain nulls. [[NOT IN]] returns no rows at all if any value in the list is null, which is a nasty surprise.

## Correlated subqueries
A correlated subquery refers to the outer query and runs once per row. Find each customer's latest order date:

~~~sql
SELECT c.name,
       (SELECT MAX(o.created_at) FROM orders o WHERE o.customer_id = c.id) AS last_order
FROM customers c;
~~~

They are easy to write but can be slow on large tables. A join with [[GROUP BY]] is often faster.

## Subquery in FROM (derived table)

~~~sql
SELECT category, avg_price
FROM (
  SELECT category, AVG(price) AS avg_price
  FROM products
  GROUP BY category
) AS t
WHERE avg_price > 1000;
~~~

## Common Table Expressions (WITH)
CTEs give names to intermediate results and read top to bottom like a story:

~~~sql
WITH monthly AS (
  SELECT customer_id, DATE_TRUNC('month', created_at) AS month, SUM(amount) AS spent
  FROM orders
  GROUP BY customer_id, month
),
top_spenders AS (
  SELECT month, customer_id, spent,
         RANK() OVER (PARTITION BY month ORDER BY spent DESC) AS rnk
  FROM monthly
)
SELECT * FROM top_spenders WHERE rnk <= 3;
~~~

This finds the top three customers for every month, something that would be very hard to read as nested subqueries.

## Recursive CTEs
Recursive CTEs handle hierarchies such as categories and subcategories or employee-manager trees:

~~~sql
WITH RECURSIVE team AS (
  SELECT id, name, manager_id FROM employees WHERE id = 1
  UNION ALL
  SELECT e.id, e.name, e.manager_id
  FROM employees e JOIN team t ON e.manager_id = t.id
)
SELECT * FROM team;
~~~

## When to use which
- One value or a simple list: a subquery.
- Checking existence: [[EXISTS]].
- Multi-step logic or reused results: a CTE.

Readable queries are easier to debug, review and optimize, so reach for CTEs whenever a query starts to feel complicated.`],

['s4', '2026-10-25', '🪟', '8 min', 'SQL Window Functions: ROW_NUMBER, RANK and Running Totals',
'Calculate rankings, running totals and comparisons without collapsing rows.',
`Window functions are one of the most powerful features in SQL, and a favorite topic in data and backend interviews. They perform calculations across related rows while keeping every row in the result, unlike [[GROUP BY]], which collapses rows.

## The basic syntax

~~~sql
function_name() OVER (PARTITION BY column ORDER BY column)
~~~

- **PARTITION BY** splits rows into groups, like [[GROUP BY]], but without merging them.
- **ORDER BY** sets the order inside each partition.

## ROW_NUMBER, RANK and DENSE_RANK

~~~sql
SELECT name, department, salary,
       ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS row_num,
       RANK()       OVER (PARTITION BY department ORDER BY salary DESC) AS rnk,
       DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dense_rnk
FROM employees;
~~~

With salaries of 90k, 80k, 80k and 70k:
- **ROW_NUMBER:** 1, 2, 3, 4. Always unique.
- **RANK:** 1, 2, 2, 4. Ties share a rank and leave a gap.
- **DENSE_RANK:** 1, 2, 2, 3. Ties share a rank with no gap.

## Top N per group
The classic interview question, "find the highest-paid employee in each department":

~~~sql
SELECT * FROM (
  SELECT name, department, salary,
         ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rn
  FROM employees
) t
WHERE rn = 1;
~~~

Change the condition to [[rn <= 3]] for the top three.

## Running totals

~~~sql
SELECT order_date, amount,
       SUM(amount) OVER (ORDER BY order_date) AS running_total
FROM daily_sales;
~~~

## Moving averages
A seven-day moving average smooths noisy daily data:

~~~sql
SELECT order_date, amount,
       AVG(amount) OVER (
         ORDER BY order_date
         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS avg_7_days
FROM daily_sales;
~~~

## Comparing with previous rows: LAG and LEAD

~~~sql
SELECT month, revenue,
       LAG(revenue) OVER (ORDER BY month) AS prev_month,
       revenue - LAG(revenue) OVER (ORDER BY month) AS change
FROM monthly_revenue;
~~~

[[LEAD]] looks at the next row instead.

## Percent of total

~~~sql
SELECT category, revenue,
       ROUND(100.0 * revenue / SUM(revenue) OVER (), 2) AS pct_of_total
FROM category_revenue;
~~~

An empty [[OVER ()]] means the window is the whole result set.

## Removing duplicates
Keep only the newest row for each email:

~~~sql
DELETE FROM users
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) AS rn
    FROM users
  ) t WHERE rn > 1
);
~~~

Always run the inner SELECT first to check which rows will be deleted.

Window functions are supported in PostgreSQL, MySQL 8+, SQL Server, Oracle and SQLite, so these patterns work almost everywhere.`],

['s5', '2026-10-17', '📐', '8 min', 'Database Normalization: 1NF, 2NF and 3NF with Examples',
'Design tables that avoid duplicate data and update anomalies.',
`Normalization is the process of organizing tables so that each fact is stored in exactly one place. It prevents inconsistent data and makes updates safe. Interviewers love this topic, and it directly affects the quality of every application you build.

## The problem with one big table
Imagine storing orders like this:

~~~text
order_id | customer_name | customer_phone | products      | total
---------+---------------+----------------+---------------+------
1        | Asha          | 98xxxxxx01     | Pen, Notebook | 150
~~~

This design causes three classic **anomalies**:
- **Update anomaly:** if Asha changes her phone number, you must update every order row, and missing one leaves inconsistent data.
- **Insert anomaly:** you cannot store a new customer until they place an order.
- **Delete anomaly:** deleting Asha's only order also deletes everything you know about her.

## First Normal Form (1NF)
- Each column holds a single, atomic value.
- No repeating groups or comma-separated lists.
- Each row is unique, usually with a primary key.

The [[products]] column above breaks 1NF. Move products into their own rows using an **order_items** table.

## Second Normal Form (2NF)
- The table is in 1NF.
- Every non-key column depends on the **whole** primary key, not just part of it.

This matters for composite keys. In [[order_items(order_id, product_id, product_name, quantity)]], [[product_name]] depends only on [[product_id]], not on the full key. Move it into a **products** table.

## Third Normal Form (3NF)
- The table is in 2NF.
- No non-key column depends on another non-key column (no **transitive dependencies**).

If an orders table stores both [[customer_id]] and [[customer_phone]], the phone depends on the customer, not the order. Keep phone numbers only in the **customers** table.

## The normalized design

~~~sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) UNIQUE
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  order_id INT REFERENCES orders(id),
  product_id INT REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
~~~

Notice that [[order_items]] stores [[unit_price]]. That is intentional: it records the price at the time of purchase, which is a different fact from the product's current price.

## When to denormalize
Highly normalized schemas need more joins. For read-heavy reporting or very high traffic, teams sometimes duplicate data deliberately, for example storing an order total, or using a separate analytics database. Do this only after measuring a real performance problem, and keep the duplicated data in sync carefully.

## Rule of thumb
"Every non-key column must depend on the key, the whole key, and nothing but the key." Aim for 3NF by default.`],

['s6', '2026-10-11', '🔐', '7 min', 'SQL Transactions and ACID Properties Explained',
'COMMIT, ROLLBACK, isolation levels and why bank transfers never lose money.',
`When you transfer money, two things must happen together: one account is debited and another is credited. If the system crashes halfway, you could lose money. Database **transactions** guarantee that this never happens.

## What is a transaction?
A transaction groups several SQL statements into a single unit of work. Either all of them succeed, or none of them take effect.

~~~sql
BEGIN;

UPDATE accounts SET balance = balance - 5000 WHERE id = 1;
UPDATE accounts SET balance = balance + 5000 WHERE id = 2;

COMMIT;
~~~

If anything goes wrong before [[COMMIT]], run [[ROLLBACK]] and the database returns to its earlier state.

## ACID properties
- **Atomicity:** all or nothing. A failed transaction leaves no partial changes.
- **Consistency:** the database moves from one valid state to another, respecting constraints such as [[CHECK (balance >= 0)]] and foreign keys.
- **Isolation:** concurrent transactions do not interfere with each other in unexpected ways.
- **Durability:** once committed, changes survive crashes and power failures, because they are written to a log on disk.

## Concurrency problems
Without proper isolation, concurrent transactions can cause:
- **Dirty reads:** reading data another transaction has not committed yet.
- **Non-repeatable reads:** reading the same row twice and getting different values.
- **Phantom reads:** running the same query twice and getting new rows.
- **Lost updates:** two transactions read a value, both modify it, and one overwrites the other.

## Isolation levels
- **Read Uncommitted:** allows dirty reads. Rarely used.
- **Read Committed:** the default in PostgreSQL and SQL Server. Each statement sees only committed data.
- **Repeatable Read:** the default in MySQL InnoDB. Rows you read will not change during the transaction.
- **Serializable:** the strictest level. Transactions behave as if they ran one at a time, at the cost of more conflicts and retries.

~~~sql
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;
~~~

## Preventing lost updates
Lock the row while you work on it:

~~~sql
BEGIN;
SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;
-- check balance in application code
UPDATE accounts SET balance = balance - 5000 WHERE id = 1;
COMMIT;
~~~

Or use **optimistic locking** with a version column: update only if the version has not changed, and retry if it has.

## Transactions in Spring Boot
In Java applications, add [[@Transactional]] to a service method. Spring starts a transaction before the method and commits afterwards, or rolls back if a runtime exception is thrown:

~~~java
@Transactional
public void transfer(long fromId, long toId, BigDecimal amount) {
    accountRepo.debit(fromId, amount);
    accountRepo.credit(toId, amount);
}
~~~

## Best practices
- Keep transactions short. Long transactions hold locks and slow everyone down.
- Never wait for user input or call slow external APIs inside a transaction.
- Handle deadlock and serialization errors by retrying the whole transaction.`],

['s7', '2026-10-03', '🛡️', '7 min', 'SQL Injection: How It Works and How to Prevent It',
'Understand the attack, then stop it with prepared statements and safe ORMs.',
`SQL injection has been one of the most dangerous web vulnerabilities for over two decades. It lets attackers read, change or delete data in your database. The good news is that it is completely preventable.

## How the attack works
Consider a login check built by joining strings:

~~~java
String sql = "SELECT * FROM users WHERE email = '" + email + "' AND password = '" + password + "'";
~~~

If an attacker types this into the email field:

~~~text
' OR '1'='1' --
~~~

The final query becomes:

~~~sql
SELECT * FROM users WHERE email = '' OR '1'='1' --' AND password = '...'
~~~

[[OR '1'='1']] is always true, and [[--]] comments out the password check. The attacker logs in without a password. Worse payloads can dump entire tables or drop them.

## The fix: parameterized queries
Never build SQL by concatenating user input. Use placeholders, and let the database driver send the values separately from the SQL code:

~~~java
String sql = "SELECT id, name FROM users WHERE email = ?";
try (PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.setString(1, email);
    ResultSet rs = ps.executeQuery();
}
~~~

The database treats the value strictly as data, so quotes and SQL keywords have no special meaning.

## In other languages

~~~js
// Node.js with node-postgres
await pool.query('SELECT * FROM users WHERE email = $1', [email]);
~~~

~~~python
# Python with psycopg
cur.execute("SELECT * FROM users WHERE email = %s", (email,))
~~~

## ORMs help, but are not magic
Spring Data JPA, Hibernate, Prisma and Django ORM use parameters by default. But raw query features can still be misused:

~~~java
// Safe
@Query("SELECT u FROM User u WHERE u.email = :email")
User findByEmail(@Param("email") String email);
~~~

Never concatenate user input into [[@Query]] strings, native queries, or dynamic [[ORDER BY]] clauses.

## Dynamic column names
Placeholders cannot be used for column or table names. If users can choose a sort column, check it against an allow-list:

~~~java
Set<String> allowed = Set.of("name", "price", "created_at");
String sortBy = allowed.contains(input) ? input : "created_at";
~~~

## Defense in depth
- **Least privilege:** the application's database user should not be able to drop tables or read unrelated schemas.
- **Hash passwords** with bcrypt or Argon2, so stolen data is less useful.
- **Validate input** types and lengths, for example rejecting non-numeric ids.
- **Hide database errors** from users; log them on the server instead.
- **Use a web application firewall** as an extra layer, not as the main defense.

## Test your app
Tools like OWASP ZAP can scan your own applications for injection flaws. Only test systems you own or have written permission to test.`],

['s8', '2026-09-27', '⚖️', '8 min', 'SQL vs NoSQL: Choosing Between PostgreSQL and MongoDB',
'Data models, scaling, consistency and real use cases to help you decide.',
`"Should I use SQL or NoSQL?" is one of the first architecture decisions in a new project. Both are excellent tools. The right choice depends on your data and how you query it.

## Relational databases (SQL)
PostgreSQL, MySQL and SQL Server store data in tables with fixed columns. Relationships are expressed with foreign keys and combined with joins.

**Strengths:**
- Strong consistency and ACID transactions.
- Powerful queries with joins, aggregations and window functions.
- Schemas enforce data quality with types and constraints.
- Mature tooling and decades of operational knowledge.

## Document databases (NoSQL)
MongoDB and Firestore store data as JSON-like documents. Each document can have its own structure.

~~~json
{
  "_id": "order_1001",
  "customer": { "name": "Asha", "city": "Pune" },
  "items": [
    { "product": "Pen", "qty": 2, "price": 20 },
    { "product": "Notebook", "qty": 1, "price": 110 }
  ],
  "status": "shipped"
}
~~~

**Strengths:**
- Flexible schema that is easy to evolve during early development.
- Reading a whole document in one request, without joins.
- Built-in horizontal scaling and sharding.

## Other NoSQL types
- **Key-value stores** such as Redis: extremely fast caching, sessions and rate limiting.
- **Wide-column stores** such as Cassandra: massive write throughput across data centers.
- **Graph databases** such as Neo4j: relationship-heavy data like social networks and recommendations.

## How to decide
Choose **SQL** when:
- Your data has clear relationships: users, orders, products, payments.
- You need transactions across multiple records, as in banking or inventory.
- You will run ad-hoc reports and analytics.

Choose a **document database** when:
- Data is naturally hierarchical and read as a whole, such as a product catalog with varying attributes.
- The structure changes frequently.
- You need simple horizontal scaling for very large volumes.

## The middle ground
PostgreSQL supports a [[JSONB]] column type with indexing, so you can store flexible attributes inside a relational database:

~~~sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  attributes JSONB
);

SELECT name FROM products WHERE attributes->>'color' = 'black';
~~~

Many teams find this gives them most of the flexibility of NoSQL with the safety of SQL.

## Common myths
- **"NoSQL is always faster."** Speed depends on data modeling and indexes, not the label.
- **"SQL cannot scale."** Read replicas, partitioning and managed services handle very large workloads.
- **"MongoDB has no transactions."** It has supported multi-document transactions since version 4.0.

## Our recommendation
For most web applications, start with **PostgreSQL**. Add **Redis** for caching when needed, and use a document or search database only for specific needs it clearly serves better. Many successful products run on exactly this stack.`],

['a4', '2026-11-05', '🚀', '8 min', 'PostgreSQL Indexing: Speed Up Slow SQL Queries',
'Read EXPLAIN ANALYZE, choose the right index type and avoid common indexing mistakes.',
`When a table grows past a few hundred thousand rows, a query that once took milliseconds can take seconds. In most cases the fix is the right index. This guide shows how to find slow queries and index them properly in PostgreSQL.

## What an index does
Without an index, PostgreSQL performs a **sequential scan**, reading every row to find matches. An index is a separate sorted structure, by default a **B-tree**, that lets the database jump directly to matching rows, much like the index at the back of a book.

## Step 1: Find slow queries
Enable the **pg_stat_statements** extension to see which queries use the most total time. Many managed databases also include query insights dashboards.

## Step 2: Read the query plan

~~~sql
EXPLAIN ANALYZE
SELECT * FROM orders WHERE customer_id = 4821 ORDER BY created_at DESC LIMIT 20;
~~~

Look for:
- **Seq Scan** on a large table where few rows are returned: a likely missing index.
- **Rows removed by filter:** many rows read and discarded.
- **Actual time** and the estimated versus actual row counts. Large differences suggest outdated statistics; run [[ANALYZE orders;]].

## Step 3: Create the right index

~~~sql
CREATE INDEX CONCURRENTLY idx_orders_customer_created
ON orders (customer_id, created_at DESC);
~~~

This **composite index** supports both the filter and the sort, so PostgreSQL can return the newest twenty orders without sorting. [[CONCURRENTLY]] builds the index without blocking writes on a live table.

## Column order in composite indexes
An index on [[(customer_id, created_at)]] helps queries filtering on [[customer_id]] alone, or on both columns. It does not help a query filtering only on [[created_at]]. Put equality filters first and range or sort columns after.

## Other useful index types
- **Partial index:** index only the rows you query often.

~~~sql
CREATE INDEX idx_orders_pending ON orders (created_at) WHERE status = 'pending';
~~~

- **Expression index:** for case-insensitive search.

~~~sql
CREATE INDEX idx_users_email_lower ON users (lower(email));
-- used by: WHERE lower(email) = lower('Asha@Example.com')
~~~

- **GIN index:** for JSONB, arrays and full-text search.
- **Covering index** with [[INCLUDE]]: stores extra columns so queries can be answered from the index alone.

## Index foreign keys
PostgreSQL does not automatically index foreign key columns. Joins and deletes on parent tables can become very slow without them, so add indexes on columns such as [[orders.customer_id]].

## Common mistakes
- **Functions on indexed columns:** [[WHERE date(created_at) = '2026-11-01']] cannot use a plain index on [[created_at]]. Use a range instead: [[created_at >= '2026-11-01' AND created_at < '2026-11-02']].
- **Leading wildcards:** [[LIKE '%phone']] cannot use a B-tree index. Consider the **pg_trgm** extension with a GIN index.
- **Too many indexes:** every index slows down inserts and updates and uses disk space. Remove unused ones; check the [[pg_stat_user_indexes]] view for indexes with zero scans.
- **Indexing low-selectivity columns** such as a boolean flag alone rarely helps, except as a partial index.

## Measure again
After adding an index, run [[EXPLAIN ANALYZE]] again and confirm the plan shows an **Index Scan** or **Index Only Scan** with a lower execution time. Optimization is always measure, change, measure.`],

]);
