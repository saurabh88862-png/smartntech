// SmartNTech — Java articles
// Format: [id, date, emoji, readTime, title, excerpt, body]
// In body: [[code]] = inline code, ~~~lang ... ~~~ = code block, ## = heading, - = bullet, **bold**
snt('Java', 'from-orange-400 to-rose-500', [

['j1', '2026-11-18', '☕', '8 min', 'Java for Beginners: Your First Program Explained Line by Line',
'Install the JDK, write Hello World and understand what every keyword actually means.',
`Java is one of the most widely used programming languages in the world. It powers Android apps, banking systems, e-commerce backends and countless enterprise tools. If you are just starting out, the best way to learn is to write a small program and understand every single word in it.

## Step 1: Install the JDK
Download a recent **JDK** (Java Development Kit), such as Eclipse Temurin 21, and install it. Open a terminal and run [[java -version]] and [[javac -version]]. If both print a version number, you are ready.

## Step 2: Write Hello World
Create a file called [[Hello.java]] and type:

~~~java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, SmartNTech!");
    }
}
~~~

Compile it with [[javac Hello.java]] and run it with [[java Hello]].

## Understanding every keyword
- **public class Hello:** every Java program lives inside a class. The file name must match the public class name exactly, including capital letters.
- **public:** the method can be called from anywhere, which the JVM needs in order to start your program.
- **static:** the method belongs to the class itself, so Java can run it without creating an object first.
- **void:** the method does not return a value.
- **main(String[] args):** the entry point. [[args]] holds any command-line arguments you pass in.
- **System.out.println:** prints a line of text to the console.

## How Java actually runs
When you run [[javac]], your code is compiled into **bytecode** stored in a [[.class]] file. The **JVM** (Java Virtual Machine) then reads that bytecode and runs it. Because every operating system has its own JVM, the same bytecode runs on Windows, macOS and Linux. That is the famous "write once, run anywhere" promise.

## Common beginner errors
- **Class name mismatch:** saving [[hello.java]] with [[public class Hello]] causes a compile error.
- **Missing semicolon:** every statement ends with [[;]].
- **Case sensitivity:** [[system.out.println]] will not work; it must be [[System]].

## What to learn next
Once Hello World works, move on to variables, data types, if-else conditions and loops. Write tiny programs every day: a calculator, a number guessing game, a multiplication table. Consistent practice builds confidence far faster than reading theory.`],

['j2', '2026-11-14', '🔢', '7 min', 'Java Data Types and Variables: Primitive vs Reference Types',
'int, double, boolean, String and objects: how Java stores values in memory.',
`Every value in Java has a type, and the compiler checks those types before your program runs. Understanding the difference between primitive and reference types is one of the most important foundations in Java.

## The 8 primitive types
- **byte** (8-bit), **short** (16-bit), **int** (32-bit) and **long** (64-bit) store whole numbers.
- **float** and **double** store decimal numbers. Prefer [[double]] for most calculations.
- **char** stores a single Unicode character, like [['A']].
- **boolean** stores [[true]] or [[false]].

~~~java
int age = 25;
long population = 1_400_000_000L;
double price = 499.99;
char grade = 'A';
boolean isActive = true;
~~~

Underscores in numbers are allowed for readability, and the [[L]] suffix marks a long literal.

## Reference types
Anything that is not a primitive is a **reference type**: [[String]], arrays, and every object you create from a class. A reference variable does not hold the object itself. It holds an address that points to the object in **heap** memory.

~~~java
String name = "Ravi";
int[] marks = {90, 85, 77};
StringBuilder sb = new StringBuilder();
~~~

## Why the difference matters
When you assign one primitive to another, the value is copied. When you assign one reference to another, only the address is copied, so both variables point to the same object.

~~~java
int a = 5;
int b = a;   // b gets its own copy
b = 10;      // a is still 5

int[] x = {1, 2, 3};
int[] y = x; // y points to the same array
y[0] = 99;   // x[0] is now 99 too
~~~

## Wrapper classes and autoboxing
Collections like [[ArrayList]] can only store objects, so Java provides wrapper classes: [[Integer]], [[Double]], [[Boolean]] and so on. Java converts automatically between [[int]] and [[Integer]], which is called **autoboxing**. Be careful: a wrapper can be [[null]], and unboxing a null throws a [[NullPointerException]].

## The var keyword
Since Java 10 you can write [[var count = 10;]] and the compiler infers the type. The variable is still strongly typed; [[var]] only saves typing. Use it when the type is obvious from the right-hand side.

## Comparing values
Use [[==]] for primitives. For objects, including Strings, use [[.equals()]], because [[==]] only checks whether two references point to the same object.`],

['j3', '2026-11-08', '🧱', '9 min', 'Object-Oriented Programming in Java: The 4 Pillars with Examples',
'Encapsulation, inheritance, polymorphism and abstraction explained with real code.',
`Object-Oriented Programming (OOP) organizes code around objects that combine data and behavior. Java was designed around OOP, and interviewers almost always ask about its four pillars.

## 1. Encapsulation
Encapsulation means hiding an object's internal data and exposing it only through methods. This protects the data from invalid changes.

~~~java
public class BankAccount {
    private double balance;

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        balance += amount;
    }

    public double getBalance() {
        return balance;
    }
}
~~~

Because [[balance]] is private, no other class can set it to a negative number directly.

## 2. Inheritance
Inheritance lets a class reuse and extend another class using [[extends]].

~~~java
class Vehicle {
    void start() { System.out.println("Starting vehicle"); }
}

class Car extends Vehicle {
    void openSunroof() { System.out.println("Sunroof open"); }
}
~~~

A [[Car]] can call both [[start()]] and [[openSunroof()]]. Java supports single inheritance for classes, but a class can implement many interfaces.

## 3. Polymorphism
Polymorphism means one interface, many forms. A parent reference can point to a child object, and the overridden method of the child runs at runtime.

~~~java
class Animal { void sound() { System.out.println("..."); } }
class Dog extends Animal { @Override void sound() { System.out.println("Woof"); } }
class Cat extends Animal { @Override void sound() { System.out.println("Meow"); } }

Animal a = new Dog();
a.sound(); // prints Woof
~~~

This is **runtime polymorphism** (method overriding). **Compile-time polymorphism** is method overloading: several methods with the same name but different parameters.

## 4. Abstraction
Abstraction shows only what an object does, not how it does it. Java uses abstract classes and interfaces for this.

~~~java
interface PaymentMethod {
    void pay(double amount);
}

class UpiPayment implements PaymentMethod {
    public void pay(double amount) { System.out.println("Paid " + amount + " via UPI"); }
}
~~~

Code that uses [[PaymentMethod]] does not care whether the payment is UPI, card or wallet.

## Abstract class vs interface
- An **abstract class** can have fields, constructors and both abstract and concrete methods.
- An **interface** defines a contract. Since Java 8 it can contain default and static methods, but no instance fields.
- Use an interface for capabilities shared by unrelated classes, and an abstract class for closely related classes that share code.

## Putting it together
Good OOP design keeps classes small, data private, and depends on interfaces rather than concrete classes. These habits make code easier to test, extend and maintain.`],

['j4', '2026-11-01', '📦', '9 min', 'Java Collections Framework: List, Set and Map Explained',
'When to use ArrayList, LinkedList, HashSet, TreeSet and HashMap, with examples.',
`The Java Collections Framework provides ready-made data structures so you never have to write your own dynamic array or hash table. Choosing the right collection makes your code faster and clearer.

## List: ordered, allows duplicates
- **ArrayList** is backed by a resizable array. Reading by index is very fast, while inserting in the middle is slower because elements must shift.
- **LinkedList** is a doubly linked list. Adding or removing at the ends is fast, but reading by index is slow.

~~~java
List<String> cities = new ArrayList<>();
cities.add("Delhi");
cities.add("Mumbai");
cities.add("Delhi"); // duplicates allowed
System.out.println(cities.get(1)); // Mumbai
~~~

In practice, [[ArrayList]] is the right choice most of the time.

## Set: no duplicates
- **HashSet** offers fast add, remove and contains, with no guaranteed order.
- **LinkedHashSet** keeps insertion order.
- **TreeSet** keeps elements sorted.

~~~java
Set<Integer> ids = new HashSet<>(List.of(3, 1, 3, 2));
System.out.println(ids.size()); // 3
~~~

## Map: key-value pairs
- **HashMap** is the general-purpose choice, with near constant-time lookups.
- **LinkedHashMap** preserves insertion order and can be used to build an LRU cache.
- **TreeMap** keeps keys sorted.

~~~java
Map<String, Integer> stock = new HashMap<>();
stock.put("apple", 50);
stock.merge("apple", 10, Integer::sum); // 60
stock.getOrDefault("mango", 0);        // 0
~~~

## How HashMap works internally
A HashMap stores entries in an array of **buckets**. It calls [[hashCode()]] on the key to pick a bucket, then uses [[equals()]] to find the exact key inside that bucket. When many keys land in the same bucket, Java 8 and later convert the bucket from a linked list into a balanced tree to keep lookups fast. When the map fills beyond its **load factor** (0.75 by default), it doubles in size and rehashes.

## The equals and hashCode contract
If you use your own objects as keys, override both [[equals()]] and [[hashCode()]]. Two equal objects must return the same hash code, otherwise the map will not find them. Java records do this for you automatically.

## Iterating safely
Modifying a collection while looping over it with a for-each loop throws a [[ConcurrentModificationException]]. Use [[removeIf]] instead:

~~~java
cities.removeIf(c -> c.startsWith("D"));
~~~

## Quick decision guide
- Need order and index access: [[ArrayList]].
- Need uniqueness: [[HashSet]].
- Need lookup by key: [[HashMap]].
- Need sorting: [[TreeSet]] or [[TreeMap]].`],

['j5', '2026-10-27', '🌊', '8 min', 'Java Streams and Lambda Expressions: A Practical Guide',
'Filter, map, reduce and collect data in clean, readable pipelines.',
`Java 8 introduced lambda expressions and the Stream API, which changed how Java developers process data. Instead of writing long loops, you describe what you want and let the stream handle how.

## Lambda expressions
A lambda is a short anonymous function. It works anywhere Java expects a **functional interface**, which is an interface with exactly one abstract method.

~~~java
// Before Java 8
Comparator<String> byLength = new Comparator<String>() {
    public int compare(String a, String b) { return a.length() - b.length(); }
};

// With a lambda
Comparator<String> byLength2 = (a, b) -> a.length() - b.length();
~~~

## Creating a stream
You can get a stream from any collection with [[.stream()]], from arrays with [[Arrays.stream()]], or from values with [[Stream.of()]].

## Intermediate operations
These return a new stream and are lazy, which means nothing runs until a terminal operation is called.
- **filter** keeps elements that match a condition.
- **map** transforms each element.
- **sorted**, **distinct** and **limit** do what their names suggest.

## Terminal operations
- **collect** gathers results into a List, Set or Map.
- **forEach** performs an action on each element.
- **count**, **sum**, **min**, **max** and **reduce** produce a single value.

## A real example
Suppose you have a list of employees and want the names of the top three earners in the IT department:

~~~java
List<String> top = employees.stream()
    .filter(e -> e.getDept().equals("IT"))
    .sorted(Comparator.comparingDouble(Employee::getSalary).reversed())
    .limit(3)
    .map(Employee::getName)
    .collect(Collectors.toList());
~~~

[[Employee::getName]] is a **method reference**, a shorter way of writing [[e -> e.getName()]].

## Grouping data
[[Collectors.groupingBy]] is extremely useful for reports:

~~~java
Map<String, Long> countByDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDept, Collectors.counting()));
~~~

## Optional results
Methods like [[findFirst()]] return an [[Optional]], which forces you to handle the case where nothing is found:

~~~java
String name = employees.stream()
    .filter(e -> e.getSalary() > 100000)
    .map(Employee::getName)
    .findFirst()
    .orElse("No one");
~~~

## Tips
- Keep lambdas short. If one grows beyond a few lines, move it into a named method.
- Avoid changing external variables inside streams; return results instead.
- Parallel streams can help with large CPU-heavy work, but they add overhead for small lists. Measure before using them.`],

['j6', '2026-10-21', '🚨', '7 min', 'Exception Handling in Java: try-catch, finally and Custom Exceptions',
'Checked vs unchecked exceptions, try-with-resources and best practices.',
`Exceptions are Java's way of signaling that something went wrong: a file is missing, a network call failed or a value is invalid. Handling them correctly keeps your program stable and your error messages useful.

## The exception hierarchy
All exceptions extend [[Throwable]]. It has two main branches:
- **Error:** serious problems like [[OutOfMemoryError]] that applications should not try to catch.
- **Exception:** problems your code can handle.

Within [[Exception]], there are two kinds:
- **Checked exceptions** such as [[IOException]] and [[SQLException]]. The compiler forces you to catch them or declare them with [[throws]].
- **Unchecked exceptions**, which extend [[RuntimeException]], such as [[NullPointerException]], [[IllegalArgumentException]] and [[ArrayIndexOutOfBoundsException]]. These usually indicate programming bugs.

## try, catch and finally

~~~java
try {
    int result = 10 / divisor;
    System.out.println(result);
} catch (ArithmeticException e) {
    System.out.println("Cannot divide by zero");
} finally {
    System.out.println("This always runs");
}
~~~

The [[finally]] block runs whether or not an exception occurs, which makes it useful for cleanup.

## Catching multiple exceptions

~~~java
try {
    // risky code
} catch (IOException | SQLException e) {
    log.error("Data access failed", e);
}
~~~

## try-with-resources
Files, database connections and streams must be closed. Since Java 7, any object that implements [[AutoCloseable]] can be closed automatically:

~~~java
try (BufferedReader reader = Files.newBufferedReader(Path.of("data.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    System.out.println("Could not read file: " + e.getMessage());
}
~~~

## Custom exceptions
Create your own exception when it makes errors clearer for callers:

~~~java
public class InsufficientBalanceException extends RuntimeException {
    public InsufficientBalanceException(double needed) {
        super("Insufficient balance. Need " + needed + " more.");
    }
}
~~~

## Best practices
- **Never swallow exceptions** with an empty catch block. At minimum, log them.
- **Catch specific exceptions**, not [[Exception]] or [[Throwable]].
- **Keep the original cause** when wrapping: [[throw new ServiceException("Failed", e);]].
- **Fail fast:** validate inputs at the start of a method and throw [[IllegalArgumentException]] early.
- **Do not use exceptions for normal control flow**, because they are slower and make code harder to follow.

## throw vs throws
[[throw]] actually raises an exception inside a method. [[throws]] in a method signature declares that the method might pass a checked exception to its caller.`],

['j7', '2026-10-15', '🧵', '9 min', 'Multithreading in Java: Threads, ExecutorService and Synchronization',
'Run tasks in parallel safely, avoid race conditions and use thread pools.',
`Multithreading lets a program do several things at once: handle many web requests, download files in the background or process large datasets faster. It is powerful, but it also introduces bugs that are hard to reproduce. Here is how to use it safely.

## Creating a thread
The simplest way is to pass a [[Runnable]] lambda to a [[Thread]]:

~~~java
Thread worker = new Thread(() -> System.out.println("Running in " + Thread.currentThread().getName()));
worker.start();
~~~

Always call [[start()]], not [[run()]]. Calling [[run()]] directly executes the code on the current thread.

## Use thread pools instead
Creating a new thread for every task is expensive. An **ExecutorService** reuses a fixed pool of threads:

~~~java
ExecutorService pool = Executors.newFixedThreadPool(4);
for (int i = 1; i <= 10; i++) {
    int taskId = i;
    pool.submit(() -> System.out.println("Task " + taskId + " on " + Thread.currentThread().getName()));
}
pool.shutdown();
~~~

## Getting results with Future and CompletableFuture
[[submit()]] can return a [[Future]] holding a result. [[CompletableFuture]] is more flexible and lets you chain steps:

~~~java
CompletableFuture<String> userFuture = CompletableFuture.supplyAsync(() -> fetchUser(42));
userFuture.thenApply(String::toUpperCase).thenAccept(System.out::println);
~~~

## The race condition problem
When two threads update shared data at the same time, updates can be lost:

~~~java
class Counter {
    private int count = 0;
    void increment() { count++; } // not thread-safe
}
~~~

[[count++]] is actually three steps: read, add, write. Two threads can read the same value and both write back the same result.

## Fixing it
- **synchronized:** only one thread at a time can run the method.

~~~java
synchronized void increment() { count++; }
~~~

- **Atomic classes:** [[AtomicInteger]] performs lock-free atomic updates and is usually faster.

~~~java
private final AtomicInteger count = new AtomicInteger();
void increment() { count.incrementAndGet(); }
~~~

- **Concurrent collections:** use [[ConcurrentHashMap]] instead of a plain [[HashMap]] when many threads share it.

## Deadlocks
A deadlock happens when thread A holds lock 1 and waits for lock 2, while thread B holds lock 2 and waits for lock 1. Neither can continue. Avoid it by always acquiring locks in the same order and keeping synchronized blocks small.

## Virtual threads (Java 21)
Java 21 introduced **virtual threads**, which are extremely lightweight. You can run thousands of blocking tasks without a large thread pool:

~~~java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    executor.submit(() -> callSlowApi());
}
~~~

They are ideal for I/O-heavy servers. For CPU-heavy work, a fixed pool sized to your CPU cores is still the best choice.`],

['j8', '2026-10-08', '🔤', '6 min', 'Java String, StringBuilder and StringBuffer: Differences and Performance',
'Why Strings are immutable, how the String pool works and when to use StringBuilder.',
`Strings are used in almost every Java program, yet they behave differently from most objects. Knowing how they work helps you write faster code and answer a classic interview question.

## Strings are immutable
Once a [[String]] object is created, its value can never change. Methods like [[toUpperCase()]] or [[replace()]] return a brand-new String.

~~~java
String s = "hello";
s.toUpperCase();
System.out.println(s); // still "hello"
s = s.toUpperCase();   // now s points to a new object "HELLO"
~~~

Immutability makes Strings safe to share between threads, safe to use as HashMap keys, and allows Java to cache their hash codes.

## The String pool
String literals are stored in a special area called the **String pool**. If two literals have the same value, Java reuses the same object:

~~~java
String a = "java";
String b = "java";
String c = new String("java");

System.out.println(a == b);      // true, same pooled object
System.out.println(a == c);      // false, c is a new object
System.out.println(a.equals(c)); // true, same content
~~~

This is why you should always compare String content with [[equals()]].

## The problem with concatenation in loops
Because Strings are immutable, this loop creates a new String on every iteration:

~~~java
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i; // slow: copies the whole string each time
}
~~~

## StringBuilder to the rescue
[[StringBuilder]] is a mutable sequence of characters. It modifies its internal buffer instead of creating new objects:

~~~java
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);
}
String result = sb.toString();
~~~

For large loops this can be hundreds of times faster.

## StringBuffer
[[StringBuffer]] has the same methods as [[StringBuilder]], but every method is synchronized, which makes it thread-safe and slower. It is mostly found in older code. In modern code, use [[StringBuilder]] and avoid sharing it between threads.

## Quick comparison
- **String:** immutable, thread-safe, best for fixed text.
- **StringBuilder:** mutable, not thread-safe, fastest for building text.
- **StringBuffer:** mutable, thread-safe, slower.

## Useful modern String methods
- [[isBlank()]] checks for empty or whitespace-only strings (Java 11).
- [[strip()]] removes leading and trailing whitespace, including Unicode spaces.
- [[repeat(3)]] repeats a string.
- [[String.join(", ", list)]] joins values with a separator.
- Text blocks with triple quotes (Java 15) make multi-line strings such as JSON or SQL much easier to read.`],

['j9', '2026-09-30', '🧠', '8 min', 'JVM Architecture and Garbage Collection Explained Simply',
'Class loader, heap, stack, JIT compiler and how Java frees memory automatically.',
`The Java Virtual Machine is the engine that runs every Java program. You do not need to know its internals to write Java, but understanding the basics helps you debug memory problems and answer senior-level interview questions.

## JDK, JRE and JVM
- **JVM:** runs bytecode.
- **JRE:** the JVM plus the standard libraries needed to run programs.
- **JDK:** the JRE plus development tools such as the [[javac]] compiler.

## Main components of the JVM
- **Class loader:** loads [[.class]] files into memory when they are first needed, verifies the bytecode and links it.
- **Runtime data areas:** the memory regions where your program lives.
- **Execution engine:** interprets bytecode and uses the **JIT (Just-In-Time) compiler** to turn frequently used code into fast native machine code.

## Memory areas
- **Heap:** shared by all threads. Every object created with [[new]] lives here.
- **Stack:** each thread has its own stack. It stores method calls, local variables and references.
- **Metaspace:** stores class metadata. It replaced the older PermGen in Java 8.
- **PC register and native method stack:** track the current instruction and native calls.

When you write [[Person p = new Person();]], the reference [[p]] sits on the stack and the actual [[Person]] object sits on the heap.

## How garbage collection works
Java frees memory automatically. The **garbage collector** finds objects that are no longer reachable from any live reference and reclaims their memory.

The heap is divided into generations because most objects die young:
- **Young generation:** new objects are created in the Eden space. Short-lived objects are cleaned up quickly in minor collections.
- **Old generation:** objects that survive several collections are promoted here and collected less often.

## Common garbage collectors
- **G1 GC:** the default since Java 9. It balances throughput and short pause times.
- **ZGC and Shenandoah:** designed for very large heaps with pauses of only a few milliseconds.
- **Parallel GC:** focuses on maximum throughput for batch jobs.

## Memory leaks still happen
Garbage collection only frees unreachable objects. If your code keeps references you no longer need, memory grows until you hit an [[OutOfMemoryError]]. Common causes include:
- Static collections that keep growing.
- Listeners or callbacks that are never removed.
- Caches without size limits.

## Useful JVM options
- [[-Xms512m -Xmx2g]] set the initial and maximum heap size.
- [[-XX:+UseG1GC]] selects the G1 collector.
- [[-XX:+HeapDumpOnOutOfMemoryError]] saves a heap dump you can analyze later with tools like Eclipse MAT or VisualVM.

Understanding these basics turns mysterious slowdowns into problems you can measure and fix.`],

['j10', '2026-09-22', '🆕', '7 min', 'Modern Java Features from Java 8 to Java 21 You Should Use',
'Records, var, switch expressions, text blocks, pattern matching and more.',
`Java has changed dramatically since Java 8. If you learned Java years ago, these features will make your code shorter, safer and easier to read. Most companies now run Java 17 or Java 21, both long-term support releases.

## Java 8: lambdas, streams and Optional
The biggest change in Java's history introduced functional programming. Lambdas, the Stream API, [[Optional]], default methods in interfaces and the new [[java.time]] date API all arrived in Java 8.

## Java 10: var
Local variable type inference reduces repetition:

~~~java
var users = new ArrayList<User>();
var response = client.send(request, BodyHandlers.ofString());
~~~

## Java 11: handy String methods and HttpClient
[[isBlank()]], [[strip()]], [[lines()]] and [[repeat()]] were added, plus a modern built-in [[HttpClient]] for calling REST APIs.

## Java 14: switch expressions
Switch can now return a value, with no fall-through bugs:

~~~java
String type = switch (day) {
    case SATURDAY, SUNDAY -> "Weekend";
    default -> "Weekday";
};
~~~

## Java 15: text blocks
Multi-line strings no longer need escape characters and plus signs everywhere:

~~~java
String json = """
    {
      "name": "SmartNTech",
      "free": true
    }
    """;
~~~

## Java 16: records
A record is a concise, immutable data class. The compiler generates the constructor, getters, [[equals()]], [[hashCode()]] and [[toString()]]:

~~~java
public record Product(String name, double price) {}

var p = new Product("Laptop", 55000);
System.out.println(p.name()); // Laptop
~~~

Records are perfect for DTOs in Spring Boot applications.

## Java 16: pattern matching for instanceof
No more casting after checking the type:

~~~java
if (obj instanceof String s && !s.isBlank()) {
    System.out.println(s.length());
}
~~~

## Java 17: sealed classes
Sealed classes restrict which classes may extend them, which makes domain models safer:

~~~java
public sealed interface Shape permits Circle, Square {}
~~~

## Java 21: pattern matching for switch and virtual threads
Switch can now match on types and deconstruct records:

~~~java
double area = switch (shape) {
    case Circle c -> Math.PI * c.radius() * c.radius();
    case Square s -> s.side() * s.side();
};
~~~

Virtual threads make it cheap to run thousands of concurrent blocking tasks, which simplifies high-traffic servers.

## Should you upgrade?
Yes. Newer versions bring better performance, improved garbage collectors and security fixes. If you are starting a new project, choose Java 21. If you are learning for interviews, practice records, switch expressions and streams, because modern codebases use them every day.`],

]);
