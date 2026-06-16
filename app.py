from flask import Flask, request, redirect, session, url_for, g, render_template_string
import sqlite3
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

ADMIN_CODE = "swordmastersdevs"
DATABASE = "sword_masters.db"

app = Flask(__name__)
app.secret_key = "change-this-secret-key-before-hosting"

CSS = """
:root{
  --bg:#000000; --bg2:#0b0b0b; --card:#111111dd; --card2:#181818dd;
  --text:#ffffff; --muted:#b8b8b8; --line:rgba(255,255,255,.16);
  --white:#ffffff; --gray:#d9d9d9; --danger:#ffffff;
}
*{box-sizing:border-box}
body{margin:0;font-family:Inter,Arial,sans-serif;background:#000;color:white;overflow-x:hidden}
body:before{content:"";position:fixed;inset:0;z-index:-3;background:radial-gradient(circle at 12% 0%,rgba(255,255,255,.18),transparent 30%),radial-gradient(circle at 90% 10%,rgba(255,255,255,.10),transparent 28%),linear-gradient(135deg,#000,#0b0b0b 55%,#000)}
body:after{content:"";position:fixed;inset:0;z-index:-2;opacity:.12;background-image:linear-gradient(rgba(255,255,255,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.08) 1px,transparent 1px);background-size:54px 54px;animation:grid 20s linear infinite}
a{color:inherit;text-decoration:none}.wrap{max-width:1180px;margin:auto;padding:0 22px}
nav{position:sticky;top:0;z-index:10;background:rgba(0,0,0,.82);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}
.bar{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0}
.brand{display:flex;align-items:center;gap:12px;font-weight:950}
.logo{width:42px;height:42px;border-radius:10px;background:white;color:#000;display:grid;place-items:center;font-weight:950;transform:rotate(-10deg);box-shadow:0 0 30px rgba(255,255,255,.25)}
.logo span{display:block;width:14px;height:14px;background:#000;border-radius:3px}
.links{display:flex;align-items:center;gap:16px;color:var(--muted);font-size:14px}.links a:hover{color:white}
.btn,button{border:0;border-radius:12px;padding:12px 17px;font-weight:900;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:.22s}
.btn:hover,button:hover{transform:translateY(-2px)}
.primary{background:white;color:black;box-shadow:0 12px 34px rgba(255,255,255,.16)}
.secondary{background:rgba(255,255,255,.08);color:white;border:1px solid var(--line)}
.danger{background:white;color:black}
.card{background:linear-gradient(145deg,rgba(30,30,30,.92),rgba(10,10,10,.88));border:1px solid var(--line);border-radius:22px;box-shadow:0 24px 80px rgba(0,0,0,.5);backdrop-filter:blur(18px);position:relative;overflow:hidden}
.card:before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.09),transparent 35%);pointer-events:none}
.hero{display:grid;grid-template-columns:1.05fr .95fr;gap:32px;align-items:center;min-height:78vh;padding:70px 0 50px}
.eyebrow{display:inline-flex;gap:8px;align-items:center;padding:9px 13px;border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.07);font-size:12px;font-weight:950;letter-spacing:.06em;text-transform:uppercase}
.dot{width:9px;height:9px;border-radius:50%;background:white;box-shadow:0 0 18px white;animation:blink 1.5s infinite}
h1{font-size:72px;line-height:.96;margin:22px 0 14px;letter-spacing:-4px}.grad{background:linear-gradient(90deg,#fff,#bdbdbd,#fff);background-size:220%;-webkit-background-clip:text;color:transparent;animation:shine 5s linear infinite}
h2{font-size:35px;margin:0 0 8px;letter-spacing:-1px}h3{margin:0 0 8px}p{color:var(--muted);line-height:1.7}.small{font-size:14px;color:var(--muted)}
.actions,.chatinput{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.hero-card{padding:0;animation:float 5s ease-in-out infinite}
.game-thumb{height:260px;background:linear-gradient(135deg,#fff,#171717 55%,#ffffff22);display:grid;place-items:center;position:relative;overflow:hidden}
.roblox-cube{width:110px;height:110px;background:white;border-radius:18px;transform:rotate(-12deg);display:grid;place-items:center;box-shadow:0 25px 80px rgba(0,0,0,.55)}
.roblox-cube:after{content:"";width:32px;height:32px;background:#000;border-radius:7px}
.game-info{padding:24px}.rating{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.chip{border:1px solid var(--line);background:rgba(255,255,255,.08);border-radius:999px;padding:8px 12px;color:#eee;font-size:13px;font-weight:800}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:22px}.stat{padding:17px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.06)}.stat b{display:block;font-size:26px}
section{padding:45px 0}.section-head{text-align:center;max-width:720px;margin:auto}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:28px}.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:28px}
.mini{padding:24px;transition:.25s}.mini:hover{transform:translateY(-7px);border-color:rgba(255,255,255,.45)}
.badge{display:inline-flex;border:1px solid var(--line);background:rgba(255,255,255,.08);border-radius:999px;padding:8px 12px;font-size:12px;font-weight:950;margin-bottom:12px;color:white}.code{font-family:monospace;color:white;text-transform:uppercase}
.form{max-width:520px;margin:70px auto;padding:30px}.form-title{text-transform:uppercase;font-size:13px;letter-spacing:.12em;font-weight:950;color:white}
input,textarea,select{width:100%;background:rgba(255,255,255,.08);border:1px solid var(--line);border-radius:14px;color:white;padding:14px;font:inherit;outline:none;margin-top:12px}textarea{min-height:110px;resize:vertical}select option{background:#111;color:white}
input:focus,textarea:focus,select:focus{border-color:white;box-shadow:0 0 0 4px rgba(255,255,255,.13)}.error{color:white;font-weight:900}
.layout3{display:grid;grid-template-columns:220px 1fr 270px;gap:16px;padding:35px 0}.panel{padding:20px;min-height:70vh}.channel,.useritem{display:block;border:1px solid var(--line);background:rgba(255,255,255,.06);border-radius:14px;padding:13px;margin-top:10px}.active-channel{background:white!important;color:black!important}
.message{display:flex;gap:12px;padding:14px;border-radius:16px;margin:8px 0;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1);animation:rise .35s ease both}.avatar{width:42px;height:42px;border-radius:12px;background:white;color:black;display:grid;place-items:center;font-weight:950;flex:0 0 auto}.msgbody b{display:block}.msgbody span{font-size:13px;color:#aaa}.chatinput input{margin:0}
.useritem{display:flex;justify-content:space-between;gap:12px;align-items:center}.profile-grid,.admin-grid{display:grid;grid-template-columns:330px 1fr;gap:18px}.admin-grid{grid-template-columns:1fr 1fr}.side{padding:24px}.bigavatar{width:112px;height:112px;border-radius:18px;background:white;color:black;display:grid;place-items:center;font-size:44px;font-weight:950;box-shadow:0 18px 50px rgba(255,255,255,.12)}
.faq details{padding:22px;margin-top:14px}.faq summary{font-weight:950;cursor:pointer}.footer{border-top:1px solid var(--line);padding:34px 0;color:var(--muted);display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap}
.fade{animation:rise .7s ease both}
@keyframes rise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.35}}@keyframes shine{to{background-position:220% center}}@keyframes grid{to{background-position:54px 54px}}
@media(max-width:900px){.hero,.layout3,.profile-grid,.admin-grid,.grid3{grid-template-columns:1fr}.grid4,.stats{grid-template-columns:1fr 1fr}.links{flex-wrap:wrap}h1{font-size:48px;letter-spacing:-2px}.panel{min-height:auto}}
@media(max-width:560px){.grid4,.stats{grid-template-columns:1fr}.links{display:none}.chatinput{flex-direction:column}}
"""

