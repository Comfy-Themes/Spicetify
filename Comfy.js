(function Comfy() {
    const { Player, Menu, LocalStorage, Platform } = Spicetify;
    const main = document.querySelector('.Root__main-view');
    const mainChild = document.createElement("div");

    if (!(Player && Menu && LocalStorage && Platform && main)) {
        setTimeout(Comfy, 1000);
        return;
    }

    main.appendChild(mainChild);
    mainChild.id = "mainImage";

    // On a playlist
    if (Platform.History.location.pathname.startsWith('/playlist/')) {
        console.log("Dans une playlist")

        mainChild.style.backgroundImage = "url(" + Player.data.track.metadata.image_xlarge_url + ")";
    }

    // Waiting for a switch between channels
    Platform.History.listen(({ pathname }) => {

        // If the channel is a playlist
        if (pathname.startsWith('/playlist/')) {
            console.log("Dans une playlist")
            mainChild.style.backgroundImage = "url(" + Player.data.track.metadata.image_xlarge_url + ")";
        }

        else {
            console.log("Pas dans une playlist" + pathname)
            mainChild.style.backgroundImage = null;
        }
    });

    // Change the song image on song change
    Player.addEventListener("songchange", () => {
        if (Platform.History.location.pathname.startsWith('/playlist/')) {
            mainChild.style.backgroundImage = "url(" + Player.data.track.metadata.image_xlarge_url + ")";
        }
    });
})();