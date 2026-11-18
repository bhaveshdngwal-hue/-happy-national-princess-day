document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
     1. BUILD REALISTIC SVG SUNFLOWERS INSIDE THE BOUQUET
     ========================================================= */
  const sunflowersGroup = document.getElementById("sunflowers-group");

  // Positions & sizes for 7 lush sunflowers arranged in a bouquet
  const flowerSpecs = [
    { x: 210, y: 125, r: 46 },
    { x: 148, y: 158, r: 42 },
    { x: 272, y: 158, r: 42 },
    { x: 175, y: 205, r: 45 },
    { x: 245, y: 205, r: 45 },
    { x: 122, y: 218, r: 36 },
    { x: 298, y: 218, r: 36 }
  ];

  flowerSpecs.forEach(({ x, y, r }) => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("transform", `translate(${x}, ${y})`);

    // Outer & inner golden petals (20 petals per flower)
    const petalCount = 20;
    for (let i = 0; i < petalCount; i++) {
      const angle = (360 / petalCount) * i;
      const petal = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      petal.setAttribute("cx", "0");
      petal.setAttribute("cy", `${-r * 0.72}`);
      petal.setAttribute("rx", `${r * 0.17}`);
      petal.setAttribute("ry", `${r * 0.44}`);
      petal.setAttribute("fill", "url(#petalGrad)");
      petal.setAttribute("stroke", "#e08e00");
      petal.setAttribute("stroke-width", "0.6");
      petal.setAttribute("transform", `rotate(${angle})`);
      g.appendChild(petal);
    }

    // Dark textured seed center
    const center = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    center.setAttribute("cx", "0");
    center.setAttribute("cy", "0");
    center.setAttribute("r", `${r * 0.42}`);
    center.setAttribute("fill", "url(#seedGrad)");
    g.appendChild(center);

    // Subtle golden pollen ring
    const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring.setAttribute("cx", "0");
    ring.setAttribute("cy", "0");
    ring.setAttribute("r", `${r * 0.32}`);
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "#f5b727");
    ring.setAttribute("stroke-width", "1.5");
    ring.setAttribute("stroke-dasharray", "2 3");
    g.appendChild(ring);

    sunflowersGroup.appendChild(g);
  });

  /* =========================================================
     2. AMBIENT CANVAS: FALLING PETALS, STARS, CONFETTI & HEARTS
     ========================================================= */
  const canvas = document.getElementById("ambient-canvas");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  class Particle {
    constructor(x, y, type) {
      this.x = x ?? Math.random() * canvas.width;
      this.y = y ?? Math.random() * canvas.height - canvas.height;
      this.type = type; // 'petal', 'star', 'cursorHeart', 'confetti'
      this.size = type === "star" ? Math.random() * 2.5 + 1 : Math.random() * 8 + 6;
      this.speedY =
        type === "cursorHeart"
          ? -(Math.random() * 1.8 + 0.8)
          : type === "confetti"
          ? Math.random() * 3 + 2
          : Math.random() * 1.2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 1.4;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotSpeed = (Math.random() - 0.5) * 0.04;
      this.alpha = 1;
      const colors = ["#ffd000", "#ffb703", "#ff8fab", "#ffc2d1", "#fff3b0"];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX + Math.sin(this.y * 0.015) * 0.4;
      this.y += this.speedY;
      this.rotation += this.rotSpeed;

      if (this.type === "cursorHeart") {
        this.alpha -= 0.022;
      } else if (this.type === "confetti") {
        this.alpha -= 0.008;
      } else if (this.y > canvas.height + 20) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      if (this.type === "petal") {
        ctx.fillStyle = "#ffc300";
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size * 0.55, this.size * 1.15, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === "star") {
        ctx.fillStyle = "#ffe66d";
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (this.type === "cursorHeart") {
        ctx.fillStyle = "#ff758f";
        ctx.font = `${this.size + 6}px serif`;
        ctx.fillText("💛", -6, 6);
      } else if (this.type === "confetti") {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      }

      ctx.restore();
    }
  }

  // Seed initial ambient petals & glowing stars
  for (let i = 0; i < 24; i++) particles.push(new Particle(null, Math.random() * canvas.height, "petal"));
  for (let i = 0; i < 30; i++) particles.push(new Particle(null, Math.random() * canvas.height, "star"));

  function burstCelebration(count = 55) {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(Math.random() * canvas.width, -10, "confetti"));
    }
  }

  // Floating heart cursor trail
  let lastHeartTime = 0;
  window.addEventListener("mousemove", (e) => {
    const now = Date.now();
    if (now - lastHeartTime > 75) {
      particles.push(new Particle(e.clientX, e.clientY, "cursorHeart"));
      lastHeartTime = now;
    }
  });

  function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter((p) => p.alpha > 0);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateCanvas);
  }
  animateCanvas();

  /* =========================================================
     3. BACKGROUND MUSIC (Replaceable MP3 + Fallback Music-Box)
     ========================================================= */
  const musicToggle = document.getElementById("music-toggle");
  const musicLabel = document.getElementById("music-label");
  const bgMusic = document.getElementById("bg-music");
  let isPlaying = false;
  let synthInterval = null;
  let audioCtx = null;

  // Gentle music-box fallback if music.mp3 isn't added yet
  function startFallbackMusicBox() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880.0, 698.46];
    let step = 0;
    synthInterval = setInterval(() => {
      if (!isPlaying) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = notes[step % notes.length];
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.1);
      step++;
    }, 650);
  }

  function stopFallbackMusicBox() {
    clearInterval(synthInterval);
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
  }

  function toggleMusic(forcePlay = false) {
    if (!isPlaying || forcePlay) {
      bgMusic
        .play()
        .then(() => {
          isPlaying = true;
          musicToggle.classList.add("playing");
          musicLabel.textContent = "Pause Music";
        })
        .catch(() => {
          // If local music.mp3 is missing, play gentle built-in chime melody
          if (!isPlaying) {
            isPlaying = true;
            musicToggle.classList.add("playing");
            musicLabel.textContent = "Pause Melody";
            startFallbackMusicBox();
          }
        });
    } else {
      bgMusic.pause();
      stopFallbackMusicBox();
      isPlaying = false;
      musicToggle.classList.remove("playing");
      musicLabel.textContent = "Play Music";
    }
  }

  musicToggle.addEventListener("click", () => toggleMusic());

  /* =========================================================
     4. WELCOME SCREEN TRANSITION
     ========================================================= */
  const welcomeScreen = document.getElementById("welcome-screen");
  const mainContent = document.getElementById("main-content");
  const openSurpriseBtn = document.getElementById("open-surprise-btn");

  openSurpriseBtn.addEventListener("click", () => {
    toggleMusic(true);
    burstCelebration(70);
    welcomeScreen.classList.add("fade-out");
    setTimeout(() => {
      welcomeScreen.style.display = "none";
      mainContent.classList.remove("hidden");
      mainContent.classList.add("visible");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 850);
  });

  /* =========================================================
     5. ACCEPT SUNFLOWER BOUQUET INTERACTION
     ========================================================= */
  const acceptBouquetBtn = document.getElementById("accept-bouquet-btn");
  const bouquetWrapper = document.getElementById("bouquet-wrapper");
  const bouquetResponse = document.getElementById("bouquet-response");

  acceptBouquetBtn.addEventListener("click", () => {
    bouquetWrapper.classList.remove("accepted");
    void bouquetWrapper.offsetWidth; // trigger reflow
    bouquetWrapper.classList.add("accepted");
    burstCelebration(65);
    bouquetResponse.textContent = "Bouquet accepted! Just like a sunflower, you always bring warmth wherever you go 🌻💛";
    acceptBouquetBtn.textContent = "Sunflowers Accepted! 🌻✨";
  });

  /* =========================================================
     6. EMOTIONAL LETTER TYPEWRITER ANIMATION
     ========================================================= */
  const unfoldLetterBtn = document.getElementById("unfold-letter-btn");
  const vintageLetter = document.getElementById("vintage-letter");
  const letterBody = document.getElementById("letter-body");
  const letterSignature = document.getElementById("letter-signature");

  const fullLetterText = `Happy National Princess Day to the most wonderful, kind-hearted, and radiant soul I know! 👑🌻

I wanted to take a moment today to remind you just how genuinely special you are to me. Life moves so fast, and we get caught up in everyday routines, yet somehow, simply having you in my life turns ordinary, dull days into memories I never want to forget.

Thank you for being my safe place, my biggest cheerleader, and the person who understands me without me even having to explain. Your kindness, your warmth, and the effortless way you care for the people around you inspire me more than words can ever capture.

I want you to know that no matter what happens, I will always stand in your corner, celebrate every little victory with you, and hold your hand through every tough day. You deserve a lifetime overflowing with pure happiness, gentle love, endless success, and every dream your heart quietly wishes for.

Thank you for being you, Kanak. You will always be my favourite human. 💛✨`;

  let letterTyped = false;

  unfoldLetterBtn.addEventListener("click", () => {
    vintageLetter.classList.remove("collapsed");
    unfoldLetterBtn.style.display = "none";

    if (!letterTyped) {
      letterTyped = true;
      let idx = 0;
      const speed = 22; // ms per character
      function typeWriter() {
        if (idx < fullLetterText.length) {
          letterBody.textContent += fullLetterText.charAt(idx);
          idx++;
          setTimeout(typeWriter, speed);
        } else {
          letterSignature.classList.remove("hidden");
        }
      }
      typeWriter();
    }
  });

  /* =========================================================
     7. CUTE FRIENDSHIP FLASHCARDS (FLIP EFFECT)
     ========================================================= */
  const flashcardsData = [
    { icon: "✨", title: "Why You're Special", message: "Because you make everything brighter." },
    { icon: "🌟", title: "Your Superpower", message: "Making people smile without even trying." },
    { icon: "💛", title: "A Little Reminder", message: "You're enough, exactly as you are." },
    { icon: "📸", title: "My Favourite Memory", message: "Every single moment spent with you." },
    { icon: "👑", title: "Your Crown", message: "Because you're my forever princess." },
    { icon: "🤞", title: "A Promise", message: "I'll always cheer for you, no matter what." }
  ];

  const flashcardsGrid = document.getElementById("flashcards-grid");

  flashcardsData.forEach((card) => {
    const cardEl = document.createElement("div");
    cardEl.className = "flashcard";
    cardEl.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="flashcard-icon">${card.icon}</div>
          <h3>${card.title}</h3>
          <span class="tap-hint">Tap to reveal 💌</span>
        </div>
        <div class="flashcard-back">
          <p>"${card.message}"</p>
        </div>
      </div>
    `;
    cardEl.addEventListener("click", () => {
      cardEl.classList.toggle("flipped");
    });
    flashcardsGrid.appendChild(cardEl);
  });

  /* =========================================================
     8. REASONS WHY YOU'RE MY FAVOURITE COUNTER
     ========================================================= */
  const reasons = [
    "Your laugh instantly fixes even my worst days.",
    "You listen with your whole heart and never judge.",
    "You have the purest, golden sunflower energy.",
    "Even doing nothing with you feels like an adventure.",
    "You celebrate other people's happiness like it's your own.",
    "You make me feel understood without saying a word.",
    "Because you are Kanak—and there's nobody else like you! 👑"
  ];

  let reasonIndex = 0;
  const reasonNumber = document.getElementById("reason-number");
  const reasonText = document.getElementById("reason-text");
  const nextReasonBtn = document.getElementById("next-reason-btn");

  nextReasonBtn.addEventListener("click", () => {
    reasonIndex = (reasonIndex + 1) % reasons.length;
    reasonNumber.textContent = String(reasonIndex + 1).padStart(2, "0");
    reasonText.textContent = reasons[reasonIndex];
  });

  /* =========================================================
     9. SECRET MESSAGE UNLOCK
     ========================================================= */
  const unlockSecretBtn = document.getElementById("unlock-secret-btn");
  const secretLocked = document.getElementById("secret-locked");
  const secretUnlocked = document.getElementById("secret-unlocked");

  unlockSecretBtn.addEventListener("click", () => {
    secretLocked.classList.add("hidden");
    secretUnlocked.classList.remove("hidden");
    burstCelebration(45);
  });

  /* =========================================================
     10. INTERACTIVE SUNFLOWER GARDEN
     ========================================================= */
  const sunflowerGarden = document.getElementById("sunflower-garden");
  const gardenToast = document.getElementById("garden-toast");
  const gardenWishes = [
    "A sunflower for your endless smile! 🌻",
    "May your dreams bloom bright! ✨",
    "Sending sunshine to Kanak! 💛",
    "You deserve all the magic! 👑",
    "Forever grateful for you! 🌼"
  ];
  let wishCount = 0;

  sunflowerGarden.addEventListener("click", (e) => {
    const rect = sunflowerGarden.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const flower = document.createElement("span");
    flower.className = "planted-flower";
    flower.textContent = wishCount % 3 === 0 ? "🌻" : wishCount % 3 === 1 ? "🌼" : "🌷";
    flower.style.left = `${x}px`;
    flower.style.top = `${y}px`;
    sunflowerGarden.appendChild(flower);

    gardenToast.textContent = gardenWishes[wishCount % gardenWishes.length];
    wishCount++;
  });

  /* =========================================================
     11. POLAROID PHOTO GALLERY CUSTOM UPLOAD
     ========================================================= */
  document.querySelectorAll(".photo-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = input.parentElement.querySelector("img");
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  });

  /* =========================================================
     12. FINAL SCREEN "ONE MORE HUG?" BUTTON & CONFETTI
     ========================================================= */
  const hugBtn = document.getElementById("hug-btn");
  const hugCounterText = document.getElementById("hug-counter-text");
  let hugCount = 0;

  hugBtn.addEventListener("click", () => {
    hugCount++;
    burstCelebration(90);
    hugCounterText.textContent =
      hugCount === 1
        ? "Sending you the biggest, warmest bear hug right now! 🫂💛"
        : `Warm hugs delivered to Princess Kanak: ${hugCount} 🫂🌻👑`;
  });
});