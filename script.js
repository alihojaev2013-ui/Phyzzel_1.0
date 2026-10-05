// ---------- helpers ----------
function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

let unlocked = load("phyzzle_unlocked", 1); // highest unlocked level
let xp = load("phyzzle_xp", 120);

// ---------- show XP in the top bar (all pages) ----------
const xpEl = document.querySelectorAll(".stat span")[1];
if (xpEl) xpEl.textContent = xp + " XP";

// ---------- HOME PAGE: update the level path ----------
document.querySelectorAll(".level-row").forEach(function (row, i) {
  const n = i + 1;
  const circle = row.querySelector(".level-circle");
  const badge = row.querySelector(".badge");

  if (n < unlocked) {
    circle.classList.remove("locked", "current");
    circle.textContent = "✓";
    badge.textContent = "Completed";
    badge.className = "badge open";
  } else if (n === unlocked) {
    circle.classList.remove("locked");
    circle.classList.add("current");
    circle.textContent = n;
    badge.textContent = "In progress";
    badge.className = "badge open";
  }

  // levels that don't have a lesson page yet
  if (n <= unlocked && circle.tagName !== "A") {
    circle.addEventListener("click", function () {
      alert("Level " + n + " is coming soon!");
    });
  }
});

// ---------- LESSON PAGE: "Complete Day" button goes to the test ----------
const lessonBtn = document.querySelector(".lesson-wrap .big-btn");
if (lessonBtn) {
  lessonBtn.addEventListener("click", function () {
    window.location.href = "test.html";
  });
}

// ---------- TEST PAGE: grade the test ----------
const submitBtn = document.querySelector(".test-wrap .big-btn");
if (submitBtn) {
  // correct answers
  const partA = { q1: 1, q2: 2, q3: 0, q4: 2, q5: 1 };   // option position (0 = A, 1 = B, 2 = C)
  const partB = [3000, 7, 2500, 15, 4200];                // typed answers
  const partC = [1, 1, 2, 1, 1];                          // selected option (0 is "Choose...")

  const resultBox = document.createElement("div");
  resultBox.style.cssText =
    "margin-top:18px;padding:16px;border-radius:20px;text-align:center;font-weight:700;display:none;";
  submitBtn.insertAdjacentElement("afterend", resultBox);

  submitBtn.addEventListener("click", function () {
    let score = 0;

    // Part A: radio buttons
    for (const name in partA) {
      const radios = document.querySelectorAll('input[name="' + name + '"]');
      radios.forEach(function (r, i) {
        if (r.checked && i === partA[name]) score++;
      });
    }

    // Part B: typed numbers
    const inputs = document.querySelectorAll("input.answer-input");
    inputs.forEach(function (input, i) {
      const value = parseFloat(input.value.replace(",", "."));
      if (value === partB[i]) score++;
    });

    // Part C: dropdowns
    const selects = document.querySelectorAll("select.answer-input");
    selects.forEach(function (sel, i) {
      if (sel.selectedIndex === partC[i]) score++;
    });

    const passed = score >= 12;
    resultBox.style.display = "block";

    if (passed) {
      resultBox.style.background = "#eefbf1";
      resultBox.style.color = "#1b7a3a";
      resultBox.innerHTML = "🎉 You scored " + score + "/15. Level 2 is unlocked! " +
        '<br><a href="index.html" style="text-decoration:underline;">Back to your journey</a>';

      if (unlocked < 2) {
        unlocked = 2;
        xp += 50;
        save("phyzzle_unlocked", unlocked);
        save("phyzzle_xp", xp);
        if (xpEl) xpEl.textContent = xp + " XP";
      }
    } else {
      resultBox.style.background = "#fff0f0";
      resultBox.style.color = "#b3261e";
      resultBox.textContent = "You scored " + score + "/15. You need 12 to pass. Review the lesson and try again!";
    }
    resultBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}