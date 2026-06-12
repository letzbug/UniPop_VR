const hub = document.querySelector("#hub");
const videoUI = document.querySelector("#videoUI");
const videoSky = document.querySelector("#videoSky");
const backButton = document.querySelector("#backButton");
const hotspots = document.querySelectorAll(".hotspot");

function stopAllVideos() {
  document.querySelectorAll("video").forEach((video) => {
    video.pause();
    video.currentTime = 0;
  });
}

function startVideo(videoId) {
  stopAllVideos();

  const video = document.querySelector(`#${videoId}`);

  if (!video) {
    alert("Video introuvable : " + videoId);
    return;
  }

  hub.setAttribute("visible", "false");
  videoUI.setAttribute("visible", "true");

  videoSky.removeAttribute("color");
  videoSky.setAttribute("src", `#${videoId}`);
  videoSky.setAttribute("rotation", "0 -90 0");

  video.currentTime = 0;

  video.play().catch(() => {
    alert("Remplace d'abord le fichier video dans le dossier videos.");
    returnToHub();
  });
}

function returnToHub() {
  stopAllVideos();

  videoSky.removeAttribute("src");
  videoSky.setAttribute("color", "#000814");

  hub.setAttribute("visible", "true");
  videoUI.setAttribute("visible", "false");
}

hotspots.forEach((hotspot) => {
  hotspot.addEventListener("click", () => {
    startVideo(hotspot.dataset.video);
  });
});

backButton.addEventListener("click", returnToHub);
