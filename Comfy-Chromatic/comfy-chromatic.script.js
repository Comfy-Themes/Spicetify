(function Comfy() {
    const { Player, Menu, LocalStorage, Platform } = Spicetify
	const mainChild = document.createElement("div")
    const preloadChild = document.createElement("div")
    const main = document.querySelector('.Root__main-view')
    const LyricsBackground = document.querySelector('.lyrics-lyricsContainer-LyricsBackground')
	const activityquery = document.querySelector("aside.main-buddyFeed-buddyFeedRoot")
    const topbar = document.querySelector("header.main-topBar-container")

    if (!(Player && Menu && LocalStorage && Platform && main && topbar)) {
        setTimeout(Comfy, 1000)
        return
    }

	// Function that checks [if activityquery.position == absolute (Hover Panels Enabled)] or [activityquery.position == default].
	// Once checked it will make the changes to topbar as needed.
	function ComputedStyleCondition(topbar, activityquery) {
		if (!activityquery) {
            topbar.style.paddingInlineEnd = "32px"
        }
        else if (getComputedStyle(activityquery).position == "absolute") {
			topbar.style.paddingInlineEnd = "162px"
		}
		else {
			topbar.style.paddingInlineEnd = "32px"
		}
	}

    // Setting of topbar
	ComputedStyleCondition(topbar, activityquery) // Startup Initialization

		// Hover Events - Adds lag might need a rework
		if (activityquery) {
            activityquery.addEventListener("mouseover", function( event ) {
		        ComputedStyleCondition(topbar, activityquery);
		    }, false);

		    activityquery.addEventListener("mouseout", function( event ) {
			    ComputedStyleCondition(topbar, activityquery);
		    }, false);
        }


    // Spotify launching on a playlist
    const channels = ['/playlist/', '/album/', '/collection/tracks', '/collection/episodes', '/episode/', '/lyrics-plus']
    main.appendChild(mainChild)
    mainChild.id = "mainImage"

    main.appendChild(preloadChild)
    preloadChild.id = "preloadImage"

    for (var i = 0; i < channels.length; i++) {
        if (Platform.History.location.pathname.startsWith(channels[i])) {
            preloadChild.style.content = "url(" + Player.data.track.metadata.image_xlarge_url + ")";
            setInterval(() => {
                mainChild.style.backgroundImage =
                "url(" + Player.data.track.metadata.image_xlarge_url + ")";
            }, 1000);
        }
    }

    // Waiting for a switch between channels
    Platform.History.listen(({ pathname }) => {

        // If the channel is a playlist
        for (var i = 0; i < channels.length; i++) {

            if (pathname.startsWith(channels[i])) {
                preloadChild.style.content = "url(" + Player.data.track.metadata.image_xlarge_url + ")";
                setInterval(() => {
                    mainChild.style.backgroundImage =
                    "url(" + Player.data.track.metadata.image_xlarge_url + ")";
                }, 1000);
                return
            }

            else { mainChild.style.backgroundImage = null}
        }
    })

    // Change the song image on song change
    Player.addEventListener("songchange", () => {
        for (var i = 0; i < channels.length; i++) {
            if (Platform.History.location.pathname.startsWith(channels[i])) {
                preloadChild.style.content = "url(" + Player.data.track.metadata.image_xlarge_url + ")";
                setInterval(() => {
                    mainChild.style.backgroundImage =
                    "url(" + Player.data.track.metadata.image_xlarge_url + ")";
                }, 1000);
            }
        }
    })
})()
