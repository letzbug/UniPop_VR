AFRAME.registerPrimitive("a-rounded-card", {
  defaultComponents: {
    geometry: {
      primitive: "box",
      width: 1.85,
      height: 0.72,
      depth: 0.06
    },
    material: {
      color: "#123c69",
      opacity: 0.92,
      transparent: true,
      roughness: 0.35,
      metalness: 0.25
    },
    animation__float: {
      property: "position",
      dir: "alternate",
      dur: 1800,
      easing: "easeInOutSine",
      loop: true,
      to: "0 0.04 0"
    }
  },

  mappings: {
    color: "material.color"
  }
});

const hub = document.querySelector("#hub");
const videoUI = document.querySelector("#videoUI");
const sky = document.querySelector("#sky");
const backButton = document.querySelector("#backButton");
const categories = document.querySelectorAll(".category");
const stars = document.querySelector("#stars");

let currentVideo = null;

function createStars() {
  for (let i = 0; i < 130; i++) {
    const star = document.createElement("a-sphere");

    const x = (Math.random() - 0.5) * 18;
    const y = Math.random() * 6;
    const z = -3 - Math.random() * 10;
    const size = 0.012 + Math.random() * 0.025;

    star.setAttribute("position", `${x} ${y} ${z}`);
    star.setAttribute("radius", size);
    star.setAttribute("color", "#7dd3fc");
    star.setAttribute("opacity", "0.7");

    stars.appendChild(star);
  }
}

function stopAllVideos() {
  const videos = document.querySelectorAll("video");

  videos.forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });
}

function startVideo(videoId) {
  stopAllVideos();

  currentVideo = document.querySelector(`#${videoId}`);

  if (!currentVideo) {
    alert("Video introuvable : " + videoId);
    return;
  }

  hub.setAttribute("visible", "false");
  stars.setAttribute("visible", "false");
  videoUI.setAttribute("visible", "true");

  sky.removeAttribute("color");
  sky.setAttribute("src", `#${videoId}`);
  sky.setAttribute("rotation", "0 -90 0");

  currentVideo.currentTime = 0;

  const playPromise = currentVideo.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      alert("La video ne peut pas demarrer. Verifie que le fichier existe dans le dossier videos.");
      returnToHub();
    });
  }
}

function returnToHub() {
  stopAllVideos();

  currentVideo = null;

  sky.removeAttribute("src");
  sky.setAttribute("color", "#020617");

  hub.setAttribute("visible", "true");
  stars.setAttribute("visible", "true");
  videoUI.setAttribute("visible", "false");
}

categories.forEach((category) => {
  category.addEventListener("click", () => {
    const videoId = category.getAttribute("data-video");
    startVideo(videoId);
  });

  category.addEventListener("mouseenter", () => {
    category.setAttribute("scale", "1.12 1.12 1.12");
  });

  category.addEventListener("mouseleave", () => {
    category.setAttribute("scale", "1 1 1");
  });
});

backButton.addEventListener("click", () => {
  returnToHub();
});

createStars();