LAYOUT = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Sword Masters</title>
  <style>{{ css }}</style>
</head>
<body>
<nav>
  <div class="wrap bar">
    <a class="brand" href="{{ url_for('home') }}"><span class="logo"><span></span></span><span>Sword Masters</span></a>
    <div class="links">
      <a href="{{ url_for('home') }}#about">About</a>
      <a href="{{ url_for('home') }}#features">Features</a>
      <a href="{{ url_for('home') }}#codes">Codes</a>
      <a href="{{ url_for('home') }}#faq">FAQ</a>
      <a href="{{ url_for('chat') }}">Community</a>
      <a href="{{ url_for('admin') }}">Admin</a>
      {% if current_user %}
        <a class="btn secondary" href="{{ url_for('logout') }}">Logout</a>
      {% else %}
        <a class="btn primary" href="{{ url_for('login') }}">Log In</a>
      {% endif %}
    </div>
  </div>
</nav>
<main class="wrap">{{ content|safe }}</main>
<div class="wrap"><div class="footer"><span><b>Sword Masters</b> © 2026.</span><span>Black & white Roblox-style game hub</span></div></div>
</body>
</html>
"""

def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(error):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def now():
    return datetime.now().strftime("%Y-%m-%d %H:%M")

def init_db():
    db = get_db()
    db.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
        bio TEXT DEFAULT 'Ready to master the blade.', favorite_sword TEXT DEFAULT 'Starter Blade',
        role TEXT DEFAULT 'Player', status TEXT DEFAULT 'Online', created_at TEXT NOT NULL
    )""")
    db.execute("""CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL
    )""")
    db.execute("""CREATE TABLE IF NOT EXISTS announcements (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL
    )""")
    db.execute("""CREATE TABLE IF NOT EXISTS codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL, reward TEXT NOT NULL, active INTEGER DEFAULT 1
    )""")
    if db.execute("SELECT COUNT(*) FROM codes").fetchone()[0] == 0:
        db.execute("INSERT INTO codes (code, reward, active) VALUES (?, ?, 1)", ("COMING SOON", "Codes will be added when Sword Masters launches."))
    if db.execute("SELECT COUNT(*) FROM announcements").fetchone()[0] == 0:
        db.execute("INSERT INTO announcements (title, body, created_at) VALUES (?, ?, ?)", ("Sword Masters is Coming Soon", "The black-and-white Sword Masters website is live.", now()))
    db.commit()

