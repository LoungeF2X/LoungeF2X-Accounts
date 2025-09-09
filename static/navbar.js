// Add your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyBddL00mb8gHPJH__nIdADfBhqPiFtOLCE",
  authDomain: "loungef2x.firebaseapp.com",
  projectId: "loungef2x",
  storageBucket: "loungef2x.appspot.com",
  messagingSenderId: "38074061356",
  appId: "1:38074061356:web:5b8386cd6109504bdbf789",
  measurementId: "G-K0XFKT6PDT"
};

// Initialize Firebase if not already initialized
if (typeof firebase !== "undefined" && firebase.apps && !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized in navbar.js");
}

// Load Firebase App and Firestore if not already loaded
if (typeof firebase === "undefined") {
  const script1 = document.createElement('script');
  script1.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js";
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.src = "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js";
  document.head.appendChild(script2);
}

// Function to create and insert the navbar
function insertNavbar() {
  // Define the HTML for the navbar
  const navbarHTML = `
  <!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-JC8E4VJGL9"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>

<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-JC8E4VJGL9');
</script>
      <script src="/static/rightclick.js"></script>
  <div id="contextMenu" class="context-menu" style="display:none">
    <ul>
      <li onclick="openSettings('/')"><a>Home</a></li>
      <li onclick="openSettings('/static/proxy.html')"><a>Proxy</a></li>
      <li onclick="cloakAll()"><a>Cloak Tab</a></li>
    </ul>
  </div>
  <style type="text/css">
#main {
    position: relative;  /* Ensures content appears above the particles */
    z-index: 1;  /* Moves content in front of particles */
}

        .item {
    opacity: 0;
    transform: translateY(10px);
    animation: fadeIn 0.5s ease forwards;
    animation-delay: calc(var(--index) * 0.2s);
}

          .secret-mode {
            color: red;
            animation: secret-glow 2s infinite alternate;
        }

        @keyframes secret-glow {
            0% {
                text-shadow: 0 0 10px red;
            }
            100% {
                text-shadow: 0 0 20px red;
            }
        }
    .context-menu {
      position: absolute;
      text-align: center;
      background: lightgray;
      border: 1px solid black;
      border-radius: 25px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, .1);
      padding: 10px;
      z-index: 1000;
    }

    .context-menu ul {
      padding: 0px;
      margin: 0px;
      min-width: 150px;
      list-style: none;
    }

    .context-menu ul li {
      padding-bottom: 7px;
      border-radius: 100px;
      padding-top: 7px;
      border: 1px solid black;
    }

    .context-menu ul li a {
      text-decoration: none;
      color: black;
    }

    .context-menu ul li:hover {
      background: darkgray;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      color: red;
    }
      #main {
      margin: 100px;
      }
  .navbar {
      position: fixed;
      top: 0;
      left: 0;
      width: 210px;
      height: 100vh;
      background-color: #333;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 0 0;
      z-index: 10000000000000000;
      border-right: 2px solid #ff3c3c;
  }

  .navbar .left-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin-top: 18px;
      margin-bottom: 30px;
  }

  .navbar .right-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
      padding-left: 0;
  }

  .right-section a {
      width: 100%;
      font-size: 16px;
      color: white;
      text-align: left;
      padding: 14px 24px;
      text-decoration: none;
      transition: background 0.3s;
      cursor: pointer;
      border-radius: 0 20px 20px 0;
      margin: 0;
      box-sizing: border-box;
  }
  .navbar .left-section a {
      color: red;
      padding: 0;
      text-align: center;
      background: none;
  }
  .right-section a:hover {
      background-color: #ff3c3c;
      color: #fff;
  }

  .navbar img {
      width: 48px;
      height: 48px;
      object-fit: contain;
      margin-bottom: 6px;
  }

  .navbar p {
      font-size: 22px;
      color: #ff3c3c;
      margin: 0;
      font-weight: bold;
      letter-spacing: 1px;
  }

  .dropdown {
      width: 100%;
      position: relative;
      display: block;
  }

  .dropdown .dropbtn {
      width: 100%;
      font-size: 16px;
      border: none;
      outline: none;
      color: white;
      padding: 14px 24px;
      background-color: inherit;
      font-family: inherit;
      cursor: pointer;
      text-align: left;
      border-radius: 0 20px 20px 0;
  }

  .dropdown-content {
      display: none;
      position: absolute;
      left: 100%;
      top: 0;
      background-color: #f9f9f9;
      min-width: 160px;
      box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.2);
      z-index: 1000;
  }

  .dropdown-content a {
      color: black;
      padding: 12px 16px;
      text-decoration: none;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      height: 40px;
  }

  .dropdown-content a:hover {
      background-color: #ddd;
  }

  .dropdown:hover .dropdown-content {
      display: block;
  }

  @media (max-width: 700px) {
      .navbar {
          width: 60px;
      }
      .navbar .left-section p,
      .right-section a span,
      .dropdown .dropbtn span {
          display: none;
      }
      .right-section a,
      .dropdown .dropbtn {
          padding: 14px 10px;
      }
      .navbar img {
          width: 32px;
          height: 32px;
      }
  }
  body {
      margin-left: 210px !important;
  }
  @media (max-width: 700px) {
      body {
          margin-left: 60px !important;
      }
  }
  </style>
  <div class="navbar">
      <div class="left-section">
        <a href="/static/dash">
          <img class="pfp" src="/static/images/profile-icon.jfif" alt="Profile" style="width:48px;height:48px;border-radius:50%;vertical-align:middle;">
        </a>
        <a href="/static/"><p>LoungeF2X</p></a>
      </div>
      <div class="right-section">
        <a href="/static/index.html"><span>Home</span></a>
        <a href="/static/g.html"><span>Games</span></a>
        <a href="/static/l2xflix/index.html"><span>L2X-Flix</span></a>
        <a href="/tabs.html"><span>Browser</span></a>
        <a href="/ia.html"><span>AI</span></a>
        <a href="/static/settings.html"><span>Settings</span></a>
      </div>
  </div>

  <script>
    function goFullscreen(id) {
      var element = document.getElementById(id);

      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          console.error(\Failed to enter fullscreen mode: \${err.message}\);
        });
      } else if (element.mozRequestFullScreen) { // Firefox
        element.mozRequestFullScreen().catch((err) => {
          console.error(\Failed to enter fullscreen mode: \${err.message}\);
        });
      } else if (element.webkitRequestFullscreen) { // Older WebKit
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) { // IE/Edge
        element.msRequestFullscreen();
      } else {
        console.error("Fullscreen API is not supported on this browser.");
      }
    }

    if (window.updateNavbarPfp) {
  window.updateNavbarPfp(accountData);
}
      </script>
  `;
  const navbarDiv = document.createElement('div');
  navbarDiv.innerHTML = navbarHTML;

  // Insert the navbar at the top of the body
  const body = document.body;
  body.insertBefore(navbarDiv, body.firstChild);
}

