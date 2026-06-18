# Odoo 19 Setup

Learn how to set up your environment for Odoo 19 development.

## System Requirements

To run Odoo 19 smoothly, ensure your system meets these requirements:

*   **Python:** 3.12 or higher.
*   **PostgreSQL:** 13.0 or higher.
*   **OS:** Ubuntu 22.04+ (Recommended), Windows 10+, or macOS.

!!! info "Pro Tip"
    Always use a virtual environment to manage your Python dependencies and avoid conflicts with system packages.

---

## Installing PostgreSQL

Odoo uses PostgreSQL as its database management system.

### Linux (Ubuntu)
Run the following commands:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### Windows
1. Download the installer from the [Official PostgreSQL website](https://www.postgresql.org/download/windows/).
2. Run the `.exe` and follow the wizard.
3. Use **pgAdmin 4** (included) to manage your databases visually.

---

## Installing Python 3.12

Odoo 19 is optimized for **Python 3.12**.

### Linux
```bash
sudo apt install python3.12 python3.12-venv python3.12-dev
```

### Windows
Download and install Python 3.12 from [python.org](https://www.python.org/). **Make sure to check "Add Python to PATH" during installation.**

---

## Setting Up Odoo 19

### 1. Clone the Source Code
Get the latest Odoo 19 source code from GitHub:
```bash
git clone https://www.github.com/odoo/odoo --depth 1 --branch 19.0 /opt/odoo
```

### 2. Create a Virtual Environment
```bash
python3.12 -m venv odoo-venv
source odoo-venv/bin/activate
```

### 3. Install Dependencies
Navigate to the Odoo directory and install required packages:
```bash
pip install -r requirements.txt
```

---

## 💻 Code Challenge

**Fill in the missing parts to create and activate a virtual environment for Odoo 19:**

<div class="code-challenge">
<pre><code>python3.12 -m <input type="text" class="quiz-input-inline" data-answer="venv" style="width: 50px"> odoo-venv
<input type="text" class="quiz-input-inline" data-answer="source" style="width: 60px"> odoo-venv/bin/<input type="text" class="quiz-input-inline" data-answer="activate" style="width: 80px">
</code></pre>
<button class="quiz-check" onclick="checkCodeChallenge(this)">Check Code</button>
<div class="quiz-result"></div>
</div>

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. What is the minimum Python version required for Odoo 19?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="Python 3.12 or higher." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">2. Which database management system does Odoo use?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="PostgreSQL." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">3. Why is it recommended to use a virtual environment for Odoo development?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="To manage Python dependencies and avoid conflicts with system packages." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">4. What command is used to start the Odoo server from the source?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="./odoo-bin --addons-path=addons -d my_database" onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Odoo 19 requires Python 3.12+ and PostgreSQL 16+ for optimal performance.
*   **Architect Insight:** Always use virtual environments (`venv`) to isolate your Odoo installation from the system Python to avoid dependency hell.
*   **Verify Your Knowledge:** Why do we install `libpq-dev`? (Answer: It is a requirement for the `psycopg2` library to communicate with PostgreSQL).

!!! success "Next Step"
Environment is ready. Let's look at the [Addon Anatomy](structure.md).
!!! warning "Dependencies"
    On Linux, you may need to install system dependencies like `libxml2-dev`, `libxslt1-dev`, and `libsasl2-dev` before running `pip install`.

---

## Starting Odoo

Once everything is installed, start the server with:
```bash
./odoo-bin --addons-path=addons -d my_database
```
Open your browser and go to `http://localhost:8069`.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