@app.before_request
def before_request():
    init_db()

def current_user():
    if "user_id" not in session:
        return None
    return get_db().execute("SELECT * FROM users WHERE id = ?", (session["user_id"],)).fetchone()

def page(content, **context):
    return render_template_string(LAYOUT, css=CSS, content=render_template_string(content, **context), current_user=current_user())

@app.route("/")
def home():
    db = get_db()
    codes = db.execute("SELECT * FROM codes WHERE active = 1 ORDER BY id DESC").fetchall()
    news = db.execute("SELECT * FROM announcements ORDER BY id DESC LIMIT 4").fetchall()
    members = db.execute("SELECT COUNT(*) FROM users").fetchone()[0]
    messages = db.execute("SELECT COUNT(*) FROM messages").fetchone()[0]
    return page("""
<section class="hero">
  <div class="fade">
    <span class="eyebrow"><span class="dot"></span> Roblox experience coming soon</span>
    <h1><span class="grad">Sword Masters</span><br>Roblox Battle Hub</h1>
    <p>Train your power, unlock stronger swords, battle through arenas, earn rewards, and become a true Sword Master.</p>
    <div class="actions">
      <a class="btn primary" target="_blank" href="https://www.roblox.com">Play on Roblox</a>
      <a class="btn secondary" href="{{ url_for('signup') }}">Create Profile</a>
      <a class="btn secondary" href="{{ url_for('chat') }}">Community Chat</a>
    </div>
    <div class="stats">
      <div class="stat"><b>{{ members }}</b><span class="small">Players joined</span></div>
      <div class="stat"><b>{{ messages }}</b><span class="small">Community posts</span></div>
      <div class="stat"><b>Soon</b><span class="small">Launch status</span></div>
    </div>
  </div>
  <div class="card hero-card fade">
    <div class="game-thumb"><div class="roblox-cube"></div></div>
    <div class="game-info">
      <h2>Sword Masters</h2>
      <p>Black-and-white Roblox sword-fighting simulator hub with upgrades, rare swords, arenas, codes, and player progression.</p>
      <div class="rating"><span class="chip">All Ages</span><span class="chip">Fighting</span><span class="chip">Simulator</span><span class="chip">Coming Soon</span></div>
    </div>
  </div>
</section>

<section id="about">
  <div class="section-head"><h2>About the Experience</h2><p>A clean Roblox-style hub for players to learn about the game, check updates, redeem codes, and connect.</p></div>
  <div class="grid3">
    <div class="card mini"><span class="badge">Train</span><h3>Gain Power</h3><p>Train and improve your sword power.</p></div>
    <div class="card mini"><span class="badge">Fight</span><h3>Arena Battles</h3><p>Enter arenas and prove your skills.</p></div>
    <div class="card mini"><span class="badge">Collect</span><h3>Rare Swords</h3><p>Unlock stronger and rarer blades.</p></div>
  </div>
</section>

<section id="features">
  <div class="section-head"><h2>Game Features</h2><p>Everything a Roblox player needs to know.</p></div>
  <div class="grid4">
    <div class="card mini"><h3>⚔ Sword Combat</h3><p>Fast clicking and arena fighting.</p></div>
    <div class="card mini"><h3>⭐ Progression</h3><p>Level up and unlock better swords.</p></div>
    <div class="card mini"><h3>🎁 Codes</h3><p>Redeem rewards when codes release.</p></div>
    <div class="card mini"><h3>👤 Profiles</h3><p>Create your player profile.</p></div>
  </div>
</section>

<section id="codes">
  <div class="section-head"><h2>Active Codes</h2><p>Codes are managed from the admin panel.</p></div>
  <div class="grid3">
    {% for c in codes %}<div class="card mini"><span class="badge">Code</span><h3 class="code">{{ c.code }}</h3><p>{{ c.reward }}</p></div>{% endfor %}
  </div>
</section>

<section>
  <div class="section-head"><h2>Updates</h2><p>Latest Sword Masters news.</p></div>
  <div class="grid3">
    {% for n in news %}<div class="card mini"><span class="badge">Update</span><h3>{{ n.title }}</h3><p>{{ n.body }}</p><p class="small">{{ n.created_at }}</p></div>{% endfor %}
  </div>
</section>

<section id="faq" class="faq">
  <div class="section-head"><h2>FAQ</h2><p>Quick answers for players.</p></div>
  <details class="card"><summary>Is Sword Masters released yet?</summary><p>No. Sword Masters is coming soon.</p></details>
  <details class="card"><summary>Where can I play?</summary><p>Add your Roblox experience link to the Play on Roblox button.</p></details>
  <details class="card"><summary>Are there codes?</summary><p>Codes are coming soon and can be added from the admin panel.</p></details>
</section>
""", codes=codes, news=news, members=members, messages=messages)

