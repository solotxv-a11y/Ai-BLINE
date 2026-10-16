import { Network, Globe, Smartphone, Terminal } from "lucide-react";
import type { LearningPath } from "@/lib/types";

/**
 * Pentest Academy — complete curriculum.
 * All content is written for LEGAL, AUTHORIZED, DEFENSIVE education only.
 * Every quiz answer index has been verified against its options.
 */
export const LEARNING_PATHS: LearningPath[] = [
  /* ============================== PATH 1 ============================== */
  {
    id: "network-basics",
    title: "Network Basics",
    description: "Understand how networks work before you secure them.",
    icon: Network,
    color: "sky",
    level: "Beginner",
    lessons: [
      {
        id: "nb-1-how-internet-works",
        title: "How the Internet Works",
        minutes: 6,
        summary:
          "A guided tour of packets, routers and layers that shows how data travels from your device to a server and back.",
        content:
          "## From packets to pages\nWhen you open a website, your device breaks the request into small chunks called packets. Each packet carries a header with source and destination IP addresses, then hops through routers that forward it closer to its destination. No single router knows the whole route — each one only picks the next best hop.\n\n## Layers at a glance\nNetworking is described in layers: the link layer moves bits over cables or radio, the IP layer routes packets between networks, TCP guarantees ordered delivery, and application protocols like HTTP build on top. When you study any cyber incident, identifying the layer it targets — cabling, routing, transport or application — is the first step of a good diagnosis.\n\n## Where security fits\nBecause traffic crosses equipment you do not control, encryption matters. HTTPS wraps HTTP inside TLS so anyone sniffing the wire sees only ciphertext. In an authorized lab you can watch this yourself: run `tcpdump -i any port 443` on a server you own and compare it with plain HTTP traffic. Seeing the difference once teaches more than any diagram.",
        keyPoints: [
          "Data travels as packets that routers forward hop by hop.",
          "Each layer (link, IP, transport, application) has its own threats and defenses.",
          "HTTPS/TLS protects data crossing untrusted networks.",
          "Always practice traffic analysis on networks you own or are authorized to test.",
        ],
        quiz: [
          {
            question: "What is a network packet?",
            options: [
              "A physical cable connecting two routers",
              "A small chunk of data with headers used for routing",
              "An encryption key used by HTTPS",
              "A type of firewall rule",
            ],
            answer: 1,
          },
          {
            question: "Why is HTTPS important on public networks?",
            options: [
              "It makes pages load faster",
              "It encrypts traffic so others on the network cannot read it",
              "It hides your device's MAC address",
              "It blocks all advertisements",
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "nb-2-ip-subnets",
        title: "IP Addresses & Subnets",
        minutes: 7,
        summary:
          "Learn how IPv4 and IPv6 addresses identify devices and how subnetting partitions networks into defensible zones.",
        content:
          "## Addresses as street numbers\nAn IPv4 address like `192.168.1.10` has 32 bits, written as four octets. Part of the address identifies the network, the rest identifies the host. The subnet mask (for example `255.255.255.0`, or `/24` in CIDR) decides where the split happens. Devices in the same subnet talk directly; traffic between subnets needs a router.\n\n## Subnetting and segmentation\nOrganizations split networks into subnets to contain problems: a compromised IoT camera in one subnet cannot freely reach the finance servers in another. Firewalls between segments enforce this. Home routers do the same in miniature, separating guest Wi-Fi from your LAN.\n\n## Practice safely\nIn your own lab, use `ip addr` on Linux or `ipconfig` on Windows to inspect your address and mask, then compute which addresses are local. Private ranges like `10.0.0.0/8` and `192.168.0.0/16` are not routable on the public internet — they are designed for internal networks, which is exactly what you should practice on. Never probe addresses outside ranges you are explicitly authorized to test.",
        keyPoints: [
          "IPv4 addresses combine a network part and a host part, split by the mask.",
          "CIDR notation like /24 is shorthand for the subnet mask.",
          "Subnetting enables segmentation, a core defensive strategy.",
          "Practice only on private ranges you own, such as 10.0.0.0/8 or 192.168.0.0/16.",
        ],
        quiz: [
          {
            question: "What does the /24 in 192.168.1.0/24 mean?",
            options: [
              "The first 24 addresses are reserved",
              "The first 24 bits identify the network",
              "The network has 24 routers",
              "The speed is 24 Mbps",
            ],
            answer: 1,
          },
          {
            question: "Which of these is a private IP range?",
            options: ["8.8.8.0/24", "172.32.0.0/16", "10.0.0.0/8", "205.251.0.0/16"],
            answer: 2,
          },
        ],
      },
      {
        id: "nb-3-dns",
        title: "DNS — The Internet's Phonebook",
        minutes: 6,
        summary:
          "See how DNS turns names into addresses, and why spoofed answers make it a favorite attacker target.",
        content:
          "## Names to numbers\nHumans remember `example.com`, machines route on IP addresses. DNS bridges the gap: your resolver walks from the root servers down through the TLD (.com) to the domain's authoritative server, caches the answer, and hands it back. Because caching is everywhere, records carry a TTL that says how long an answer may be reused.\n\n## How DNS gets abused\nAttackers love DNS. Spoofed or poisoned records can silently redirect you to a fake banking site. Malware often uses DNS tunneling to smuggle stolen data inside queries that look harmless. Defenders respond with DNSSEC (cryptographically signed records), DoH/DoT (encrypted queries), and monitoring for unusual query volumes.\n\n## Look for yourself\nIn an authorized lab, run `dig example.com` or `nslookup example.com` and read the answer sections: ANSWER holds the records, AUTHORITY names the responsible servers. Then flush your cache with `resolvectl flush-caches` and query again to watch the round trip happen. Nothing here attacks anyone — it is pure, defensive observation of your own resolver.",
        keyPoints: [
          "DNS resolves names to IP addresses through a hierarchy of servers.",
          "TTL controls how long answers stay cached.",
          "Common attacks: DNS spoofing/poisoning and DNS tunneling.",
          "DNSSEC, DoH/DoT and query monitoring are the main defenses.",
        ],
        quiz: [
          {
            question: "What does a DNS resolver do?",
            options: [
              "Encrypts all web traffic",
              "Translates domain names into IP addresses",
              "Blocks malicious websites",
              "Assigns MAC addresses",
            ],
            answer: 1,
          },
          {
            question: "Which technology digitally signs DNS records to prevent tampering?",
            options: ["DNSSEC", "DHCP", "NAT", "SNMP"],
            answer: 0,
          },
        ],
      },
      {
        id: "nb-4-ports-protocols",
        title: "Ports & Protocols",
        minutes: 7,
        summary:
          "Ports are numbered doors into a machine — learn the common ones and how to list them defensively.",
        content:
          "## Doors into a machine\nAn IP address gets you to a computer; a port reaches the specific service listening there. Web servers answer on `80` (HTTP) and `443` (HTTPS), SSH uses `22`, DNS uses `53`, mail uses `25`/`465`/`587`. The combination `192.168.1.10:443` uniquely names one conversation endpoint.\n\n## Well-known vs ephemeral\nPorts 0–1023 are well-known and reserved for system services; 1024–65535 are used by applications and as ephemeral client ports. Firewalls enforce policy by allowing inbound traffic only to the few ports that must be public — everything else is default-deny. Every open port is potential attack surface, so fewer is better.\n\n## Inspect your own box\nOn a machine you own, list listeners with `ss -tulpn` on Linux or `netstat -ano` on Windows. Match each open port to a service you can name; anything unexplained deserves investigation. In a lab, `nmap -sV localhost` shows how a scanner enumerates versions — run it only against your own devices or a deliberately vulnerable VM, never against other people's systems without written permission.",
        keyPoints: [
          "Ports route traffic to specific services on one IP address.",
          "Well-known ports: 22 SSH, 53 DNS, 80 HTTP, 443 HTTPS.",
          "Default-deny firewalls shrink attack surface.",
          "Audit listening ports regularly on your own machines.",
        ],
        quiz: [
          {
            question: "Which port does HTTPS use by default?",
            options: ["80", "22", "443", "53"],
            answer: 2,
          },
          {
            question: "What is the defensive benefit of closing unused ports?",
            options: [
              "Faster internet speed",
              "Reduces the attack surface available to attackers",
              "Increases IP address space",
              "Enables DHCP",
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "nb-5-wifi-security",
        title: "Wi-Fi Security Basics",
        minutes: 6,
        summary:
          "From WEP to WPA3 — how wireless encryption evolved and how to harden your own router.",
        content:
          "## A short history of Wi-Fi security\nWEP, the first Wi-Fi encryption, was broken within a few years and must never be used. WPA2 with AES brought real protection and remains common. WPA3, the current standard, adds the SAE handshake that resists offline password guessing and provides forward secrecy. If your router offers WPA3 (or WPA2/WPA3 mixed mode), choose it.\n\n## Practical hardening\nSecure your own network in order of impact: WPA3 with a long passphrase, disable WPS (the push-button pairing protocol has known brute-force flaws), keep firmware updated, and put guests and IoT devices on a separate guest subnet. These five steps stop the overwhelming majority of real-world wireless attacks.\n\n## Testing — legally\nOnly audit wireless networks you own or have written permission to assess; capturing other people's traffic is illegal in most jurisdictions. In your lab, tools like `airodump-ng` against your own access point show how handshakes are captured and why long passphrases defeat offline dictionary attacks. Understanding the mechanics is what makes you a better defender.",
        keyPoints: [
          "WEP is broken; use WPA3 or WPA2-AES at minimum.",
          "WPA3's SAE handshake resists offline password guessing.",
          "Disable WPS and keep router firmware updated.",
          "Segment guests and IoT devices onto a separate network.",
        ],
        quiz: [
          {
            question: "Which Wi-Fi security standard should you use today?",
            options: ["WEP", "WPA", "WPA3", "None — open networks are fine"],
            answer: 2,
          },
          {
            question: "Why should WPS usually be disabled?",
            options: [
              "It slows the connection",
              "Its push-button pairing is vulnerable to brute-force attacks",
              "It is incompatible with WPA3",
              "It broadcasts your password in plaintext",
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "nb-6-legal-recon",
        title: "Legal Network Reconnaissance",
        minutes: 8,
        summary:
          "Passive and active reconnaissance techniques — and the legal framework that separates learning from crime.",
        content:
          "## What reconnaissance is\nReconnaissance is information gathering: mapping hosts, services and versions before any assessment. Passive recon only observes — DNS lookups, certificate transparency logs, your own router's tables. Active recon sends packets to the target, like a ping sweep or port scan. The second kind is where law gets involved.\n\n## The legal line\nScanning systems you do not own, or lack explicit written permission to test, is a crime in most countries — even if harmless in intent. Professionals work under rules of engagement: a signed scope saying which IPs, which techniques, which hours. Bug bounty platforms publish a scope too; outside it, you are on your own. Make the habit now: no authorization, no packets.\n\n## Practice in your lab\nBuild a tiny private range: a router, a Raspberry Pi, a deliberately vulnerable VM, all behind your own network. Then run `nmap -sn 192.168.1.0/24` for host discovery and `nmap -sV <host>` for service versions. Document findings like a professional: date, command, result, conclusion. That notebook becomes your first portfolio.",
        keyPoints: [
          "Passive recon observes; active recon sends packets to the target.",
          "Written authorization and scope are mandatory before any scan.",
          "Bug bounty programs define legal testing boundaries.",
          "Build a private lab with owned devices and vulnerable VMs for practice.",
        ],
        quiz: [
          {
            question: "When is it legal to port-scan a network?",
            options: [
              "Anytime, if no harm is done",
              "When you own it or have written permission",
              "Only on weekends",
              "When the network is fast",
            ],
            answer: 1,
          },
          {
            question: "What document defines what a professional tester may touch?",
            options: [
              "A license agreement",
              "Rules of engagement / scope document",
              "A DNS record",
              "An NDA only",
            ],
            answer: 1,
          },
        ],
      },
    ],
  },

  /* ============================== PATH 2 ============================== */
  {
    id: "web-security",
    title: "Web Security",
    description: "Explore the OWASP Top 10 and build secure web habits.",
    icon: Globe,
    color: "emerald",
    level: "Intermediate",
    lessons: [
      {
        id: "ws-1-http-cookies",
        title: "HTTP & Cookies Essentials",
        minutes: 6,
        summary:
          "Requests, responses, status codes and cookies — the raw material every web vulnerability lives inside.",
        content:
          "## The request/response loop\nHTTP is simple at heart: the client sends a request line (`GET /index.html`), headers, sometimes a body; the server replies with a status code, headers and content. Codes tell the story: `200` OK, `301` redirect, `403` forbidden, `404` missing, `500` server error. Reading raw exchanges — try `curl -i https://example.com` — is the fastest way to understand any web app.\n\n## Cookies carry state\nHTTP itself is stateless, so cookies remember who you are: the server sets `Set-Cookie`, the browser echoes it back on every request. Session cookies usually hold a random session ID, which is why stealing one equals hijacking the account. That is why the flags matter: `HttpOnly` hides the cookie from JavaScript, `Secure` sends it only over HTTPS, `SameSite` limits cross-site sending.\n\n## Why this matters for security\nAlmost every web attack manipulates this loop: XSS runs script in your page, CSRF forges your requests, session attacks steal your cookies. In a lab you own, open browser DevTools → Network tab and watch requests fly; inspect Set-Cookie on your own app and check that the security flags are present.",
        keyPoints: [
          "HTTP is a request/response protocol; status codes summarize each outcome.",
          "Cookies provide state; the session ID inside is highly sensitive.",
          "HttpOnly, Secure and SameSite flags are cookie hygiene essentials.",
          "DevTools and curl are the ethical learner's best inspection tools.",
        ],
        quiz: [
          {
            question: "What does the HttpOnly cookie flag do?",
            options: [
              "Encrypts the cookie value",
              "Hides the cookie from JavaScript access",
              "Expires the cookie after login",
              "Sends the cookie to every domain",
            ],
            answer: 1,
          },
          {
            question: "Which status code means 'resource not found'?",
            options: ["200", "301", "404", "500"],
            answer: 2,
          },
        ],
      },
      {
        id: "ws-2-owasp-top10",
        title: "OWASP Top 10 Overview",
        minutes: 7,
        summary:
          "A guided walk through the OWASP Top 10 — the industry's map of the most critical web application risks.",
        content:
          "## What the Top 10 is\nThe OWASP Top 10 is a consensus list of the most significant web application security risks, updated every few years from real-world data. It is not a checklist that guarantees safety — it is a prioritized map of where applications get hurt. Current categories include Broken Access Control, Cryptographic Failures, Injection, Insecure Design and Security Misconfiguration, among others.\n\n## Why it matters to you\nDefenders use the list to prioritize fixes; learners use it to structure study. If you understand one representative bug per category — an IDOR for access control, a hardcoded secret for crypto failures, a SQL injection for injection — you can reason your way through the rest. Every pentest report you will ever read uses this vocabulary.\n\n## Learn it the right way\nPick deliberately vulnerable apps designed for education, such as OWASP Juice Shop or DVWA, and run them in a local Docker container: `docker run --rm -p 3000:3000 bkimminich/juice-shop`. That traffic never leaves your machine, so everything is legal. Try to find one instance of each Top 10 category, then write the fix you would recommend.",
        keyPoints: [
          "The OWASP Top 10 ranks the most critical web app risks from field data.",
          "It is a prioritized map, not a complete security checklist.",
          "Learn one representative bug per category, then generalize.",
          "Practice on local, education-focused apps like Juice Shop or DVWA.",
        ],
        quiz: [
          {
            question: "What is the OWASP Top 10?",
            options: [
              "A list of the 10 fastest web frameworks",
              "A ranked list of the most critical web application security risks",
              "A firewall product",
              "An encryption standard",
            ],
            answer: 1,
          },
          {
            question: "Which practice is the legal way to learn these vulnerabilities?",
            options: [
              "Scanning random public sites",
              "Running deliberately vulnerable apps locally in a lab",
              "Testing a friend's site without asking",
              "Only reading, never practicing",
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "ws-3-xss",
        title: "XSS — Cross-Site Scripting",
        minutes: 8,
        summary:
          "How untrusted input becomes attacker script in someone's browser — and the encoding rules that stop it.",
        content:
          "## The core idea\nXSS happens when an application puts untrusted data into a page without encoding it, so the browser executes it as script. Stored XSS persists (a malicious comment saved to the database), reflected XSS bounces off the request (a search term echoed back), and DOM-based XSS comes from client-side JavaScript writing to unsafe sinks like `innerHTML`.\n\n## Why it is dangerous\nInjected script runs with the victim's privileges: it can read the page, steal non-HttpOnly cookies, fire requests as the user, or keylog the session. On a site with broken access control, one stored XSS against an admin is often game over — the classic attack chain combines them.\n\n## Defenses that actually work\nTreat all user input as untrusted and encode at output context: HTML-encode in body text, attribute-encode in attributes, and never build HTML by string concatenation. Frameworks like React escape by default, so bypassing them (via `dangerouslySetInnerHTML`) needs justification. Add a strict Content-Security-Policy as a second layer, and prefer `textContent` over `innerHTML` in vanilla JS. Practice on a local Juice Shop instance — never on sites you do not own.",
        keyPoints: [
          "XSS = untrusted input executed as script by the victim's browser.",
          "Types: stored, reflected and DOM-based.",
          "Context-aware output encoding is the primary defense.",
          "CSP and safe DOM APIs (textContent) add defense in depth.",
        ],
        quiz: [
          {
            question: "Which payload type is a classic XSS probe?",
            options: [
              "<script>alert(1)</script>",
              "SELECT * FROM users",
              "cat /etc/passwd",
              "192.168.1.1",
            ],
            answer: 0,
          },
          {
            question: "What is the primary defense against XSS?",
            options: [
              "Encrypting the database",
              "Context-aware output encoding of untrusted data",
              "Using longer passwords",
              "Blocking port 80",
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "ws-4-sql-injection",
        title: "SQL Injection",
        minutes: 8,
        summary:
          "One unparameterized query can hand over the whole database — here is how the bug works and how parameterization kills it.",
        content:
          "## Anatomy of the bug\nSQL injection happens when user input is concatenated into a query string. Imagine login code building `SELECT * FROM users WHERE name='\" + input + \"'`. An input like `' OR '1'='1` changes the logic to always-true, and the attacker is logged in as the first user. Worse payloads can read other tables, and in some setups write files.\n\n## The modern fix: parameterized queries\nPrepared statements send SQL and data separately, so input can never change the query's structure. In Node: `db.query(\"SELECT * FROM users WHERE name = ?\", [name])`. In Python: `cursor.execute(\"SELECT * FROM users WHERE name = %s\", (name,))`. Object-relational mappers (Prisma, SQLAlchemy) parameterize by default. There is no meaningful performance penalty — use them everywhere, with no exceptions.\n\n## Practicing legally\nSet up DVWA or Juice Shop locally and work through their SQL injection challenges, then use `sqlmap` only against your own lab targets. When writing reports, explain both the vulnerable query and the fixed one — that pairing is what reviewers and employers actually want to see.",
        keyPoints: [
          "SQLi comes from concatenating input into query strings.",
          "Classic probe: ' OR '1'='1 — an always-true condition.",
          "Parameterized queries / prepared statements are the complete fix.",
          "Practice only on local, deliberately vulnerable applications.",
        ],
        quiz: [
          {
            question: "What input could break out of a poorly-built login query?",
            options: ["' OR '1'='1", "<h1>hello</h1>", "http://x.com", "~/documents"],
            answer: 0,
          },
          {
            question: "Which coding practice prevents SQL injection?",
            options: [
              "String concatenation of input",
              "Parameterized (prepared) queries",
              "Client-side validation only",
              "Base64-encoding input",
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "ws-5-csrf-sessions",
        title: "CSRF & Session Security",
        minutes: 7,
        summary:
          "Why browsers send your cookies automatically, how attackers abuse that, and the defenses that hold.",
        content:
          "## The trust problem\nBrowsers attach relevant cookies to every request — including requests initiated by another site. CSRF exploits this: a malicious page embeds an auto-submitting form or `<img src=\"https://yourbank.com/transfer?to=attacker&amount=100\">`, and if you are logged in, the bank may process it, because the session cookie rides along automatically. The attacker never sees the response; they only need the side effect.\n\n## Defenses\nThe SameSite cookie attribute is the modern baseline: `SameSite=Lax` or `Strict` stops most cross-site sends. Anti-CSRF tokens add a second layer — the server embeds a random token in each form and rejects submissions lacking it; the attacker's page cannot read it due to the same-origin policy. For state-changing APIs, verify the `Origin`/`Referer` header and require a custom header, since cross-site JavaScript cannot set those freely.\n\n## Session security beyond CSRF\nRotate session IDs after login, expire sessions after inactivity, and store session data server-side with only an opaque ID in the cookie. In your lab, build a tiny Flask or Express app, log in, then attempt a forged cross-site POST from another local port — watch the token defense reject it.",
        keyPoints: [
          "CSRF abuses browsers' automatic cookie attachment.",
          "SameSite=Lax/Strict cookies are the modern baseline defense.",
          "Anti-CSRF tokens prove a request came from the app's own pages.",
          "Rotate session IDs on login and expire idle sessions.",
        ],
        quiz: [
          {
            question: "What makes CSRF possible?",
            options: [
              "Browsers automatically send cookies with requests",
              "Weak Wi-Fi passwords",
              "Unpatched servers",
              "Slow network connections",
            ],
            answer: 0,
          },
          {
            question: "Which cookie attribute helps block cross-site request attacks?",
            options: ["HttpOnly", "SameSite=Strict", "Path=/", "Domain=.com"],
            answer: 1,
          },
        ],
      },
      {
        id: "ws-6-https-headers",
        title: "HTTPS & Security Headers",
        minutes: 6,
        summary:
          "TLS certificates, HSTS and the response headers that turn a working site into a hardened one.",
        content:
          "## TLS in one minute\nHTTPS is HTTP inside TLS: certificates prove the server's identity, a key exchange establishes a shared secret, and everything after is encrypted. Modern TLS 1.3 does this in one round trip. Certificates come from certificate authorities (or your own CA in a lab via `mkcert`), and browsers fail loudly when they are invalid — which is why mixed HTTP content now triggers warnings.\n\n## Headers worth setting\nResponse headers are free hardening: `Strict-Transport-Security` (HSTS) forces HTTPS for future visits; `Content-Security-Policy` restricts what scripts may run, gutting most XSS; `X-Content-Type-Options: nosniff` stops MIME confusion; `Referrer-Policy` limits data leakage in outbound links; `Permissions-Policy` turns off powerful browser APIs you do not use. Check any site with `curl -I` or securityheaders.com — reading headers is passive and legal.\n\n## Verify your own setup\nFor lab servers, run `testssl.sh localhost` or visit SSL Labs for public domains you own. Aim for TLS 1.2 minimum, prefer 1.3, and disable obsolete ciphers. Security is not one setting — it is a stack of small defaults, all pointing the same direction.",
        keyPoints: [
          "HTTPS = HTTP + TLS: identity via certificates, confidentiality via encryption.",
          "HSTS forces HTTPS on future visits.",
          "CSP is the strongest header-level defense against XSS.",
          "Audit headers passively with curl -I or securityheaders.com.",
        ],
        quiz: [
          {
            question: "What does HSTS do?",
            options: [
              "Encrypts DNS queries",
              "Forces browsers to use HTTPS for future visits",
              "Blocks all cookies",
              "Compresses responses",
            ],
            answer: 1,
          },
          {
            question: "Which header most reduces XSS risk by restricting script sources?",
            options: [
              "Content-Security-Policy",
              "Accept-Language",
              "Cache-Control",
              "Server",
            ],
            answer: 0,
          },
        ],
      },
    ],
  },

  /* ============================== PATH 3 ============================== */
  {
    id: "android-security",
    title: "Android Security",
    description: "Protect your Android device like a professional.",
    icon: Smartphone,
    color: "violet",
    level: "Beginner",
    lessons: [
      {
        id: "as-1-architecture",
        title: "Android Security Architecture",
        minutes: 6,
        summary:
          "Sandboxing, SELinux and the app model — how Android contains damage even when an app turns hostile.",
        content:
          "## Sandboxes all the way down\nEvery Android app runs as its own Linux user (UID) inside a sandbox: it can only touch its own files and explicitly granted resources. One malicious app cannot simply read another app's data — the kernel enforces the boundary. Communication between apps goes through controlled channels like Intents and Binder, where permissions are checked.\n\n## Deeper layers\nOn top of the Linux foundation sits SELinux in enforcing mode, applying mandatory access control to system daemons and apps alike. Verified boot chains each boot stage cryptographically to the previous one, so tampered system images are detected. Google Play Protect scans apps continuously, and hardware security modules (the TEE / Titan M) guard keys even if the OS is compromised.\n\n## What it means for you\nThe architecture is strong, but layered defense still matters: install from trusted sources, keep the OS updated (patches ship monthly), and review app permissions. In a lab, Android's developer options and `adb` let you inspect your own device safely — for example `adb shell pm list packages` to list installed apps. Observing your own device is always legitimate.",
        keyPoints: [
          "Each app runs in its own Linux sandbox with a unique UID.",
          "SELinux enforcing mode adds mandatory access control.",
          "Verified boot detects tampered system images.",
          "Monthly security patches are your most important update.",
        ],
        quiz: [
          {
            question: "What isolates one Android app's data from another?",
            options: [
              "The app's icon color",
              "Per-app Linux sandboxes with unique UIDs",
              "Cloud storage quotas",
              "The Play Store rating",
            ],
            answer: 1,
          },
          {
            question: "What does Android Verified Boot do?",
            options: [
              "Speeds up app launches",
              "Cryptographically checks boot integrity at each stage",
              "Backs up photos",
              "Increases battery life",
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "as-2-permissions",
        title: "Permissions & Privacy",
        minutes: 6,
        summary:
          "Android's permission model from runtime grants to one-time access — and how to audit your own apps.",
        content:
          "## The permission model\nSince Android 6.0, dangerous permissions (location, camera, microphone, contacts) are requested at runtime, not just at install. Modern Android goes further: one-time permissions expire when the session ends, location can be granted \"only while using the app,\" and unused apps automatically lose runtime permissions. Background access to sensitive data is restricted further with each Android release.\n\n## Auditing your own device\nOpen Settings → Privacy → Permission manager to see which apps hold camera, microphone or location, and revoke anything that does not make sense. A flashlight app asking for contacts is a red flag. Check each app's \"Recently accessed\" indicators — Android shows when sensitive sensors were last used. These five minutes of review catch most privacy leaks.\n\n## Why apps overreach\nAdvertising SDKs are the usual reason apps collect more than needed. Prefer open-source or paid alternatives for sensitive categories, and deny notification permissions to apps that spam. There is nothing illegal about inspecting permission prompts on your own phone — it is the simplest, most effective privacy practice available.",
        keyPoints: [
          "Dangerous permissions are granted at runtime and can be revoked anytime.",
          "One-time and while-in-use grants limit background snooping.",
          "Permission manager shows which apps hold what — audit monthly.",
          "Unusual permission requests are the classic sign of data-hungry apps.",
        ],
        quiz: [
          {
            question: "When are dangerous permissions granted on modern Android?",
            options: [
              "At install time only",
              "At runtime, with user consent",
              "Automatically by the carrier",
              "Never",
            ],
            answer: 1,
          },
          {
            question: "Where can you review which apps currently hold the location permission?",
            options: [
              "Play Store reviews",
              "Settings → Privacy → Permission manager",
              "The app's changelog",
              "Battery settings",
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "as-3-app-hardening",
        title: "App Hardening & Updates",
        minutes: 5,
        summary:
          "How to keep your installed apps — and their data — as safe as the OS underneath.",
        content:
          "## Updates are the patch panel\nMost real-world mobile attacks exploit known, already-fixed bugs. Monthly security patches fix OS flaws, but app updates matter just as much: they close vulnerabilities in the SDKs and libraries each app bundles. Enable automatic updates in the Play Store, and reboot your phone regularly — many patch mechanisms complete on restart.\n\n## Install sources matter\nSideloading APKs bypasses Play Protect scanning and version verification. If you must (for example, a trusted open-source app from its official repository), verify the developer's signature and read what permissions it demands. Downloading \"modded\" or cracked apps from random sites is the single most common way phones get infected — the malware rides inside the app you asked for.\n\n## Hardening settings that matter\nTurn on Play Protect scanning, disable installs from unknown sources per app (not globally), use a strong biometric + PIN combination, and enable Find My Device before you need it. For highly sensitive use, a separate work profile isolates risk. None of this requires technical heroics — it is hygiene, consistently applied.",
        keyPoints: [
          "Update the OS and apps promptly; most attacks use known bugs.",
          "Sideloading from random sites is the top malware infection path.",
          "Keep Play Protect on and unknown-sources installs off by default.",
          "Use biometrics + PIN and enable Find My Device early.",
        ],
        quiz: [
          {
            question: "Why do app updates matter even if Android itself is patched?",
            options: [
              "They change app icons",
              "They fix vulnerabilities in bundled libraries and SDKs",
              "They increase storage",
              "They are legally required",
            ],
            answer: 1,
          },
          {
            question: "What is the most common way phones get infected with malware?",
            options: [
              "Installing cracked/modded APKs from random sites",
              "Charging overnight",
              "Using dark mode",
              "Turning on Bluetooth once",
            ],
            answer: 0,
          },
        ],
      },
      {
        id: "as-4-secure-storage",
        title: "Secure Storage on Android",
        minutes: 7,
        summary:
          "Keystore, encrypted file storage and backups — where sensitive data should live on a modern Android device.",
        content:
          "## The hardware vault\nThe Android Keystore lets apps generate and use cryptographic keys that never leave secure hardware — the TEE or StrongBox element performs operations but cannot export the key. Biometric authentication can be bound to key usage, so signing a transaction requires your fingerprint. This is why a stolen phone's banking app is still hard to crack.\n\n## App data at rest\nApps should store private data in their sandboxed directory, encrypted with Jetpack Security (EncryptedSharedPreferences / EncryptedFile) for anything sensitive. Storing secrets in plain SharedPreferences or, worse, hardcoded strings in the APK is a classic finding in mobile pentests — secrets in code are extracted in seconds with `apktool`. Databases can use SQLCipher for full-file encryption.\n\n## Your part as a user\nEnable device encryption (default on modern Android), require a strong backup password if you use device backups, and review what an app backs up to the cloud. In a lab, you can inspect your own app data with `adb backup` or run `adb shell` and list files — legal on devices you own, and the fastest way to understand sandbox boundaries.",
        keyPoints: [
          "Keystore keys live in secure hardware and cannot be exported.",
          "EncryptedSharedPreferences / EncryptedFile protect app-local secrets.",
          "Hardcoded secrets in APKs are a classic, easily-extracted vulnerability.",
          "Device encryption is on by default — protect it with a strong PIN.",
        ],
        quiz: [
          {
            question: "What is special about keys in the Android Keystore?",
            options: [
              "They are stored in the cloud",
              "They can be used but not exported from secure hardware",
              "They are the same on every device",
              "They only work offline",
            ],
            answer: 1,
          },
          {
            question: "Why is hardcoding API keys in an APK dangerous?",
            options: [
              "APKs can be decompiled and secrets extracted easily",
              "Keys slow down the app",
              "It makes apps larger",
              "It prevents updates",
            ],
            answer: 0,
          },
        ],
      },
      {
        id: "as-5-malware-phishing",
        title: "Malware & Phishing Defense",
        minutes: 6,
        summary:
          "Recognize the tricks mobile malware and smishing use, and build a response plan that works.",
        content:
          "## How phones actually get compromised\nThe dominant paths are social, not technical: a convincing text (\"your package is waiting — pay 1.99 customs\"), a fake delivery app, a QR code sticker swapped over the real one, or a \"security update\" APK sent over chat. Mobile malware rarely hacks the OS; it asks the user politely and exploits urgency.\n\n## Recognition patterns\nTreat every unsolicited link as hostile until proven otherwise. Check the real domain — `bank-secure-login.com` is not your bank. Urgency plus payment plus a link is the smishing trifecta. On Android, watch for permission prompts that do not match the app's job: an SMS app asking for accessibility access is a classic overlay-attack setup. Accessibility services are powerful — never grant them to apps you do not fully trust.\n\n## Response plan\nIf you tapped: disconnect from networks, change critical passwords from a different device, enable 2FA everywhere, run a Play Protect scan, and factory-reset if banking apps were involved. Report the number to your carrier. In a lab, analyzing screenshots of your own received texts for red flags is safe and educational — no real sender is ever contacted.",
        keyPoints: [
          "Most mobile compromise starts with social engineering, not zero-days.",
          "Urgency + payment + link is the smishing trifecta.",
          "Never grant accessibility services to untrusted apps.",
          "If tapped: isolate, change passwords from another device, scan, report.",
        ],
        quiz: [
          {
            question: "Which message is a classic smishing pattern?",
            options: [
              "'Your package is held — pay a small fee via this link'",
              "'Happy birthday!'",
              "'Meeting moved to 3pm'",
              "'The weather will be sunny'",
            ],
            answer: 0,
          },
          {
            question: "Why is granting accessibility services risky?",
            options: [
              "They can read the screen and overlay fake UI on other apps",
              "They use a lot of battery",
              "They are deprecated",
              "They require root",
            ],
            answer: 0,
          },
        ],
      },
      {
        id: "as-6-mobile-testing",
        title: "Mobile Testing Basics (Legal)",
        minutes: 8,
        summary:
          "Set up an ethical Android testing lab with emulators and adb — and stay inside clear legal lines.",
        content:
          "## Your legal lab\nAndroid testing is legal when you own the device or emulator and the app. The standard setup: Android Studio's emulator (no real device needed), or a spare phone with developer mode enabled. Apps come from your own projects, education platforms like OWASP's MASTG (Mobile Application Security Testing Guide), or intentionally vulnerable apps such as InsecureBankv2.\n\n## The toolchain\n`adb` is the backbone: `adb devices` lists connected targets, `adb install app.apk` deploys, `adb logcat` streams system logs, `adb shell` opens a shell. For static analysis, `apktool d app.apk` decodes resources and the manifest; `jadx` decompiles to readable Java. MobSF bundles static and dynamic analysis into one web UI. None of these tools attack anyone — they inspect artifacts you possess.\n\n## Method and ethics\nFollow a real methodology: read the manifest (exported components?), inspect storage (secrets in plaintext?), check network traffic with a local proxy like Burp Suite configured for your emulator only. Document everything. The legal line is simple: your emulator, your apps, your accounts. Never analyze someone else's app with intent to distribute cracks, and never intercept traffic you are not authorized to test.",
        keyPoints: [
          "Own the device/emulator and the app before testing anything.",
          "adb, apktool, jadx and MobSF form the standard learning toolchain.",
          "OWASP MASTG is the reference methodology for mobile testing.",
          "Analyzing apps to redistribute cracks is illegal regardless of intent.",
        ],
        quiz: [
          {
            question: "Which setup makes mobile testing clearly legal?",
            options: [
              "A friend's phone without telling them",
              "Your own emulator running apps you own",
              "A company's production app",
              "Any device at a coffee shop",
            ],
            answer: 1,
          },
          {
            question: "What does 'adb logcat' do?",
            options: [
              "Installs an app",
              "Streams the device's system logs",
              "Decompiles an APK",
              "Signs an APK",
            ],
            answer: 1,
          },
        ],
      },
    ],
  },

  /* ============================== PATH 4 ============================== */
  {
    id: "linux-hacking",
    title: "Linux for Ethical Hackers",
    description: "Master the ethical hacker's favorite operating system.",
    icon: Terminal,
    color: "neon",
    level: "Advanced",
    lessons: [
      {
        id: "lh-1-fundamentals",
        title: "Linux Fundamentals & Filesystem",
        minutes: 7,
        summary:
          "The filesystem hierarchy and shell basics every ethical hacker navigates by muscle memory.",
        content:
          "## Everything is a file\nLinux organizes everything under `/`: `/etc` holds configuration, `/var/log` holds logs, `/home` user files, `/root` the admin's home, `/tmp` scratch space, `/proc` live kernel views. Knowing this hierarchy is recon gold in a defensive review — unusual daemons write logs to `/var/log`, misconfigured services leak settings in `/etc`. Commands like `ls -la`, `cd`, `pwd`, `cat` and `less` are your bread and butter.\n\n## The shell as a force multiplier\nThe shell composes small tools into pipelines: `cat access.log | grep 404 | wc -l` counts not-found hits instantly. Learning `grep`, `find`, `head`/`tail`, `cut` and `sort` pays off across every security task — parsing logs, filtering scan output, locating files by permission bits: `find / -perm -4000 -type f 2>/dev/null` lists SUID binaries, a classic audit step on your own systems.\n\n## Practice rhythm\nInstall VirtualBox or use WSL, keep a terminal open daily, and break things in the VM freely — snapshots are your safety net. Try `man <command>` before searching the web; the manual is offline, fast and authoritative. Ten focused minutes a day beats a monthly marathon.",
        keyPoints: [
          "/etc, /var/log, /home and /proc are the directories you will live in.",
          "Pipelines (grep, wc, sort) turn raw logs into answers.",
          "find with -perm -4000 audits SUID binaries on your own systems.",
          "Practice in a VM with snapshots so mistakes are cheap.",
        ],
        quiz: [
          {
            question: "Which directory stores system logs?",
            options: ["/bin", "/var/log", "/usr/games", "/mnt"],
            answer: 1,
          },
          {
            question: "What does 'find / -perm -4000' locate?",
            options: [
              "Hidden files",
              "Files with the SUID bit set",
              "Directories older than 4000 days",
              "Symlinks",
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "lh-2-users-permissions",
        title: "Users, Permissions & sudo",
        minutes: 6,
        summary:
          "Read chmod like a language, understand root, and audit who can do what on a Linux box.",
        content:
          "## Users, groups, root\nLinux is multi-user to the bone: every process runs as a UID, every file belongs to an owner and group. Root (UID 0) bypasses ordinary checks, which is why privilege escalation is the attacker's goal and least privilege is the defender's design. `whoami`, `id` and `ls -l` show you who you are and what things allow.\n\n## Reading permissions\n`-rwxr-x---` reads as: owner rwx, group r-x, others nothing. Change with `chmod` (symbolic or octal: 7=rwx, 6=rw-, 5=r-x); `chown` changes ownership. SUID (`chmod u+s`) lets a program run as its owner — necessary for `passwd`, dangerous when someone SUIDs a shell. A famous lab exercise: find world-writable files on your own box (`find / -writable -type f 2>/dev/null`) and reason about the impact.\n\n## sudo done right\nsudo grants specific commands to specific users and logs every use to `/var/log/auth.log` — far better than shared root logins. Review your own box: `sudo -l` lists what you may run. In your lab, create a restricted user and verify each boundary. Understanding privilege boundaries is 80% of both offensive theory and defensive design.",
        keyPoints: [
          "Every file has owner/group/other permission triples.",
          "chmod octal: 7=rwx, 6=rw-, 5=r-x; SUID runs programs as the file owner.",
          "sudo -l shows your allowed commands; sudo usage is logged.",
          "Least privilege is the guiding principle of hardening.",
        ],
        quiz: [
          {
            question: "What does the permission string rwxr-x--- mean for 'others'?",
            options: ["Full access", "Read and execute", "No access", "Write only"],
            answer: 2,
          },
          {
            question: "Which command shows the sudo commands you are allowed to run?",
            options: ["sudo -l", "chmod 400", "ps aux", "id -u"],
            answer: 0,
          },
        ],
      },
      {
        id: "lh-3-networking-processes",
        title: "Networking & Processes",
        minutes: 7,
        summary:
          "See live connections, listening services and running processes — the defender's continuous X-ray.",
        content:
          "## Watching the network\nLinux exposes its network state through simple tools. `ip a` shows interfaces and addresses; `ss -tulpn` lists every listening socket with its owning process — the first command any host audit should run. `ping host` tests reachability, `traceroute host` maps the path. For a live view, `tcpdump -i any -nn port 443` prints packet headers; on machines you own only, Wireshark gives the same data a graphical face.\n\n## Watching the processes\n`ps aux` snapshots every process; `top` or `htop` streams usage live. Malware triage starts here: an unknown process burning CPU or phoning home deserves identification — check its binary path in `/proc/<pid>/exe` and its command line in `/proc/<pid>/cmdline`. `systemctl list-units --type=service` shows what the system starts at boot; persistence mechanisms hide among them.\n\n## A daily drill\nRun this audit trio on your own machine and read every line: `ss -tulpn`, `ps aux`, and `journalctl -p warning -b` (current-boot warnings). Knowing your machine's normal state is what makes anomalies visible — that baseline habit is the essence of defensive operations.",
        keyPoints: [
          "ss -tulpn maps listening ports to owning processes.",
          "ps aux / htop reveal CPU, memory and suspicious processes.",
          "systemctl list-units exposes boot-time persistence points.",
          "Knowing your baseline makes anomalies detectable.",
        ],
        quiz: [
          {
            question: "Which command lists listening sockets with process names?",
            options: ["ss -tulpn", "ls -la", "chmod +x", "df -h"],
            answer: 0,
          },
          {
            question: "Where can you inspect a running process's executable path?",
            options: ["/proc/<pid>/exe", "/home/user", "/etc/hostname", "/boot"],
            answer: 0,
          },
        ],
      },
      {
        id: "lh-4-packages-hardening",
        title: "Package Managers & Hardening",
        minutes: 6,
        summary:
          "Install software the verifiable way, then lock the system down with a practical checklist.",
        content:
          "## Trust chains for software\nPackage managers like `apt` (Debian/Ubuntu) and `dnf` (Fedora) install from signed repositories: every package is cryptographically verified, dependencies are resolved, and updates are one command away. This trust chain is why `sudo apt update && sudo apt upgrade` is the single most valuable security command on a Linux box. Random `curl | sudo bash` scripts bypass all of it — read any install script before piping it to root.\n\n## Reducing the attack surface\nHardening is subtraction. Remove packages you do not use (`apt remove`), disable services you do not run (`systemctl disable --now <svc>`), close ports (a default-deny firewall like `ufw default deny incoming && ufw enable`). Fewer running components mean fewer CVEs that can touch you and fewer logs to watch.\n\n## The baseline checklist\nA solid starting point for any distro: automatic security updates enabled, SSH key-auth only with password login disabled, unattended-upgrades running, auditd installed on servers, and `debsums`/`rpm -Va` to verify package integrity occasionally. Run through the checklist on your lab VM, then re-run `ss -tulpn` and admire the shorter list. Hardening is measurable.",
        keyPoints: [
          "Signed repositories + apt/dnf updates are the core trust mechanism.",
          "Read scripts before curl | sudo bash — or avoid the pattern.",
          "Hardening is subtraction: fewer packages, services, open ports.",
          "Key-only SSH with disabled password login is non-negotiable for servers.",
        ],
        quiz: [
          {
            question: "Why prefer distro repositories over random install scripts?",
            options: [
              "Packages are cryptographically signed and dependency-managed",
              "They install faster",
              "They use less disk space",
              "They work offline",
            ],
            answer: 0,
          },
          {
            question: "Which command enables a default-deny incoming firewall on Ubuntu?",
            options: [
              "ufw default deny incoming && ufw enable",
              "chmod 777 /",
              "ping 1.1.1.1",
              "apt install colors",
            ],
            answer: 0,
          },
        ],
      },
      {
        id: "lh-5-security-tools",
        title: "Essential Security Tools",
        minutes: 8,
        summary:
          "Meet the core tools of the trade — nmap, Wireshark, John and friends — and the rules that govern their use.",
        content:
          "## The defender's toolbox\nA handful of tools cover most learning: `nmap` for network discovery and service enumeration, Wireshark for protocol analysis, `John the Ripper` and `hashcat` for password auditing (testing your own captured hashes), `rkhunter` for a quick rootkit check, and `Lynis` for a one-shot hardening audit: `sudo lynis audit system` prints scored findings with suggestions — a fantastic learning loop.\n\n## Kali and friends\nKali Linux bundles hundreds of these tools preconfigured; Parrot OS is a lighter alternative. But resist tool-collecting: interviews and real work reward understanding what a tool does, not how many you have installed. One VM with twenty mastered tools beats one with four hundred skimmed.\n\n## The rules that govern use\nEvery professional tool assumes authorization. Nmap against your own subnet: legal. Against your employer's network without a mandate: a firing offense and often a crime. Password crackers exist to audit your own systems' password strength. In your lab, keep a \"target sheet\" — a written list of what you may attack (your VMs, your Wi-Fi AP, your apps) — and update it before each session. Ethics is not a module you complete; it is a habit you rehearse.",
        keyPoints: [
          "Core tools: nmap, Wireshark, John/hashcat, Lynis, rkhunter.",
          "Lynis audit system gives scored, actionable hardening advice.",
          "Kali/Parrot are convenience; understanding beats tool count.",
          "Keep a written authorization sheet for every lab target.",
        ],
        quiz: [
          {
            question: "Which tool performs service version detection across a network?",
            options: ["nmap", "nano", "gzip", "tar"],
            answer: 0,
          },
          {
            question: "What does 'sudo lynis audit system' do?",
            options: [
              "Scans the internet for targets",
              "Runs a local hardening audit with scored suggestions",
              "Installs new packages",
              "Changes your password",
            ],
            answer: 1,
          },
        ],
      },
      {
        id: "lh-6-home-lab",
        title: "Build Your Home Lab",
        minutes: 8,
        summary:
          "Design a safe, isolated playground — VMs, networks and intentionally vulnerable targets — for fully legal practice.",
        content:
          "## Why a lab, and what kind\nA home lab converts theory into muscle memory while keeping you inside the law: everything you attack, you own. The minimal setup is a host with VirtualBox or VMware, a snapshot-friendly Kali VM (attacker) and a deliberately vulnerable target — Metasploitable 3, OWASP Juice Shop (Docker), or DVWA. Add a Windows trial VM to explore Windows logging and hardening.\n\n## Network isolation matters\nConfigure the VM network as host-only or NAT, never bridged to your home LAN while you run aggressive scans — you want your experiments incapable of leaking to real devices. VirtualBox calls this \"Host-only adapter\". Verify with `ip a` inside the guest: the lab range (commonly `192.168.56.0/24` in VirtualBox) should stay isolated. A spare lab router or VLAN adds another boundary.\n\n## A practice curriculum\nStart each session with a plan: day one, enumerate (`nmap -sV`); day two, exploit a known CVE on the target VM and then patch it; day three, write the report. Platforms like VulnHub ship vulnerable VMs you can legally download and attack; TryHackMe and Hack The Box provide hosted labs with explicit authorization. Document every session — your notes become your portfolio, and the habit of reporting is what separates professionals from script kiddies.",
        keyPoints: [
          "Attack only what you own: VMs and vulnerable images you downloaded.",
          "Host-only/NAT networking keeps experiments off your real LAN.",
          "VulnHub, TryHackMe and Hack The Box offer legal, scoped targets.",
          "Write a report every session — notes compound into a portfolio.",
        ],
        quiz: [
          {
            question: "Which VM network mode keeps lab traffic off your home LAN?",
            options: ["Bridged", "Host-only adapter", "4G tethering", "Bluetooth PAN"],
            answer: 1,
          },
          {
            question: "Why write a report after each lab session?",
            options: [
              "It is legally required for VMs",
              "Documentation builds skills and a verifiable portfolio",
              "It speeds up the VM",
              "Reports replace snapshots",
            ],
            answer: 1,
          },
        ],
      },
    ],
  },
];

/** Total lesson count across all paths (handy for stats) */
export const TOTAL_LESSONS = LEARNING_PATHS.reduce((n, p) => n + p.lessons.length, 0);
