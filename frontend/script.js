async function fetchNowPlaying() {
  try {
    const res = await fetch("/api/nowplaying");
    const data = await res.json();

    const posterUrl = `/assets/fallback.png`;
    if (data.item.ImageTags?.Primary) {
      const server = await fetch("/api/config").then(r => r.json());
      document.getElementById("poster").src = `${server.server}/Items/${data.item.Id}/Images/Primary?tag=${data.item.ImageTags.Primary}&quality=90`;
    }

    document.getElementById("rating").textContent = data.item.OfficialRating || "NR";
    document.getElementById("year").textContent = data.item.ProductionYear || "----";
    document.getElementById("runtime").textContent = `${Math.floor(data.item.RunTimeTicks / 600000000)} min`;
    document.getElementById("audio").textContent = data.item.Audio || "--";

    const qrDiv = document.getElementById("qr");
    qrDiv.innerHTML = "";
    if (data.item.ProviderIds?.Imdb) {
      const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(data.item.Name + ' trailer')}`;
      const qr = document.createElement("img");
      qr.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(trailerUrl)}&size=100x100`;
      qrDiv.appendChild(qr);
    }
  } catch (e) {
    console.error("Failed to fetch now playing:", e);
  }
}

setInterval(fetchNowPlaying, 60000);
fetchNowPlaying();