@app.route("/signup", methods=["GET", "POST"])
def signup():
    error = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()
        if not username or not password:
            error = "Enter a username and password."
        elif len(username) < 3:
            error = "Username must be at least 3 characters."
        elif len(password) < 4:
            error = "Password must be at least 4 characters."
        else:
            try:
                cur = get_db().execute("INSERT INTO users (username,password_hash,created_at) VALUES (?,?,?)", (username, generate_password_hash(password), now()))
                get_db().commit()
                session["user_id"] = cur.lastrowid
                return redirect(url_for("profile"))
            except sqlite3.IntegrityError:
                error = "That username is already taken."
    return auth_page("Create Account", error)

@app.route("/login", methods=["GET", "POST"])
def login():
    error = None
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()
        user = get_db().execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        if user and check_password_hash(user["password_hash"], password):
            session["user_id"] = user["id"]
            return redirect(url_for("profile"))
        error = "Wrong username or password."
    return auth_page("Log In", error)

def auth_page(mode, error=None):
    return page("""
<div class="card form fade">
  <p class="form-title">{{ mode }}</p>
  <h2>Welcome to Sword Masters</h2>
  <p>Create an account or log in to use profiles and community chat.</p>
  {% if error %}<p class="error">{{ error }}</p>{% endif %}
  <form method="post">
    <input name="username" placeholder="Roblox username">
    <input name="password" type="password" placeholder="Password">
    <button class="primary" style="margin-top:14px;width:100%">{{ mode }}</button>
  </form>
  {% if mode == "Log In" %}<p>Need an account? <a href="{{ url_for('signup') }}">Create one</a></p>{% else %}<p>Already have an account? <a href="{{ url_for('login') }}">Log in</a></p>{% endif %}
</div>
""", mode=mode, error=error)

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

