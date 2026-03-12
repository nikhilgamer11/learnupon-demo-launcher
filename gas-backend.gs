<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GALACTIC ARCHITECT | MISSION CONTROL</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;900&display=swap" rel="stylesheet">
    <style>
        :root { --orange: #FF4D00; --glow: rgba(255, 77, 0, 0.8); }
        body { background-color: #000; color: white; font-family: 'Inter', sans-serif; margin: 0; overflow-x: hidden; scroll-behavior: smooth; }
        .heavy { font-family: 'Archivo Black', sans-serif; text-transform: uppercase; line-height: 0.9; }

        #progressBar { position: fixed; top: 0; left: 0; height: 6px; background: var(--orange); box-shadow: 0 0 25px var(--orange); z-index: 100; width: 0%; transition: width 0.3s; }
        #missionClock { position: fixed; top: 2rem; right: 2rem; z-index: 60; font-family: 'Archivo Black'; font-size: 2rem; color: var(--orange); text-shadow: 0 0 15px var(--glow); }
        
        .ambient-wrapper { position: fixed; inset: 0; z-index: -2; opacity: 0.4; filter: saturate(0.7) brightness(0.5); pointer-events: none; }
        #ambientPlayer { width: 100%; height: 100%; transform: scale(1.2); }

        .section-frame { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem; }

        .line-input {
            background: transparent; border: none; border-bottom: 3px solid rgba(255, 255, 255, 0.4);
            font-family: 'Archivo Black', sans-serif; font-size: clamp(1.5rem, 5vw, 4rem);
            width: 80%; text-align: center; outline: none; transition: 0.5s;
            text-transform: uppercase; color: white; text-shadow: 0 0 15px rgba(0,0,0,1);
        }
        .line-input:focus { border-bottom-color: var(--orange); filter: drop-shadow(0 0 20px var(--glow)); }

        #launchOverlay { position: fixed; inset: 0; background: #000; z-index: 200; display: none; align-items: center; justify-content: center; }
        #starlinkVideo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 10; }
        #countdownContainer { position: relative; z-index: 20; text-align: center; }
        
        .btn-launch {
            background: var(--orange); padding: 2rem 5rem; font-family: 'Archivo Black'; font-size: 2rem;
            box-shadow: 0 0 40px var(--glow); transition: 0.4s; color: white; border: none; cursor: pointer;
        }
    </style>
</head>
<body>

    <div id="progressBar"></div>
    <div id="missionClock">T-MINUS: 5</div>

    <div class="ambient-wrapper">
        <div id="ambientPlayer"></div>
    </div>

    <form id="architectForm">
        <section class="section-frame" data-step="5">
            <h1 class="heavy text-orange-600 text-xs tracking-[0.8em] mb-4">Commander & Portal</h1>
            <input type="email" id="commander_email" class="line-input !text-2xl mb-8" placeholder="YOUR_EMAIL@DOMAIN.COM" required>
            <input type="text" id="subdomain" class="line-input" placeholder="PORTAL_ID" required>
        </section>

        <section class="section-frame" data-step="4">
            <h1 class="heavy text-orange-600 text-xs tracking-[0.8em] mb-16">Security Clearance</h1>
            <input type="text" id="api_user" class="line-input !text-2xl mb-8" placeholder="API KEY" required>
            <input type="password" id="api_pass" class="line-input !text-2xl" placeholder="API SECRET" required>
        </section>

        <section class="section-frame" data-step="3">
            <h1 class="heavy text-orange-600 text-xs tracking-[0.8em] mb-4">Course Manifest</h1>
            <input type="text" id="courses" class="line-input" placeholder="COURSE_NAME" required>
        </section>

        <section class="section-frame" data-step="2">
            <h1 class="heavy text-orange-600 text-xs tracking-[0.8em] mb-4">Group Architecture</h1>
            <input type="text" id="groups" class="line-input" placeholder="GROUP_NAME" required>
        </section>

        <section class="section-frame" data-step="1">
            <h1 class="heavy text-white text-6xl italic mb-12">Final Ignition.</h1>
            <input type="datetime-local" class="line-input !text-3xl mb-16" required>
            <button type="submit" class="btn-launch heavy">INITIATE LAUNCH</button>
        </section>
    </form>

    <div id="launchOverlay">
        <video id="starlinkVideo" playsinline muted>
            <source src="Starlink launch.mp4" type="video/mp4">
        </video>
        <div id="countdownContainer">
            <h1 id="cdText" class="heavy text-white text-[20vw] italic">5</h1>
        </div>
        <div id="successMsg" class="hidden absolute z-30 text-center bg-black/60 inset-0 flex flex-col items-center justify-center backdrop-blur-md">
            <h1 class="heavy text-white text-7xl">ORBIT ACHIEVED</h1>
            <p class="heavy text-orange-600 tracking-[0.5em] mt-4">PORTAL CONFIGURED & LOGGED</p>
            <button onclick="location.reload()" class="mt-12 border border-white/30 px-8 py-4 text-xs hover:bg-white hover:text-black">REBOOT SYSTEM</button>
        </div>
    </div>

    <script>
        // Updated URL from successful execution
        const SCRIPT_URL = 'https://script.google.com/a/macros/learnupon.com/s/AKfycbyheX43gNnTcn0KS3fqmx7cHFCYXVqUP3nlDZzZ2vcB77ggkk8FDkSGcGpMj8SZYF7k5g/exec';

        // YouTube Ambient Logic
        var tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        var player;
        function onYouTubeIframeAPIReady() {
            player = new YT.Player('ambientPlayer', {
                height: '100%', width: '100%', videoId: 'C3iHAgwIYtI',
                playerVars: { 'autoplay': 1, 'controls': 0, 'mute': 1, 'start': 0, 'end': 30 },
                events: { 'onStateChange': (e) => { if (e.data === YT.PlayerState.ENDED) { player.seekTo(0); player.playVideo(); } } }
            });
        }

        document.getElementById('architectForm').onsubmit = async (e) => {
            e.preventDefault();
            
            const payload = {
                commander: document.getElementById('commander_email').value,
                subdomain: document.getElementById('subdomain').value,
                username: document.getElementById('api_user').value,
                password: document.getElementById('api_pass').value,
                courses: document.getElementById('courses').value,
                groups: document.getElementById('groups').value
            };

            // Start Launch Visuals
            const overlay = document.getElementById('launchOverlay');
            const video = document.getElementById('starlinkVideo');
            overlay.style.display = 'flex';
            video.currentTime = 25; 
            video.play();

            // Submit to Mission Control
            fetch(SCRIPT_URL, { 
                method: 'POST', 
                mode: 'no-cors', 
                body: JSON.stringify(payload) 
            });

            // Countdown Logic
            let count = 5;
            const timer = setInterval(() => {
                count--;
                document.getElementById('cdText').innerText = count > 0 ? count : "IGNITION";
                if(count <= 0) {
                    clearInterval(timer);
                    setTimeout(() => {
                        document.getElementById('countdownContainer').classList.add('hidden');
                        document.getElementById('successMsg').classList.remove('hidden');
                    }, 2000); 
                }
            }, 1000);
        };

        // Scroll Progression Logic
        window.onscroll = () => {
            const winScroll = document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            document.getElementById("progressBar").style.width = (winScroll / height * 100) + "%";
            
            document.querySelectorAll('section').forEach(sec => {
                const rect = sec.getBoundingClientRect();
                if(rect.top >= -100 && rect.top <= window.innerHeight/2) {
                    document.getElementById('missionClock').innerText = `T-MINUS: ${sec.dataset.step}`;
                }
            });
        };
    </script>
</body>
</html>
