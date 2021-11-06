(function Comfy() {
    const { Player, Menu, LocalStorage, Platform } = Spicetify;
    const main = document.querySelector('.Root__main-view');
    const mainChild = document.createElement("div");

    if (!(Player && Menu && LocalStorage && Platform && main)) {
        setTimeout(Comfy, 1000);
        return;
    }

    const channels = Platform.History.location.pathname.startsWith('/playlist/') || Platform.History.location.pathname.startsWith('/album/') || Platform.History.location.pathname.startsWith('/collection/tracks');
    main.appendChild(mainChild);
    mainChild.id = "mainImage";

    // On a playlist
    if (channels) {
        mainChild.style.backgroundImage = "url(" + Player.data.track.metadata.image_xlarge_url + ")";
    }

    // Waiting for a switch between channels
    Platform.History.listen(({ pathname }) => {

        // If the channel is a playlist
        if (pathname.startsWith('/playlist/') || pathname.startsWith('/album/') || pathname.startsWith('/collection/tracks')) {
            mainChild.style.backgroundImage = "url(" + Player.data.track.metadata.image_xlarge_url + ")";
        }

        else { mainChild.style.backgroundImage = null;}
    });

    // Change the song image on song change
    Player.addEventListener("songchange", () => {
        if (channels) {
            mainChild.style.backgroundImage = "url(" + Player.data.track.metadata.image_xlarge_url + ")";
        }
    });
})();