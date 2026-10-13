const form = document.getElementById("form");
const situationEl = document.getElementById("situation");
const intensityEl = document.getElementById("intensity");
const intensityOut = document.getElementById("intensity-out");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("result");

intensityEl.addEventListener("input", () => { intensityOut.textContent = intensityEl.value; });

// Words that suggest the situation may be more serious than a bad day
const safetyWords = ["threat", "threaten", "stalk", "abuse", "hit me", "unsafe", "harass", "blackmail"];

// ---------- Decision logic ----------
function decide(feeling, intensity) {
  if (intensity >= 8 || (feeling === "angry" && intensity >= 6)) {
    return "break";                       // too hot to think clearly
  } else if (feeling === "annoyed" || feeling === "confused" || intensity <= 4) {
    return "calm";                        // low heat, a clear reply will do
  } else {
    return "talk";                        // hurt or anxious at a medium level: leaving it unsaid will fester
  }
}

function buildAdvice(outcome, feeling, intensity) {
  if (outcome === "break") {
    return {
      title: "Take a break",
      why: `At ${intensity} out of 10, feeling ${feeling}, anything you send now is likely to be the first draft of a regret.`,
      steps: [
        "Do not reply yet. Put your phone in another room for 20 minutes.",
        "Move your body: walk, stretch, or splash cold water on your face.",
        "Write the angry version somewhere private, then delete it.",
        "Come back when your number is a 5 or below, and re-read the message once."
      ],
      script: "Nothing to send yet. If you must say something: \u201CI need some time to think. I\u2019ll get back to you later today.\u201D"
    };
  } else if (outcome === "calm") {
    return {
      title: "Respond calmly",
      why: `Your feeling is ${feeling} at ${intensity} out of 10. That is low enough to answer on purpose rather than on impulse.`,
      steps: [
        "Re-read the message once and look for what is actually being asked.",
        "Answer only that. Skip the defense and the counterattack.",
        "Keep it short and neutral, and read it aloud before sending.",
        feeling === "confused" ? "If part of it is unclear, ask one direct question." : "Let the reply stand without adding a second message."
      ],
      script: feeling === "confused"
        ? "\u201CI want to make sure I understand. Can you tell me more about what you mean?\u201D"
        : "\u201CThanks for telling me. Here is what I can do about it.\u201D"
    };
  } else {
    return {
      title: "Talk it out now",
      why: `Feeling ${feeling} at ${intensity} out of 10 is strong, but not so hot that you can't talk. Left unsaid, this tends to grow.`,
      steps: [
        "Choose a call or a face-to-face talk over more texting.",
        "Open with how it landed for you, not what they did wrong.",
        "Ask what they meant, then listen before you answer.",
        "End with one clear next step you both agree on."
      ],
      script: "\u201CCan we talk for a few minutes? What you said stuck with me and I want to understand it.\u201D"
    };
  }
}

// ---------- Rendering ----------
function show(outcome, advice, text) {
  document.body.dataset.outcome = outcome;
  resultEl.hidden = false;
  resultEl.innerHTML = "";

  const h2 = document.createElement("h2");
  h2.textContent = advice.title;

  const echo = document.createElement("p");
  echo.className = "echo";
  echo.textContent = "\u201C" + (text.length > 140 ? text.slice(0, 140) + "\u2026" : text) + "\u201D";

  const why = document.createElement("p");
  why.textContent = advice.why;

  const ol = document.createElement("ol");
  advice.steps.forEach(s => { const li = document.createElement("li"); li.textContent = s; ol.appendChild(li); });

  const script = document.createElement("p");
  script.className = "script";
  script.innerHTML = "<b>If you need words:</b> ";
  script.append(advice.script);

  resultEl.append(h2, echo, why, ol, script);

  // Extra conditional: safety note when the text mentions something serious
  const lower = text.toLowerCase();
  if (safetyWords.some(w => lower.includes(w))) {
    const safe = document.createElement("p");
    safe.className = "safety";
    safe.textContent = "Some of what you wrote sounds like it could involve your safety. That is bigger than a rude message. Consider telling someone you trust, or contacting local support services.";
    resultEl.append(safe);
  }

  const actions = document.createElement("div");
  actions.className = "actions";
  const again = document.createElement("button");
  again.className = "ghost";
  again.textContent = "Start over";
  again.onclick = reset;
  actions.append(again);
  resultEl.append(actions);

  resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

function reset() {
  form.reset();
  intensityOut.textContent = "5";
  resultEl.hidden = true;
  document.body.dataset.outcome = "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
  situationEl.focus();
}

// ---------- Submit ----------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = situationEl.value.trim();
  const picked = form.querySelector('input[name="feeling"]:checked');
  const intensity = Number(intensityEl.value);

  if (text.length < 5) {
    errorEl.textContent = "Describe what happened in a few words first.";
  } else if (!picked) {
    errorEl.textContent = "Choose how you feel.";
  } else {
    errorEl.textContent = "";
    const outcome = decide(picked.value, intensity);
    show(outcome, buildAdvice(outcome, picked.value, intensity), text);
  }
});
