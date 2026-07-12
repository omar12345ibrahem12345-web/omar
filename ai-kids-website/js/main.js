/**
 * AI for Kids Website - Main JavaScript
 * Simple interactions and animations
 */

document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // Smooth scroll for anchor links
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ============================================
  // Animate cards on scroll (IntersectionObserver)
  // ============================================
  const animateElements = document.querySelectorAll('.card, .step-card, .analogy-card, .example-card, .playground-card, .project-card, .safety-card, .fact-card, .real-world-card');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    animateElements.forEach(el => el.classList.add('animate-in'));
  }

  // ============================================
  // Example card buttons - simple click feedback
  // ============================================
  document.querySelectorAll('.try-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      // Add click animation
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 150);
      
      // If it's a demo button (not external link), show placeholder
      if (!this.classList.contains('external')) {
        const example = this.dataset.example;
        showPlaceholderAlert(example);
      }
    });
  });

  // ============================================
  // Project buttons
  // ============================================
  document.querySelectorAll('.project-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => this.style.transform = '', 150);
      
      const project = this.dataset.project;
      showProjectIdea(project);
    });
  });

  // ============================================
  // Floating animation for hero elements
  // ============================================
  const floatingElements = document.querySelectorAll('.floating-robot, .play-robot');
  floatingElements.forEach((el, index) => {
    el.style.animationDelay = `${index * 0.5}s`;
  });

  // ============================================
  // Parallax effect on hero (subtle)
  // ============================================
  const hero = document.querySelector('.hero');
  if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const heroIllustration = hero.querySelector('.hero-illustration');
      if (heroIllustration && scrolled < hero.offsetHeight) {
        heroIllustration.style.transform = `translateY(${scrolled * 0.1}px)`;
      }
    }, { passive: true });
  }

  // ============================================
  // Keyboard navigation for cards
  // ============================================
  document.querySelectorAll('.card, .step-card, .example-card, .playground-card, .project-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const btn = card.querySelector('button, a.btn-play, a.play-btn');
        if (btn) btn.click();
      }
    });
  });

  // ============================================
  // Helper functions
  // ============================================
  // Helper functions
  // ============================================

  function showPlaceholderAlert(example) {
    const messages = {
      artist: '🎨 Try "Quick, Draw!" by Google - draw something and AI guesses it!',
      musician: '🎵 Check out Chrome Music Lab - make music with AI!',
      storyteller: '📚 Try AI Dungeon or ask ChatGPT to write a story with your ideas!',
      gamebuddy: '🎮 Play against AI in games like Quick Draw or Chess.com!',
      chatbuddy: '🗣️ Try talking to ChatGPT, Claude, or other AI assistants!',
      helper: '🏥 AI helps doctors, farmers, scientists - it is changing the world!'
    };
  
    alert(messages[example] || 'Try this fun AI example!');
  }

  function showProjectIdea(project) {
    const ideas = {
      rps: '🎯 Rock-Paper-Scissors AI Project:\n1. Go to Teachable Machine\n2. Choose "Image Project"\n3. Record 3 classes: Rock ✊, Paper ✋, Scissors ✌️\n4. Train the model\n5. Play against your AI!',
      gallery: '🎨 AI Art Gallery Project:\n1. Use an AI art tool (with a grown-up)\n2. Make 10 pictures with fun prompts\n3. Save them and make a digital gallery\n4. Share with family and friends!',
      story: '📖 Co-Write a Story:\n1. Write one sentence to start\n2. Ask AI to continue\n3. You write the next sentence\n4. Keep going until the story ends!\n5. Read it aloud for laughs!'
    };
  
    alert(ideas[project] || 'Cool project idea! Ask a grown-up to help you try it.');
  }

  // ============================================
  // Interactive Demos for Play with AI page
  // ============================================

  // Demo tab switching
  function initDemoTabs() {
    const tabs = document.querySelectorAll('.demo-tab');
    const panels = document.querySelectorAll('.demo-panel');
  
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const demo = tab.dataset.demo;
      
        // Update tabs
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
      
        // Update panels
        panels.forEach(p => p.classList.remove('active'));
        document.getElementById(`demo-${demo}`).classList.add('active');
      });
    });
  }

  // Drawing Canvas Demo - Simple shape recognition
  function initDrawingDemo() {
    const canvas = document.getElementById('drawing-canvas');
    const clearBtn = document.getElementById('clear-canvas');
    const guessBtn = document.getElementById('guess-drawing');
    const resultDiv = document.getElementById('guess-result');
    const guessText = document.getElementById('guess-text');
    const confidenceText = document.getElementById('confidence-text');
  
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
  
    // Setup canvas
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2D3436';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Drawing events
    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX || e.touches[0].clientX) - rect.left,
        y: (e.clientY || e.touches[0].clientY) - rect.top
      };
    }
  
    function startDrawing(e) {
      e.preventDefault();
      isDrawing = true;
      const coords = getCoords(e);
      lastX = coords.x;
      lastY = coords.y;
    }
  
    function draw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      const coords = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
      lastX = coords.x;
      lastY = coords.y;
    }
  
    function stopDrawing() {
      isDrawing = false;
    }
  
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
  
    // Clear canvas
    clearBtn.addEventListener('click', () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      resultDiv.classList.add('hidden');
    });
  
    // Simple shape recognition based on drawing analysis
    guessBtn.addEventListener('click', () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const guess = analyzeDrawing(imageData);
    
      guessText.textContent = guess.label;
      confidenceText.textContent = `${guess.confidence}%`;
      resultDiv.classList.remove('hidden');
    
      // Celebration animation
      guessBtn.textContent = '🎉 Guessed!';
      setTimeout(() => {
        guessBtn.textContent = '🤖 AI Guess!';
      }, 2000);
    });
  
    // Simple heuristic-based shape recognition
    function analyzeDrawing(imageData) {
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
    
      // Find drawn pixels (non-white)
      let pixels = [];
      let minX = width, maxX = 0, minY = height, maxY = 0;
      let pixelCount = 0;
    
      for (let y = 0; y < height; y += 2) { // Sample every 2px for performance
        for (let x = 0; x < width; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2];
          // If not white (threshold)
          if (r < 200 || g < 200 || b < 200) {
            pixels.push({x, y});
            pixelCount++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
    
      if (pixelCount < 50) {
        return { label: 'nothing? 🤔', confidence: 10 };
      }
    
      const bboxWidth = maxX - minX;
      const bboxHeight = maxY - minY;
      const aspectRatio = bboxWidth / bboxHeight;
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const canvasCenterX = width / 2;
      const canvasCenterY = height / 2;
    
      // Distance from center
      const distFromCenter = Math.sqrt(
        Math.pow(centerX - canvasCenterX, 2) + Math.pow(centerY - canvasCenterY, 2)
      );
    
      // Analyze shape characteristics
      let topPixels = 0, bottomPixels = 0, leftPixels = 0, rightPixels = 0;
      let centerPixels = 0;
    
      pixels.forEach(p => {
        if (p.y < canvasCenterY) topPixels++;
        else bottomPixels++;
        if (p.x < canvasCenterX) leftPixels++;
        else rightPixels++;
      
        const distToCenter = Math.sqrt(
          Math.pow(p.x - canvasCenterX, 2) + Math.pow(p.y - canvasCenterY, 2)
        );
        if (distToCenter < 50) centerPixels++;
      });
    
      const topRatio = topPixels / pixelCount;
      const bottomRatio = bottomPixels / pixelCount;
      const leftRatio = leftPixels / pixelCount;
      const rightRatio = rightPixels / pixelCount;
      const centerRatio = centerPixels / pixelCount;
    
      // Heuristic rules for simple shapes
      // Sun / Circle: round, centered, pixels distributed evenly around center
      if (aspectRatio > 0.7 && aspectRatio < 1.4 && centerRatio > 0.3 && distFromCenter < 60) {
        return { label: '☀️ sun', confidence: 85 };
      }
    
      // House: wider than tall, more pixels at bottom, maybe triangle top
      if (aspectRatio > 1.2 && bottomRatio > 0.6) {
        return { label: '🏠 house', confidence: 75 };
      }
    
      // Tree: taller than wide, more pixels at top (leaves)
      if (aspectRatio < 0.8 && topRatio > 0.55) {
        return { label: '🌳 tree', confidence: 75 };
      }
    
      // Cat face: round-ish, centered, with "ears" (top corners)
      if (aspectRatio > 0.7 && aspectRatio < 1.3 && centerRatio > 0.25) {
        // Check for ear-like protrusions at top
        let topLeftPixels = 0, topRightPixels = 0;
        pixels.forEach(p => {
          if (p.y < canvasCenterY - 30) {
            if (p.x < canvasCenterX) topLeftPixels++;
            else topRightPixels++;
          }
        });
        if (topLeftPixels > 10 && topRightPixels > 10) {
          return { label: '🐱 cat', confidence: 70 };
        }
      }
    
      // Flower: round center with petals around
      if (aspectRatio > 0.6 && aspectRatio < 1.5 && centerRatio > 0.2) {
        return { label: '🌸 flower', confidence: 65 };
      }
    
      // Cup: wider at top, narrower at bottom
      if (aspectRatio < 1 && topRatio > 0.4 && bottomRatio > 0.4) {
        return { label: '☕ cup', confidence: 60 };
      }
    
      // Default guesses based on aspect ratio
      if (aspectRatio > 1.5) {
        return { label: '📏 line / snake?', confidence: 50 };
      } else if (aspectRatio < 0.6) {
        return { label: '📍 tall thing?', confidence: 50 };
      } else {
        return { label: '🔵 circle / blob', confidence: 55 };
      }
    }
  }

  // Chat Bot Demo
  function initChatDemo() {
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');
    const chatMessages = document.getElementById('chat-messages');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
  
    if (!chatInput) return;
  
    // Bot responses
    const botResponses = {
      jokes: [
        "Why did the robot go on a diet? Because it had too many bytes! 😄",
        "What do you call a robot that tells jokes? A comed-ian! 🤖😂",
        "Why don't robots have brothers? Because they only have trans-sisters! 😆",
        "What's a robot's favorite type of music? Heavy metal! 🎸",
        "Why was the computer cold? It left its Windows open! ❄️💻"
      ],
      facts: [
        "Honey never spoils! Archaeologists found 3000-year-old honey in Egyptian tombs and it was still edible! 🍯",
        "Octopuses have THREE hearts and BLUE blood! 🐙💙",
        "A group of flamingos is called a 'flamboyance'! 🦩✨",
        "Bananas are berries, but strawberries aren't! 🍌🍓",
        "The Eiffel Tower grows taller in summer! The metal expands in heat - up to 15cm! 🗼☀️"
      ],
      riddles: [
        "I have keys but no locks. I have space but no room. You can enter but can't go inside. What am I? ... A keyboard! ⌨️",
        "What has a face and two hands but no arms or legs? ... A clock! ⏰",
        "I'm tall when I'm young, short when I'm old. What am I? ... A candle! 🕯️",
        "What has words but never speaks? ... A book! 📚",
        "What can you catch but not throw? ... A cold! 🤧"
      ],
      default: [
        "That's interesting! Tell me more! 🤖",
        "Cool! I love learning new things from kids like you! ✨",
        "Hmm, my circuits are buzzing with curiosity! ⚡",
        "Beep boop! That's a fun thing to say! 🤖💬",
        "Wow, you're a great conversationalist! 🌟"
      ],
      'how does ai work': "Great question! AI learns by looking at LOTS of examples (like millions of pictures or texts), finding patterns, and then using those patterns to understand new things. It's like how you learned to read - first seeing letters, then words, then whole sentences! 📚🤖"
    };
  
    function addMessage(text, isUser = false) {
      const msgDiv = document.createElement('div');
      msgDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.textContent = isUser ? '👦' : '🤖';
    
      const content = document.createElement('div');
      content.className = 'message-content';
      const p = document.createElement('p');
      p.textContent = text;
      content.appendChild(p);
    
      msgDiv.appendChild(avatar);
      msgDiv.appendChild(content);
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  
    function getBotResponse(userText) {
      const lower = userText.toLowerCase();
    
      if (lower.includes('joke') || lower.includes('funny')) {
        return botResponses.jokes[Math.floor(Math.random() * botResponses.jokes.length)];
      }
      if (lower.includes('fact') || lower.includes('trivia')) {
        return botResponses.facts[Math.floor(Math.random() * botResponses.facts.length)];
      }
      if (lower.includes('riddle') || lower.includes('puzzle')) {
        return botResponses.riddles[Math.floor(Math.random() * botResponses.riddles.length)];
      }
      if (lower.includes('how does ai work') || lower.includes('how ai works')) {
        return botResponses['how does ai work'];
      }
      if (lower.includes('hello') || lower.includes('hi ') || lower.includes('hey')) {
        return "Hello there! 👋 How can I help you today?";
      }
      if (lower.includes('bye') || lower.includes('goodbye')) {
        return "Bye! It was fun chatting! Come back anytime! 👋🤖";
      }
      if (lower.includes('name')) {
        return "I'm Robo-Buddy, your friendly AI companion! What's your name? 🤖";
      }
      if (lower.includes('age') || lower.includes('old')) {
        return "I don't have an age like humans do - I'm a computer program! But I love learning new things every day! 📅🤖";
      }
    
      return botResponses.default[Math.floor(Math.random() * botResponses.default.length)];
    }
  
    function sendMessage() {
      const text = chatInput.value.trim();
      if (!text) return;
    
      addMessage(text, true);
      chatInput.value = '';
    
      // Simulate bot thinking
      sendBtn.disabled = true;
      sendBtn.textContent = '...';
    
      setTimeout(() => {
        const response = getBotResponse(text);
        addMessage(response, false);
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send 💬';
      }, 800 + Math.random() * 500);
    }
  
    sendBtn.addEventListener('click', sendMessage);
  
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  
    suggestionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        chatInput.value = btn.dataset.msg;
        sendMessage();
      });
    });
  }

  // Beat Maker Demo
  function initBeatMaker() {
    const beatGrid = document.getElementById('beat-grid');
    const playBtn = document.getElementById('play-beat');
    const stopBtn = document.getElementById('stop-beat');
    const clearBtn = document.getElementById('clear-beat');
    const tempoSlider = document.getElementById('tempo-slider');
    const tempoValue = document.getElementById('tempo-value');
    const presetBtns = document.querySelectorAll('.preset-btn');
  
    if (!beatGrid) return;
  
    // Audio context for Web Audio API
    let audioCtx = null;
    let isPlaying = false;
    let currentStep = 0;
    let playInterval = null;
    let tempo = 120;
  
    // Sound definitions (using oscillator synthesis)
    const sounds = [
      { name: '🥁 Kick', freq: 60, type: 'sine', duration: 0.15 },
      { name: '🥁 Snare', freq: 200, type: 'triangle', duration: 0.1 },
      { name: '🥁 Hi-Hat', freq: 8000, type: 'square', duration: 0.05 },
      { name: '🎹 Bass', freq: 110, type: 'sawtooth', duration: 0.2 }
    ];
  
    // Beat pattern: 4 rows x 8 steps
    let pattern = [
      [1, 0, 0, 0, 1, 0, 0, 0], // Kick
      [0, 0, 1, 0, 0, 0, 1, 0], // Snare
      [1, 1, 1, 1, 1, 1, 1, 1], // Hi-hat
      [1, 0, 0, 1, 0, 0, 1, 0]  // Bass
    ];
  
    // Presets
    const presets = {
      basic: [
        [1, 0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 1, 0, 0, 1, 0]
      ],
      funky: [
        [1, 0, 0, 1, 1, 0, 0, 1],
        [0, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [1, 0, 1, 0, 0, 1, 0, 1]
      ],
      electro: [
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0]
      ]
    };
  
    // Generate beat grid UI
    function renderBeatGrid() {
      beatGrid.innerHTML = '';
      sounds.forEach((sound, rowIdx) => {
        const row = document.createElement('div');
        row.className = 'beat-row';
      
        const label = document.createElement('div');
        label.className = 'beat-label';
        label.textContent = sound.name;
        row.appendChild(label);
      
        pattern[rowIdx].forEach((step, colIdx) => {
          const pad = document.createElement('div');
          pad.className = `beat-pad ${step ? 'active' : ''}`;
          pad.dataset.row = rowIdx;
          pad.dataset.col = colIdx;
          pad.addEventListener('click', () => togglePad(rowIdx, colIdx, pad));
          row.appendChild(pad);
        });
      
        beatGrid.appendChild(row);
      });
    }
  
    function togglePad(row, col, pad) {
      pattern[row][col] = pattern[row][col] ? 0 : 1;
      pad.classList.toggle('active', pattern[row][col] === 1);
    }
  
    function playStep(step) {
      // Visual feedback
      document.querySelectorAll(`.beat-pad[data-col="${step}"]`).forEach((pad, rowIdx) => {
        if (pattern[rowIdx][step]) {
          pad.classList.add('playing');
          setTimeout(() => pad.classList.remove('playing'), 100);
        
          // Play sound
          playSound(rowIdx);
        }
      });
    }
  
    function playSound(rowIdx) {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
    
      const sound = sounds[rowIdx];
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
    
      oscillator.type = sound.type;
      oscillator.frequency.value = sound.freq;
    
      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + sound.duration);
    
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
    
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + sound.duration);
    }
  
    function startPlayback() {
      if (isPlaying) return;
      isPlaying = true;
      playBtn.disabled = true;
      stopBtn.disabled = false;
      currentStep = 0;
    
      const stepTime = (60 / tempo) * 1000; // ms per step (16th note)
    
      playInterval = setInterval(() => {
        playStep(currentStep);
        currentStep = (currentStep + 1) % 8;
      }, stepTime);
    }
  
    function stopPlayback() {
      isPlaying = false;
      clearInterval(playInterval);
      playBtn.disabled = false;
      stopBtn.disabled = true;
      currentStep = 0;
      // Remove playing class from all pads
      document.querySelectorAll('.beat-pad.playing').forEach(p => p.classList.remove('playing'));
    }
  
    function clearPattern() {
      pattern = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
      ];
      renderBeatGrid();
    }
  
    function loadPreset(presetName) {
      if (presets[presetName]) {
        pattern = presets[presetName].map(row => [...row]);
        renderBeatGrid();
      }
    }
  
    // Event listeners
    playBtn.addEventListener('click', startPlayback);
    stopBtn.addEventListener('click', stopPlayback);
    clearBtn.addEventListener('click', () => {
      stopPlayback();
      clearPattern();
    });
  
    tempoSlider.addEventListener('input', (e) => {
      tempo = parseInt(e.target.value);
      tempoValue.textContent = tempo;
      if (isPlaying) {
        stopPlayback();
        startPlayback();
      }
    });
  
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        loadPreset(btn.dataset.preset);
      });
    });
  
    // Initialize
    renderBeatGrid();
  }

  // Initialize interactive demos when on play-with-ai page
  function initInteractiveDemos() {
    if (document.querySelector('.interactive-demos')) {
      initDemoTabs();
      initDrawingDemo();
      initChatDemo();
      initBeatMaker();
    }
  }

  // ============================================
  // Add fun hover effects to cards
  // ============================================
  document.querySelectorAll('.card, .step-card, .analogy-card, .example-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.02)';
    });
  
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });

  // ============================================
  // Sparkle animation on hero
  // ============================================
  const sparkles = document.querySelectorAll('.sparkle');
  sparkles.forEach((sparkle, index) => {
    sparkle.style.animationDelay = `${index * 0.2}s`;
  });

  // ============================================
  // Page load animation
  // ============================================
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.3s ease';

  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  // ============================================
  // Console easter egg for curious kids
  // ============================================
  console.log('%c🤖 Welcome to AI for Kids!', 'font-size: 24px; color: #6C5CE7; font-weight: bold;');
  console.log('%cCurious about how this website works?', 'font-size: 14px; color: #636E72;');
  console.log('%cRight-click anywhere and select "Inspect" to see the code!', 'font-size: 14px; color: #636E72;');
  console.log('%c🌟 Keep learning and have fun with AI!', 'font-size: 16px; color: #00CEC9; font-weight: bold;');

  // ============================================
  // Respect reduced motion preference
  // ============================================
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition-fast', '0ms');
    document.documentElement.style.setProperty('--transition-normal', '0ms');
    document.documentElement.style.setProperty('--transition-slow', '0ms');
  }

  // Initialize interactive demos
  document.addEventListener('DOMContentLoaded', initInteractiveDemos);

  // ============================================
  // Export for potential module use
  // ============================================
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {};
  }