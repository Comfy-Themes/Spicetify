(function Comfy() {
    const { Player, Menu, LocalStorage, Platform } = Spicetify
    const main = document.querySelector('.Root__main-view')
    const LyricsBackground = document.querySelector('.lyrics-lyricsContainer-LyricsBackground')
    const mainChild = document.createElement("div")

    if (!(Player && Menu && LocalStorage && Platform && main)) {
        setTimeout(Comfy, 1000)
        return
    }

    const channels = ['/playlist/', '/album/', '/collection/tracks', '/collection/episodes', '/episode/', '/lyrics-plus']
    main.appendChild(mainChild)
    mainChild.id = "mainImage"

    // Spotify launching on a playlist
    for (var i = 0; i < channels.length; i++) {
        if (Platform.History.location.pathname.startsWith(channels[i])) {
            mainChild.style.backgroundImage = "url(" + Player.data.track.metadata.image_xlarge_url + ")"
        }
    }

    // Waiting for a switch between channels
    Platform.History.listen(({ pathname }) => {

        // If the channel is a playlist
        for (var i = 0; i < channels.length; i++) {
            
            if (pathname.startsWith(channels[i])) {
                mainChild.style.backgroundImage = "url(" + Player.data.track.metadata.image_xlarge_url + ")"
                return
            }

            else { mainChild.style.backgroundImage = null}
        }
    })

    // Change the song image on song change
    Player.addEventListener("songchange", () => {
        for (var i = 0; i < channels.length; i++) {
            if (Platform.History.location.pathname.startsWith(channels[i])) {
                mainChild.style.backgroundImage = "url(" + Player.data.track.metadata.image_xlarge_url + ")"
            }
        }
    })
})()