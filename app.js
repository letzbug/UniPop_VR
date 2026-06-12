const hubRoot = document.querySelector("#hubRoot");
const videoUI = document.querySelector("#videoUI");
const videoSky = document.querySelector("#videoSky");
const backButton = document.querySelector("#backButton");
const hotspots = document.querySelectorAll(".hotspot");

let currentVideo = null;

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

  hubRoot.setAttribute("visible", "false");
  videoUI.setAttribute("visible", "true");

  videoSky.removeAttribute("color");
  videoSky.setAttribute("src", `#${videoId}`);
  videoSky.setAttribute("rotation", "0 -90 0");

  currentVideo.currentTime = 0;

  const playPromise = currentVideo.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      alert("La video ne peut pas demarrer. Remplace le fichier dans le dossier videos.");
      returnToHub();
    });
  }
}

function returnToHub() {
  stopAllVideos();

  currentVideo = null;

  videoSky.removeAttribute("src");
  videoSky.setAttribute("color", "#020617");

  hubRoot.setAttribute("visible", "true");
  videoUI.setAttribute("visible", "false");
}

hotspots.forEach((hotspot) => {
  hotspot.addEventListener("click", () => {
    const videoId = hotspot.getAttribute("data-video");
    startVideo(videoId);
  });

  hotspot.addEventListener("mouseenter", () => {
    hotspot.setAttribute("scale", "1.08 1.08 1.08");
    const circle = hotspot.querySelector("a-circle");
    circle.setAttribute("material", "opacity", "0.22");
  });

  hotspot.addEventListener("mouseleave", () => {
    hotspot.setAttribute("scale", "1 1 1");
    const circle = hotspot.querySelector("a-circle");
    circle.setAttribute("material", "opacity", "0.05");
  });
});

backButton.addEventListener("click", () => {
  returnToHub();
});
