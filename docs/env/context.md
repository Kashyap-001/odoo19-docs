---
title: Odoo 19 Context and with_context()
description: Master the Odoo Context dictionary. Learn how to pass data between methods, use with_context(), and leverage environment helpers.
---

# Odoo 19 Context and with_context()

The **Context** is a python dictionary containing shared data such as the user's timezone, language, and custom flags. 

### 💡 Analogy: The Developer's Backpack
Think of the Context as a **Backpack** that Odoo carries through every function, from the UI down to the database.

*   **Standard Tools**: Inside the backpack are tools everyone needs: the current user's language (`lang`), their timezone (`tz`), and their active company.
*   **Custom Flags**: You can slip a **Note** into the backpack (e.g., `{'skip_validation': True}`) at the start of a function. Every subsequent function that Odoo calls can "open the backpack" and see your note to change its behavior.
*   **with_context()**: This is like **swapping backpacks** for a specific mission. You give Odoo a new backpack with different tools, but once the mission is over, Odoo goes back to using the original one.

---

## 🏗️ Master Project Challenge: The Context
1.  **Task**: Add a flag `is_automated_process` to the context when creating an `auction.listing` from a scheduled action.
2.  **Goal**: In your `create()` method, check this flag and skip the "Congratulations Email" if the flag is `True`.

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. Is the Odoo Context mutable (can it be changed directly)?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="No, the Odoo context is immutable. You must use with_context() to create a new recordset with an updated context." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 🏁 Senior Checkpoint
*   **Key Concept:** The Context is a dictionary passed through the Environment to share metadata (lang, tz) and custom flags.
*   **Architect Insight:** Context is **immutable**; `with_context()` returns a new recordset. Always capture the result!