// Function to update the navbar profile icon with the user's PFP
function updateNavbarPfp(accountData) {
  const navbarImg = document.querySelector('.navbar .left-section img.pfp');
  if (!navbarImg) {
    console.error("Navbar profile image element not found.");
    return;
  }
  if (accountData && accountData.profileImageDataUrl) {
    navbarImg.src = accountData.profileImageDataUrl;
    console.log("Navbar profile icon updated with user PFP:", accountData.profileImageDataUrl.slice(0, 50) + "...");
  } else {
    navbarImg.src = "/static/images/profile-icon.jfif";
    console.log("Navbar profile icon set to default.");
  }
}

window.updateNavbarPfp = updateNavbarPfp;

async function autoUpdateNavbarPfp() {
  // Wait until firebase and firestore are loaded
  function waitForFirebase() {
    return new Promise(resolve => {
      function check() {
        if (typeof firebase !== "undefined" && firebase.firestore) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      }
      check();
    });
  }

  await waitForFirebase();

  // Initialize Firebase if not already initialized
  if (typeof firebase !== "undefined" && firebase.apps && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized in navbar.js (autoUpdateNavbarPfp)");
  }

  if (!localStorage.getItem("account")) {
    console.error("No account found in localStorage.");
    updateNavbarPfp({});
    return;
  }

  try {
    if (!window._navbarDb) {
      window._navbarDb = firebase.firestore();
      console.log("Firestore initialized in navbar.");
    }
    const db = window._navbarDb;
    const accountId = localStorage.getItem("account");
    const doc = await db.collection("accounts").doc(accountId).get();
    if (doc.exists) {
      console.log("Account data loaded from Firestore:", doc.data());
      window.updateNavbarPfp(doc.data());
    } else {
      console.error("Account document not found in Firestore.");
      window.updateNavbarPfp({});
    }
  } catch (e) {
    console.error("Error fetching account data from Firestore:", e);
    window.updateNavbarPfp({});
  }
}

document.addEventListener("DOMContentLoaded", () => {
  insertNavbar();
  autoUpdateNavbarPfp();
});