@app.route("/profile", methods=["GET", "POST"])
def profile():
    user = current_user()
    if not user:
        return redirect(url_for("login"))
    if request.method == "POST":
        get_db().execute("UPDATE users SET bio=?, favorite_sword=?, status=? WHERE id=?", (
            request.form.get("bio", "").strip() or "Ready to master the blade.",
            request.form.get("favorite_sword", "").strip() or "Starter Blade",
            request.form.get("status", "Online"),
            user["id"]
        ))
        get_db().commit()
        return redirect(url_for("profile"))
    user = current_user()
    return page("""
<section class="fade">
  <h2>Roblox Player Profile</h2><p>Edit your Sword Masters profile.</p>
  <div class="profile-grid">
    <div class="card side">
      <div class="bigavatar">{{ user.username[0].upper() }}</div>
      <h2>{{ user.username }}</h2>
      <p><span class="badge">{{ user.role }}</span> <span class="badge">{{ user.status }}</span></p>
      <p>{{ user.bio }}</p>
      <p><b>Favorite Sword:</b> {{ user.favorite_sword }}</p>
    </div>
    <div class="card side">
      <h2>Edit Profile</h2>
      <form method="post">
        <input name="favorite_sword" value="{{ user.favorite_sword }}" placeholder="Favorite sword">
        <select name="status"><option>Online</option><option>Idle</option><option>Offline</option></select>
        <textarea name="bio">{{ user.bio }}</textarea>
        <button class="primary" style="margin-top:14px">Save Profile</button>
      </form>
    </div>
  </div>
</section>
""", user=user)

@app.route("/chat", methods=["GET", "POST"])
def chat():
    user = current_user()
    if not user:
        return redirect(url_for("login"))
    db = get_db()
    if request.method == "POST":
        msg = request.form.get("message", "").strip()
        if msg:
            db.execute("INSERT INTO messages (user_id,message,created_at) VALUES (?,?,?)", (user["id"], msg[:500], datetime.now().strftime("%H:%M")))
            db.commit()
        return redirect(url_for("chat"))
    messages = db.execute("""SELECT messages.*, users.username, users.role, users.status FROM messages JOIN users ON messages.user_id=users.id ORDER BY messages.id DESC LIMIT 90""").fetchall()[::-1]
    members = db.execute("SELECT username,role,favorite_sword,status FROM users ORDER BY username").fetchall()
    return page("""
<div class="layout3 fade">
  <div class="card panel"><h2>Community</h2><div class="channel active-channel"># general</div><div class="channel"># updates</div><div class="channel"># sword-talk</div></div>
  <div class="card panel">
    <h2># general</h2><p>Talk about Sword Masters with other players.</p>
    {% for m in messages %}
      <div class="message"><div class="avatar">{{ m.username[0].upper() }}</div><div class="msgbody"><b>{{ m.username }} <span>{{ m.role }} · {{ m.status }}</span></b><span>{{ m.created_at }}</span><p>{{ m.message }}</p></div></div>
    {% endfor %}
    <form method="post" class="chatinput"><input name="message" placeholder="Message #general" maxlength="500"><button class="primary">Send</button></form>
  </div>
  <div class="card panel"><h2>Players</h2>{% for m in members %}<div class="useritem"><span><b>{{ m.username }}</b><br><span class="small">{{ m.role }} · {{ m.favorite_sword }} · {{ m.status }}</span></span></div>{% endfor %}</div>
</div>
""", messages=messages, members=members)

@app.route("/admin", methods=["GET", "POST"])
def admin():
    error = None
    db = get_db()
    if request.method == "POST" and "admin_code" in request.form:
        if request.form.get("admin_code") == ADMIN_CODE:
            session["admin"] = True
        else:
            error = "Wrong admin code."
    if not session.get("admin"):
        return page("""
<div class="card form fade">
  <p class="form-title">Admin Panel</p><h2>Enter Admin Code</h2><p>Use your developer code to manage the site.</p>
  {% if error %}<p class="error">{{ error }}</p>{% endif %}
  <form method="post"><input name="admin_code" type="password" placeholder="Admin code"><button class="primary" style="margin-top:14px;width:100%">Unlock Admin</button></form>
</div>
""", error=error)
    users = db.execute("SELECT * FROM users ORDER BY id DESC").fetchall()
    messages = db.execute("SELECT messages.*,users.username FROM messages JOIN users ON messages.user_id=users.id ORDER BY messages.id DESC LIMIT 25").fetchall()
    return page("""
<section class="fade">
  <h2>Admin Panel</h2><p>Manage content, players, codes, updates, and chat.</p>
  <div class="admin-grid">
    <div class="card side"><h2>Add Update</h2><form method="post" action="{{ url_for('admin_add_announcement') }}"><input name="title" placeholder="Update title"><textarea name="body" placeholder="Update text"></textarea><button class="primary" style="margin-top:14px">Post Update</button></form></div>
    <div class="card side"><h2>Add Code</h2><form method="post" action="{{ url_for('admin_add_code') }}"><input name="code" placeholder="Code"><input name="reward" placeholder="Reward"><button class="primary" style="margin-top:14px">Add Code</button></form></div>
  </div>
  <div class="admin-grid" style="margin-top:18px">
    <div class="card side"><h2>Players</h2>{% for u in users %}<div class="useritem"><span><b>{{ u.username }}</b><br><span class="small">{{ u.role }} · {{ u.favorite_sword }}</span></span><span><form method="post" action="{{ url_for('admin_set_role', user_id=u.id) }}" style="display:inline"><select name="role" style="width:105px;margin:0"><option>Player</option><option>Moderator</option><option>Admin</option><option>Owner</option></select><button class="secondary">Set</button></form><form method="post" action="{{ url_for('admin_delete_user', user_id=u.id) }}" style="display:inline"><button class="danger">Delete</button></form></span></div>{% endfor %}</div>
    <div class="card side"><h2>Chat</h2><form method="post" action="{{ url_for('admin_clear_chat') }}"><button class="danger">Clear Chat</button></form>{% for m in messages %}<div class="message"><div class="avatar">{{ m.username[0].upper() }}</div><div class="msgbody"><b>{{ m.username }}</b><span>{{ m.created_at }}</span><p>{{ m.message }}</p></div></div>{% endfor %}</div>
  </div>
</section>
""", users=users, messages=messages)

@app.route("/admin/add-code", methods=["POST"])
def admin_add_code():
    if session.get("admin"):
        code = request.form.get("code", "").strip()
        reward = request.form.get("reward", "").strip()
        if code and reward:
            get_db().execute("INSERT INTO codes (code,reward,active) VALUES (?,?,1)", (code, reward))
            get_db().commit()
    return redirect(url_for("admin"))

@app.route("/admin/add-announcement", methods=["POST"])
def admin_add_announcement():
    if session.get("admin"):
        title = request.form.get("title", "").strip()
        body = request.form.get("body", "").strip()
        if title and body:
            get_db().execute("INSERT INTO announcements (title,body,created_at) VALUES (?,?,?)", (title, body, now()))
            get_db().commit()
    return redirect(url_for("admin"))

@app.route("/admin/clear-chat", methods=["POST"])
def admin_clear_chat():
    if session.get("admin"):
        get_db().execute("DELETE FROM messages")
        get_db().commit()
    return redirect(url_for("admin"))

@app.route("/admin/delete-user/<int:user_id>", methods=["POST"])
def admin_delete_user(user_id):
    if session.get("admin"):
        db = get_db()
        db.execute("DELETE FROM messages WHERE user_id=?", (user_id,))
        db.execute("DELETE FROM users WHERE id=?", (user_id,))
        db.commit()
    return redirect(url_for("admin"))

@app.route("/admin/set-role/<int:user_id>", methods=["POST"])
def admin_set_role(user_id):
    if session.get("admin"):
        get_db().execute("UPDATE users SET role=? WHERE id=?", (request.form.get("role", "Player"), user_id))
        get_db().commit()
    return redirect(url_for("admin"))

if __name__ == "__main__":
    app.run(debug=True)
