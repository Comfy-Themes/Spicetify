/* 
todo:
- more consistent coloring - sliders etc
- add warning message if using unsupported versions
- update image tippy sizes / fix tippy height
- add more main-type-mestoBold
- create color picker

torefactor:
- simplify props - Section -> cardLayout -> title, action, etc - basically just move everything up one level / have the components not always be cards
- once props are simplified convert all callback events to be "name - ...props"
- create a singular div for banner image and use cloning, then first-child second-child in css, no longer a need for mainImage secondaryImage, also rename frame to be more descriptive e.g comfyBanner or something
- use spicetify slider component
- fix subSection logic, manually defining the logic for all types of callbacks is dumb maybe make a pseudo element for each subcall
*/

(async function comfy() {
	// Block Until Mass Usage Deps Loaded
	if (!(Spicetify.React && Spicetify.ReactDOM && Spicetify.Config)) {
		setTimeout(comfy, 10);
		return;
	}
	console.debug("[Comfy-Event]: Global Dependencies loaded");

	// Add Global Functions
	window.Comfy = {
		Reset: () => {
			localStorage.removeItem("comfy:config");
			location.reload();
		},
		Config: () => {
			console.log(JSON.parse(localStorage.getItem("comfy:config") || "{}"));
		}
	};
	console.debug(`[Comfy-Event]: Global Functions Added`);

	// Initialize Config
	let config = JSON.parse(localStorage.getItem("comfy:config") || "{}");
	let configScheme = Spicetify.Config?.color_scheme || "Comfy";
	let preloadedScheme = false;
	let startup = true;
	let preloadContainer = document.createElement("div");
	console.debug(`[Comfy-Event]: Config Initialized`);

	// Preload Applied Colorscheme
	const colorScheme = getConfig("Color-Scheme");
	if (colorScheme) {
		preloadedScheme = true;
		updateScheme(colorScheme, "preloaded");
	}

	// Update Colorschemes
	fetch("https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/color.ini")
		.then(response => response.text())
		.then(iniContent => {
			setConfig("Color-Schemes", parseIni(iniContent), "Successfully updated color schemes");
			configScheme =
				(getConfig("Color-Schemes") && Object.keys(getConfig("Color-Schemes")).find(scheme => scheme.toLowerCase() === configScheme.toLowerCase())) ||
				configScheme;
			updateScheme(getConfig("Color-Scheme"), "updated");
		})
		.catch(error => {
			console.warn("[Comfy-Warning]: Failed to update color schemes:", error);
		});

	// Banner Image(s)
	const channels = [
		/^\/playlist\//,
		/^\/station\/playlist\//,
		/^\/artist\/(?!artists\b)\w+$/,
		/^\/album\//,
		/^\/collection\/tracks$/,
		/^\/collection\/your-episodes$/,
		/^\/collection\/local-files$/,
		/^\/show\//,
		/^\/episode\//,
		/^\/lyrics-plus$/,
		/^\/user\/(?!users\b)\w+$/,
		/^\/genre\//
	];

	const frame = document.createElement("div");
	const mainImage = document.createElement("img");
	const secondaryImage = document.createElement("img");

	frame.className = "frame";
	mainImage.className = "mainImage";
	secondaryImage.className = "secondaryImage";
	frame.append(mainImage, secondaryImage);

	waitForDeps(
		".under-main-view",
		underMainView => {
			console.debug("[Comfy-Event]: Banner Frame Added");
			underMainView.appendChild(frame);
		},
		true
	);
	waitForDeps("Spicetify.Platform.History", () => Spicetify.Platform.History.listen(updateBanner));
	waitForDeps("Spicetify.Player", () => Spicetify.Player.addEventListener("songchange", updateBanner));
	updateBanner();

	// React components
	const Dialog = Spicetify.React.memo(props => {
		const [state, setState] = Spicetify.React.useState(true);
		const self = document.querySelector(".ReactModalPortal:last-of-type");

		Spicetify.React.useEffect(() => {
			if (state) {
				props.onOpen?.();
			}
		}, [state]);

		return Spicetify.ReactComponent.ConfirmDialog({
			...props,
			isOpen: state,
			onClose: () => {
				setState(false);
				props.onClose();
				self.remove();
			},
			onConfirm: () => {
				setState(false);
				props.onConfirm();
				self.remove();
			}
		});
	});

	const Section = ({ name, children, condition = true }) => {
		if (condition === false) return null;
		return Spicetify.React.createElement(
			Spicetify.React.Fragment,
			null,
			Spicetify.React.createElement(
				"div",
				{ className: "setting-section", id: name },
				Spicetify.React.createElement("h2", { className: "setting-header" }, name),
				children.map(child =>
					Spicetify.React.createElement(child.type, {
						...child,
						tippy: Spicetify.React.createElement(Tippy, { label: child.tippy })
					})
				)
			)
		);
	};

	const Row = ({ name, items }) => {
		return Spicetify.React.createElement(
			Spicetify.React.Fragment,
			null,
			Spicetify.React.createElement(
				"div",
				{ className: name },
				items.map(item =>
					Spicetify.React.createElement(item.type, {
						...item,
						tippy: Spicetify.React.createElement(Tippy, { label: item.tippy })
					})
				)
			)
		);
	};

	const Button = ({ name, title, condition = true, callback }) => {
		const [state, setState] = Spicetify.React.useState(title);

		if (condition === false) return;

		return Spicetify.React.createElement(
			"button",
			{
				className: "main-buttons-button main-button-secondary",
				id: name,
				onClick: () => {
					callback(state, setState);
				}
			},
			state
		);
	};

	const CardLayout = Spicetify.React.memo(({ title, desc, tippy, action, onClick }) => {
		return Spicetify.React.createElement(
			"div",
			{ className: "setting-card" },
			Spicetify.React.createElement(
				"div",
				{ className: "setting-container", onClick: onClick },
				Spicetify.React.createElement(
					"div",
					{ className: "setting-item" },
					Spicetify.React.createElement("label", { className: "setting-title" }, title, tippy),
					Spicetify.React.createElement("div", { className: "setting-action" }, action)
				),
				Spicetify.React.createElement("div", { className: "setting-description" }, desc),
				desc && Spicetify.React.createElement("div", { className: "setting-description-spacer" })
			)
		);
	});

	const SubSection = Spicetify.React.memo(({ name, condition = true, items, collapseItems: initialCollapseItems = false, callback, ...props }) => {
		const [state, setState] = Spicetify.React.useState(getConfig(name) ?? true);
		const [collapseItems, setCollapseItems] = Spicetify.React.useState(getConfig(`${name}-Collapsed`) ?? initialCollapseItems);

		if (condition === false) return null;

		return Spicetify.React.createElement(
			Spicetify.React.Fragment,
			null,
			Spicetify.React.createElement(
				"div",
				{ className: "setting-subSection", id: state ? (collapseItems ? "collapsed" : "enabled") : "disabled" },
				Spicetify.React.createElement(Slider, {
					name,
					callback: value => {
						callback?.(value);
						setState(value);

						items.forEach(item => {
							const both = () => (item.type === Input ? "" : item.defaultVal);
							const state = getConfig(item.name) ?? both();

							setConfig(item.name, state);
							if (item.type === Slider) {
								if (state || !value)
									waitForDeps(
										"main",
										main => {
											console.debug(`[Comfy-subCallback]: ${item.name} =`, state);
											main.classList.toggle(item.name, value ? state : false);
											item.callback?.(state);
										},
										true,
										"getElementById"
									);
							} else if (value && state !== both()) {
								console.debug(`[Comfy-subCallback]: ${item.name}`, state);
								item.callback?.(state, item.name);
							}
						});
					},
					onClick: () => {
						if (state) {
							setConfig(`${name}-Collapsed`, !collapseItems, null, true);
							setCollapseItems(!collapseItems);
						}
					},
					...props
				}),
				state &&
					!collapseItems &&
					!startup &&
					items.map(item =>
						Spicetify.React.createElement(item.type, {
							...item,
							tippy: Spicetify.React.createElement(Tippy, { label: item.tippy })
						})
					)
			)
		);
	});

	const Tippy = ({ label }) => {
		if (!label) return null;
		return Spicetify.React.createElement(
			Spicetify.ReactComponent.TooltipWrapper,
			{
				label,
				showDelay: 0,
				placement: "left",
				trigger: "mouseenter"
			},
			Spicetify.React.createElement(
				"div",
				{ className: "x-settings-tooltip" },
				Spicetify.React.createElement(
					"div",
					{
						className: "x-settings-tooltipIconWrapper"
					},
					Spicetify.React.createElement(
						"svg",
						{
							role: "img",
							height: "16",
							width: "16",
							tabindex: "0",
							className: "Svg-sc-ytk21e-0 Svg-img-icon x-settings-tooltipIcon",
							viewBox: "0 0 16 16"
						},
						Spicetify.React.createElement("path", {
							d: "M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"
						}),
						Spicetify.React.createElement("path", {
							d: "M7.25 12.026v-1.5h1.5v1.5h-1.5zm.884-7.096A1.125 1.125 0 0 0 7.06 6.39l-1.431.448a2.625 2.625 0 1 1 5.13-.784c0 .54-.156 1.015-.503 1.488-.3.408-.7.652-.973.818l-.112.068c-.185.116-.26.203-.302.283-.046.087-.097.245-.097.57h-1.5c0-.47.072-.898.274-1.277.206-.385.507-.645.827-.846l.147-.092c.285-.177.413-.257.526-.41.169-.23.213-.397.213-.602 0-.622-.503-1.125-1.125-1.125z"
						})
					)
				)
			)
		);
	};

	const Slider = Spicetify.React.memo(({ name, title, desc, tippy, defaultVal, condition = true, callback, onClick }) => {
		const [state, setState] = Spicetify.React.useState(getConfig(name) ?? defaultVal);
		const isFirstRender = Spicetify.React.useRef(true);

		Spicetify.React.useEffect(() => {
			if (isFirstRender.current) {
				isFirstRender.current = false;
				if (!startup) return;
			}

			setConfig(name, state);
			if (state || !startup) {
				waitForDeps(
					"main",
					main => {
						console.debug(`[Comfy-Callback]: ${name} =`, state);
						main.classList.toggle(name, state);
						callback?.(state);
					},
					true,
					"getElementById"
				);
			}
		}, [state]);

		if (condition === false) return null;

		return Spicetify.React.createElement(CardLayout, {
			title,
			desc,
			tippy,
			action: Spicetify.React.createElement(
				"label",
				{ className: "x-toggle-wrapper" },
				Spicetify.React.createElement("input", {
					className: "x-toggle-input",
					type: "checkbox",
					defaultChecked: state,
					onClick: () => setState(!state)
				}),
				Spicetify.React.createElement(
					"span",
					{ className: "x-toggle-indicatorWrapper" },
					Spicetify.React.createElement("span", { className: "x-toggle-indicator" })
				)
			),
			onClick
		});
	});

	const Input = Spicetify.React.memo(({ inputType, name, title, desc, min, max, step, tippy, defaultVal, condition = true, callback }) => {
		const [value, setValue] = Spicetify.React.useState(getConfig(name) ?? "");
		const [defaultState, setDefaultState] = Spicetify.React.useState(defaultVal);
		const isFirstRender = Spicetify.React.useRef(true);

		const textFieldRef = Spicetify.React.useRef(null);
		Spicetify.React.useEffect(() => {
			if (textFieldRef.current) {
				textFieldRef.current.addEventListener("wheel", e => {
					if (document.focusedElement === textFieldRef.current) {
						e.preventDefault();
					}
				});
			}
		}, []);

		Spicetify.React.useEffect(() => {
			if (isPromise(defaultVal)) defaultVal.then(val => setDefaultState(val));
		}, [defaultVal]);

		Spicetify.React.useEffect(() => {
			if (isFirstRender.current) {
				isFirstRender.current = false;
				if (!startup) return;
			}

			setConfig(name, value);
			if (value !== "" || !startup) {
				console.debug(`[Comfy-Callback]: ${name} =`, value);
				callback?.(value, name);
			}
		}, [value]);

		if (condition === false) return null;

		return Spicetify.React.createElement(CardLayout, {
			title,
			desc,
			tippy,
			action: Spicetify.React.createElement("input", {
				type: inputType,
				className: "input",
				ref: textFieldRef,
				value,
				min,
				max,
				step,
				placeholder: defaultState,
				onChange: e => setValue(e.target.value)
			})
		});
	});

	const Dropdown = Spicetify.React.memo(({ name, title, desc, options, defaultVal, condition = true, tippy, callback }) => {
		if (!condition) return null;
		if (!defaultVal) defaultVal = "Select an option";
		if (typeof options === "function") options = options();

		const [selectedValue, setSelectedValue] = Spicetify.React.useState(getConfig(name) ?? defaultVal);
		const [buttonEnabled, setButtonEnabled] = Spicetify.React.useState(selectedValue !== defaultVal);
		const [menuOpen, setMenuOpen] = Spicetify.React.useState(false);
		const isFirstRender = Spicetify.React.useRef(true);

		Spicetify.React.useEffect(() => {
			if (isFirstRender.current) {
				isFirstRender.current = false;
				if (!startup) {
					const parent = document.querySelector('[aria-label="Comfy Settings"]');
					const current = document.getElementById(name);
					parent.addEventListener("click", event => {
						if (event.target.closest(".dropdown-wrapper") !== current) {
							setMenuOpen(false);
						}
					});
					return;
				}
			}

			setConfig(name, selectedValue);
			if ((condition && selectedValue !== defaultVal) || !startup) {
				console.debug(`[Comfy-Callback]: ${name} =`, selectedValue);
				callback?.(name, selectedValue, options, defaultVal);
				setButtonEnabled(selectedValue !== defaultVal);
			}
		}, [selectedValue]);

		return Spicetify.React.createElement(CardLayout, {
			title,
			desc,
			tippy,
			action: [
				buttonEnabled &&
					Spicetify.React.createElement(
						"button",
						{
							className: `switch`,
							onClick: event => {
								event.stopPropagation(); // Prevent event from propagating up
								setSelectedValue(defaultVal);
							}
						},
						Spicetify.React.createElement("svg", {
							height: "16",
							width: "16",
							viewBox: "0 0 16 16",
							fill: "currentColor",
							dangerouslySetInnerHTML: {
								__html: Spicetify.SVGIcons.x
							}
						})
					),
				Spicetify.React.createElement(
					"div",
					{ className: `dropdown-wrapper main-type-mestoBold ${menuOpen ? "menu-open" : ""}`, id: name },
					Spicetify.React.createElement(
						"div",
						{ className: "dropdown-button", onClick: () => setMenuOpen(!menuOpen) },
						Spicetify.React.createElement("div", { className: "dropdown-selection" }, selectedValue),
						Spicetify.React.createElement(
							"div",
							{ className: "dropdown-arrow-wrapper" },
							Spicetify.React.createElement("span", { className: "dropdown-arrow" })
						)
					),
					menuOpen &&
						Spicetify.React.createElement(
							"div",
							{ className: "dropdown-menu" },
							options.map(option =>
								Spicetify.React.createElement(
									"div",
									{
										key: option,
										className: `dropdown-option${selectedValue === option ? " selected" : ""}`,
										role: "option",
										"aria-selected": selectedValue === option,
										onClick: event => {
											event.stopPropagation(); // Prevent event from propagating up
											setSelectedValue(option);
											setMenuOpen(false);
										}
									},
									option
								)
							)
						)
				)
			]
		});
	});

	const Content = () => {
		return Spicetify.React.createElement(
			"div",
			{ className: "comfy-settings" },
			Spicetify.React.createElement(Section, { name: "Colorscheme" }, [
				{
					type: Dropdown,
					name: "Color-Scheme",
					title: `Color Scheme`,
					desc: "For faster loadtimes use cli to change color schemes",
					options: () => {
						const schemes = Object.keys(getConfig("Color-Schemes"));
						const decapSchemes = schemes.map(function (x) {
							return x.toLowerCase();
						});

						if (!decapSchemes.includes(configScheme.toLowerCase())) {
							schemes.unshift(configScheme);
						}

						return schemes;
					},
					defaultVal: (configScheme =
						(getConfig("Color-Schemes") &&
							Object.keys(getConfig("Color-Schemes")).find(scheme => scheme.toLowerCase() === configScheme.toLowerCase())) ||
						configScheme),
					condition: getConfig("Color-Schemes") && !preloadedScheme && !document.querySelector("body > style.marketplaceCSS.marketplaceScheme"),
					callback: (name, value) => {
						updateScheme(value);
					}
				},
				{
					type: Dropdown,
					name: `Scheme-Features`,
					title: `Additional Features`,
					description: "Extra tweaks to complete specific color schemes",
					options: ["nord", "mono", "kitty"],
					callback: (name, value, options, defaultVal) => {
						waitForDeps(
							"main",
							main => {
								main.classList.remove(...options.map(option => `Comfy-${option}-Snippet`));
								if (value !== defaultVal) main.classList.add(`Comfy-${value}-Snippet`);
							},
							true,
							"getElementById"
						);
					}
				},
				{
					type: Dropdown,
					name: "Flatten-Colors",
					title: "Flatten Theme Colors",
					desc: "Sets main color to the same color as sidebar",
					defaultVal: "off",
					options: ["off", "normal", "reverse"],
					callback: (name, value, options, defaultVal) => {
						waitForDeps(
							"main",
							main => {
								main.classList.remove(...options.map(option => `${name}-${option}`));
								if (value !== defaultVal) main.classList.add(`${name}-${value}`);
							},
							true,
							"getElementById"
						);
					}
				},
				{
					type: Dropdown,
					name: "Dark-Modals",
					title: "Modal Colors",
					desc: "Forces modals to be dark/light, useful for light mode schemes",
					defaultVal: "light",
					options: ["light", "dark"],
					callback: (name, value, options, defaultVal) => {
						waitForDeps(
							"main",
							main => {
								const customXpui = document.getElementById("/xpui.css");

								if (value === defaultVal && customXpui) {
									customXpui.remove();
									main.classList.remove(`Comfy-${name}-Snippet`);
								}

								if (value !== defaultVal && !customXpui) {
									fetch("xpui.css")
										.then(res => res.text())
										.then(text => {
											const result = text.replace(
												/(\.encore-dark-theme,\.encore-dark-theme)/g,
												".GenericModal__overlay .encore-light-theme,dialog .encore-light-theme,$1"
											);

											const newStyle = document.createElement("style");
											newStyle.textContent = result;
											newStyle.id = "/xpui.css";
											document.head.appendChild(newStyle);
											main.classList.add(`Comfy-${name}-Snippet`);
										})
										.catch(e => console.error(`[Comfy-Error]: ${name}`, e));
								}
							},
							true,
							"getElementById"
						);
					}
				}
			]),
			Spicetify.React.createElement(Section, { name: "Interface" }, [
				{
					type: Input,
					inputType: "text",
					name: "App-Title",
					title: "Application Title",
					defaultVal: Spicetify.AppTitle?.get(),
					desc: "Change the title of the application, leave blank to reset",
					callback: value => {
						waitForDeps("Spicetify.Platform.UserAPI", async () => {
							const productState = Spicetify.Platform.UserAPI._product_state || Spicetify.Platform.UserAPI._product_state_service;
							await productState.delOverridesValues({ keys: ["name"] });
							if (value) await productState.putOverridesValues({ pairs: { name: value } });
						});
					}
				},
				{
					type: Input,
					inputType: "number",
					name: "App-Titlebar-Height",
					title: "Titlebar Height",
					defaultVal: "40",
					condition: Spicetify.Config.version >= "2.33.2",
					callback: value => {
						waitForDeps(["Spicetify.CosmosAsync"], async () => {
							await Spicetify.CosmosAsync.post("sp://messages/v1/container/control", {
								type: "update_titlebar",
								height: `${(value === "0" ? "1" : value )|| "40"}px`
							});

							document.documentElement.style.setProperty("--comfy-topbar-height", value ? value + "px" : "");
						});
					}
				},
				{
					type: Input,
					inputType: "number",
					name: "Button-Radius",
					title: "Button Radius",
					defaultVal: "8",
					tippy: Spicetify.React.createElement(
						Spicetify.React.Fragment,
						null,
						Spicetify.React.createElement("h4", null, "Change how circular buttons are:"),
						Spicetify.React.createElement("li", null, "Comfy default: 8px"),
						Spicetify.React.createElement("li", null, "Spotify default: 50px")
					),
					callback: value => document.documentElement.style.setProperty("--button-radius", value ? value + "px" : "")
				},
				{
					type: SubSection,
					name: "Topbar-Inside-Titlebar-Snippet",
					title: "Move Topbar Inside Titlebar",
					defaultVal: false,
					callback: value => {
						waitForDeps(
							[".Root__top-container", ".main-topBar-container"],
							elements => {
								const [container, topbar] = elements;
								const entryPoint = document.querySelector(".Root__top-bar") ?? document.querySelector(".Root__main-view");
								const grid = value ? container : entryPoint;

								grid.insertBefore(topbar, grid.firstChild);
							},
							true
						);
					},
					items: [
						{
							type: Slider,
							name: "Collapse-Topbar-Snippet",
							title: "Collapse List Items",
							defaultVal: true
						}
					],
					collapseItems: true
				},
				{
					type: SubSection,
					name: "Custom-Font",
					title: "Custom Font",
					defaultVal: false,
					callback: value => {
						if (!value) {
							document.documentElement.style.setProperty("--font-family", "");
							document.documentElement.style.setProperty("--encore-title-font-stack", "");
							document.documentElement.style.setProperty("--encore-body-font-stack", "");
						}
					},
					tippy: Spicetify.React.createElement(
						Spicetify.React.Fragment,
						null,
						Spicetify.React.createElement(
							"div",
							{
								style: {
									// tippy doesnt like loading images
									height: "300px"
								}
							},
							Spicetify.React.createElement("img", {
								src: "https://media.discordapp.net/attachments/811648374687399988/1139576978924642425/image.png?width=1069&height=520",
								alt: "preview",
								style: {
									width: "100%"
								}
							}),
							Spicetify.React.createElement(
								"h4",
								{ style: { fontWeight: "normal" } },
								"If you have the font installed on your PC, then just enter the fonts name"
							),
							Spicetify.React.createElement(
								"h4",
								{ style: { fontWeight: "normal" } },
								"Otherwise, you can use a Google Font by entering the URL of the font"
							)
						)
					),
					items: [
						{
							type: Input,
							inputType: "text",
							name: "Font",
							title: "Font",
							defaultVal: "Placeholder",
							callback: value => {
								let fontFamily = value;
								if (isValidUrl(value)) {
									fontFamily = decodeURIComponent(value.match(/family=([^&:]+)/)?.[1]?.replace(/\+/g, " "));
									if (!document.getElementById("custom-font")) {
										const link = document.createElement("link");
										link.rel = "preload stylesheet";
										link.as = "style";
										link.href = value;
										link.id = "custom-font";
										document.head.appendChild(link);
									} else {
										document.getElementById("custom-font").href = value;
									}
								}
								document.documentElement.style.setProperty("--font-family", fontFamily);
								document.documentElement.style.setProperty("--encore-title-font-stack", fontFamily);
								document.documentElement.style.setProperty("--encore-body-font-stack", fontFamily);
							}
						}
					]
				},
				{
					type: SubSection,
					name: "Home-Header-Snippet",
					title: "Colorful Home Header",
					defaultVal: true,
					callback: value => {
						if (!value) {
							waitForDeps(
								"main",
								main => {
									main.classList.remove("Home-Header-Snippet");
									document.documentElement.style.setProperty("--home-header-color", "");
								},
								true,
								"getElementById"
							);
						}
					},
					items: [
						{
							type: Input,
							inputType: "text",
							name: "Home-Header-Color",
							title: "Custom Color",
							defaultVal: "none",
							tippy: Spicetify.React.createElement(
								Spicetify.React.Fragment,
								null,
								Spicetify.React.createElement("li", null, "name (red, blue, (--var), etc)"),
								Spicetify.React.createElement("li", null, "hex (#000000)"),
								Spicetify.React.createElement("li", null, "rgb (0, 0, 0)"),
								Spicetify.React.createElement("li", null, "rgba (0, 0, 0, 1)")
							),
							callback: (value, name) => {
								waitForDeps(
									"main",
									main => {
										main.classList.remove(name);
										document.documentElement.style.setProperty("--home-header-color", "");
										if (value !== "") {
											document.documentElement.style.setProperty("--home-header-color", value);
											main.classList.add(name);
										}
									},
									true,
									"getElementById"
								);
							}
						}
					],
					collapseItems: true
				},
				{
					type: Slider,
					name: "Horizontal-pageLinks-Snippet",
					title: "Horizontal Page Links",
					defaultVal: false
				}
			]),
			Spicetify.React.createElement(Section, { name: "Tracklist" }, [
				{
					type: Slider,
					name: "Remove-Tracklist-Index",
					title: "Remove Tracklist Index",
					desc: "Hides the numbers / count next to songs",
					defaultVal: true
				},
				{
					type: Slider,
					name: "Remove-Column-Bar-Snippet",
					title: "Remove Column Bar",
					desc: "Hides the column bar above tracklist",
					defaultVal: true,
					tippy: Spicetify.React.createElement(
						Spicetify.React.Fragment,
						null,
						Spicetify.React.createElement(
							"div",
							{
								style: {
									// tippy doesnt like loading images
									height: "120px"
								}
							},
							Spicetify.React.createElement("img", {
								src: "https://github.com/Comfy-Themes/Spicetify/blob/main/images/settings/column-bar.png?raw=true",
								alt: "preview",
								style: {
									width: "100%"
								}
							})
						)
					)
				},
				{
					type: Slider,
					name: "Remove-Tracklist-Gradient-Noise",
					title: "Remove Gradient Noise",
					defaultVal: false,
					desc: "Remove the noise from the gradient",
					callback: value => {
						document.documentElement.style.setProperty("--tracklist-gradient-noise", value ? "none" : "");
					}
				},
				{
					type: Input,
					inputType: "number",
					name: "Tracklist-Gradient-Height",
					title: "Gradient Height",
					defaultVal: "232",
					desc: "Change the height of the gradient (the transparent part of the tracklist)",
					tippy: Spicetify.React.createElement(
						Spicetify.React.Fragment,
						null,
						Spicetify.React.createElement("h4", null, "Set to 0 to disable the gradient!")
					),
					callback: value => document.documentElement.style.setProperty("--tracklist-gradient-height", value ? value + "px" : "")
				},
				{
					type: Input,
					inputType: "number",
					name: "Tracklist-Gradient-Opacity",
					title: "Gradient Opacity",
					defaultVal: "0.6",
					desc: "Change the opacity of the gradient (0 -> 1)",
					tippy: Spicetify.React.createElement(
						Spicetify.React.Fragment,
						null,
						Spicetify.React.createElement("h4", null, "Set to 0 for no gradient color!")
					),
					callback: value => document.documentElement.style.setProperty("--tracklist-gradient-opacity", value || "")
				}
			]),
			Spicetify.React.createElement(Section, { name: "Playbar" }, [
				{
					type: Slider,
					name: "Custom-Playbar-Snippet",
					title: "Custom Playbar Layout",
					defaultVal: true,
					desc: "Comfy's out of box playbar design"
				},
				{
					type: Slider,
					name: "Smooth-Progress-Bar-Snippet",
					title: "Smooth Progress Bar",
					desc: "Makes the progress bar ease its movement giving the appearance of a smoother transition",
					defaultVal: true
				},
				{
					type: Slider,
					name: "Hoverable-Timers-Snippet",
					title: "Hoverable Playback Timers",
					defaultVal: false
				},
				{
					type: Slider,
					name: "Remove-Connect-Bar-Snippet",
					title: "Remove Connect Bar",
					defaultVal: false
				},
				{
					type: Slider,
					name: "Remove-Progress-Bar-Gradient-Snippet",
					title: "Remove Progress Bar Gradient",
					defaultVal: false
				},
				{
					type: Slider,
					name: "Remove-Lyrics-Button-Snippet",
					title: "Remove Lyrics Button",
					defaultVal: false
				}
			]),
			Spicetify.React.createElement(Section, { name: "Cover Art" }, [
				{
					type: SubSection,
					name: "Custom-Cover-Art-Dimensions",
					title: "Custom Dimensions",
					defaultVal: false,
					callback: value => {
						if (!value) {
							document.documentElement.style.setProperty("--cover-art-width", "");
							document.documentElement.style.setProperty("--cover-art-height", "");
							document.documentElement.style.setProperty("--cover-art-radius", "");
							document.documentElement.style.setProperty("--cover-art-bottom", "");
						}
					},
					tippy: Spicetify.React.createElement(
						Spicetify.React.Fragment,
						null,
						Spicetify.React.createElement("h4", null, "Change the size of the cover art:"),
						Spicetify.React.createElement("li", null, "Comfy default: (84px, 84px, 8px, 20px)"),
						Spicetify.React.createElement("li", null, "Spotify default: (56px, 56px, 4px, 0px)"),
						Spicetify.React.createElement("li", null, "Oblong: (115px, 84px, 15px, 20px)")
					),
					items: [
						{
							type: Input,
							inputType: "number",
							name: "Cover-Art-Width",
							title: "Width",
							defaultVal: "84px",
							callback: value => document.documentElement.style.setProperty("--cover-art-width", value ? value + "px" : "")
						},
						{
							type: Input,
							inputType: "number",
							name: "Cover-Art-Height",
							title: "Height",
							defaultVal: "84px",
							callback: value => document.documentElement.style.setProperty("--cover-art-height", value ? value + "px" : "")
						},
						{
							type: Input,
							inputType: "number",
							name: "Cover-Art-Radius",
							title: "Border Radius",
							defaultVal: "8px",
							callback: value => document.documentElement.style.setProperty("--cover-art-radius", value ? value + "px" : "")
						},
						{
							type: Input,
							inputType: "number",
							name: "Cover-Art-Bottom",
							title: "Bottom Margin",
							defaultVal: "20px",
							tippy: Spicetify.React.createElement(
								Spicetify.React.Fragment,
								null,
								Spicetify.React.createElement("h4", null, "Change the distance between the cover art and the bottom of the playbar:"),
								Spicetify.React.createElement("li", null, "Comfy default: 20px"),
								Spicetify.React.createElement("li", null, "Spotify default: 0px")
							),
							callback: value => document.documentElement.style.setProperty("--cover-art-bottom", value ? value + "px" : "")
						}
					]
				}
			]),
			Spicetify.React.createElement(Section, { name: "Banner Image" }, [
				{
					type: Slider,
					name: "Banner-Enabled",
					title: "Banner Image",
					defaultVal: true,
					desc: "Show current playing song / custom banner images instead of gradients (all settings in this category will be ignored if disabled)"
				},
				{
					type: Input,
					inputType: "number",
					name: "Image-Blur",
					title: "Image Blur",
					defaultVal: "4",
					min: "0",
					tippy: Spicetify.React.createElement(
						Spicetify.React.Fragment,
						null,
						Spicetify.React.createElement("h4", null, "Amount of banner blur in pixels:"),
						Spicetify.React.createElement("li", null, "Comfy default: 4px")
					),
					callback: value => document.documentElement.style.setProperty("--image-blur", value ? value + "px" : "")
				},
				{
					type: SubSection,
					name: "Apple-Music-Gradient-Snippet",
					title: "Apple Music Gradient",
					defaultVal: false,
					callback: value => {
						if (!value) {
							document.documentElement.style.setProperty("--gradient-background-image", "");
							document.documentElement.style.setProperty("--gradient-blend-mode", "");
							document.documentElement.style.setProperty("--gradient-speed", "");
							document.documentElement.style.setProperty("--gradient-width", "");
							document.documentElement.style.setProperty("--gradient-radius", "");
						}
					},
					tippy: Spicetify.React.createElement(
						Spicetify.React.Fragment,
						null,
						Spicetify.React.createElement(
							"div",
							{
								style: {
									// tippy doesnt like loading images
									height: "315px"
								}
							},
							Spicetify.React.createElement("img", {
								src: "https://github.com/Comfy-Themes/Spicetify/blob/main/images/settings/am-blur.gif?raw=true",
								alt: "preview",
								style: {
									width: "100%"
								}
							}),
							Spicetify.React.createElement("h4", null, "Blur (10x Value):"),
							Spicetify.React.createElement("li", null, "Recommended: 4px")
						)
					),
					items: [
						{
							type: Slider,
							name: "AM-Gradient-Include-Existing-Snippet",
							title: "Existing Images",
							defaultVal: false,
							desc: "Apply the gradient to existing images on the page (e.g. artist banners)",
							callback: updateBanner
						},
						{
							type: Input,
							inputType: "text",
							name: "Gradient-Noise",
							title: "Noise URL",
							defaultVal: "none",
							desc: "Overlays an image below the blur and over the art, can be used for noise",
							callback: value => document.documentElement.style.setProperty("--gradient-background-image", value ? `url('${value}')` : "")
						},
						{
							type: Input,
							inputType: "text",
							name: "Gradient-Blend",
							title: "Blend Mode",
							defaultVal: "luminosity",
							desc: "'difference' works well with noise",
							callback: value => document.documentElement.style.setProperty("--gradient-blend-mode", value || "")
						},
						{
							type: Input,
							inputType: "number",
							name: "Gradient-Speed",
							title: "Speed",
							defaultVal: "50",
							min: "0",
							tippy: Spicetify.React.createElement(
								Spicetify.React.Fragment,
								null,
								Spicetify.React.createElement("h4", null, "Seconds per full rotation (360°):"),
								Spicetify.React.createElement("li", null, "Comfy default: 50")
							),
							callback: value => document.documentElement.style.setProperty("--gradient-speed", value ? value + "s" : "")
						},
						{
							type: Input,
							inputType: "number",
							name: "Gradient-Size",
							title: "Size",
							defaultVal: "150",
							min: "0",
							tippy: Spicetify.React.createElement(
								Spicetify.React.Fragment,
								null,
								Spicetify.React.createElement("h4", null, "Width of circles in relation to viewport (in %):"),
								Spicetify.React.createElement("li", null, "Comfy default: 150")
							),
							callback: value => document.documentElement.style.setProperty("--gradient-width", value ? value + "%" : "")
						},
						{
							type: Input,
							inputType: "number",
							name: "Gradient-Radius",
							title: "Radius",
							desc: "Radius of circles (in px)",
							defaultVal: "500",
							min: "0",
							callback: value => document.documentElement.style.setProperty("--gradient-radius", value ? value + "px" : "")
						}
					],
					collapseItems: true
				},
				{
					type: SubSection,
					name: "Custom-Image",
					title: "Custom Image",
					defaultVal: false,
					callback: updateBanner,
					items: [
						{
							type: Input,
							inputType: "text",
							name: "Custom-Image-URL",
							title: "URL",
							defaultVal: "Paste URL here!",
							tippy: Spicetify.React.createElement(
								Spicetify.React.Fragment,
								null,
								Spicetify.React.createElement("h4", null, "Network Images:"),
								Spicetify.React.createElement("li", null, "Enter any raw image url into text box, e.g. 'https://example.com/image.png'"),
								Spicetify.React.createElement("h4", null, "Local Images:"),
								Spicetify.React.createElement("li", null, "Place desired image in 'spotify/Apps/xpui/images'"),
								Spicetify.React.createElement("li", null, "Enter 'images/image.png' into text box")
							),
							callback: updateBanner
						}
					]
				}
			]),
			Spicetify.React.createElement(Section, { name: "" }, [
				{
					type: Row,
					name: "setting-button-row",
					items: [
						{
							type: Button,
							name: "Import",
							title: "Import",
							callback: async (state, setState) => {
								const paste = await Spicetify.Platform.ClipboardAPI.paste();
								try {
									JSON.parse(paste);
									setState("Success!");

									new Promise(resolve => setTimeout(resolve, 500)).then(() => {
										localStorage.setItem("comfy:config", paste);
										location.reload();
									});
								} catch (e) {
									setState("Invalid Format!");
									new Promise(resolve => setTimeout(resolve, 2000)).then(() => {
										setState(state);
									});
								}
							}
						},
						{
							type: Button,
							name: "Export",
							title: "Export",
							callback: (state, setState) => {
								Spicetify.Platform.ClipboardAPI.copy(localStorage.getItem("comfy:config"));
								setState("Copied!");

								new Promise(resolve => setTimeout(resolve, 2000)).then(() => {
									setState(state);
								});
							}
						},
						{
							type: Button,
							name: "Reset",
							title: "Reset",
							callback: () => {
								const settings = document.querySelector(".GenericModal__overlay:has(.comfy-settings)");
								Spicetify.ReactDOM.render(
									Spicetify.React.createElement(
										Spicetify.ReactComponent.RemoteConfigProvider,
										{ configuration: Spicetify.Platform.RemoteConfiguration },
										Spicetify.React.createElement(Dialog, {
											titleText: "Are you sure?",
											descriptionText: "This will reset all settings to default!",
											cancelText: "Cancel",
											confirmText: "Reset",
											onOpen: () => {
												settings.style.zIndex = 0;
											},
											onClose: () => {
												settings.style.zIndex = 100;
											},
											onConfirm: () => {
												localStorage.removeItem("comfy:config");
												location.reload();
											}
										})
									),
									document.createElement("div")
								);
							}
						}
					]
				}
			])
		);
	};

	// Settings Button + Modal
	waitForDeps("Spicetify.Topbar.Button", () => {
		new Spicetify.Topbar.Button(
			"Comfy Settings",
			`<svg viewBox="0 0 262.394 262.394" style="width: 16px; height: 16px; fill: currentcolor"><path d="M245.63,103.39h-9.91c-2.486-9.371-6.197-18.242-10.955-26.432l7.015-7.015c6.546-6.546,6.546-17.159,0-23.705 l-15.621-15.621c-6.546-6.546-17.159-6.546-23.705,0l-7.015,7.015c-8.19-4.758-17.061-8.468-26.432-10.955v-9.914 C159.007,7.505,151.502,0,142.244,0h-22.091c-9.258,0-16.763,7.505-16.763,16.763v9.914c-9.37,2.486-18.242,6.197-26.431,10.954 l-7.016-7.015c-6.546-6.546-17.159-6.546-23.705,0.001L30.618,46.238c-6.546,6.546-6.546,17.159,0,23.705l7.014,7.014 c-4.758,8.19-8.469,17.062-10.955,26.433h-9.914c-9.257,0-16.762,7.505-16.762,16.763v22.09c0,9.258,7.505,16.763,16.762,16.763 h9.914c2.487,9.371,6.198,18.243,10.956,26.433l-7.015,7.015c-6.546,6.546-6.546,17.159,0,23.705l15.621,15.621 c6.546,6.546,17.159,6.546,23.705,0l7.016-7.016c8.189,4.758,17.061,8.469,26.431,10.955v9.913c0,9.258,7.505,16.763,16.763,16.763 h22.091c9.258,0,16.763-7.505,16.763-16.763v-9.913c9.371-2.487,18.242-6.198,26.432-10.956l7.016,7.017 c6.546,6.546,17.159,6.546,23.705,0l15.621-15.621c3.145-3.144,4.91-7.407,4.91-11.853s-1.766-8.709-4.91-11.853l-7.016-7.016 c4.758-8.189,8.468-17.062,10.955-26.432h9.91c9.258,0,16.763-7.505,16.763-16.763v-22.09 C262.393,110.895,254.888,103.39,245.63,103.39z M131.198,191.194c-33.083,0-59.998-26.915-59.998-59.997 c0-33.083,26.915-59.998,59.998-59.998s59.998,26.915,59.998,59.998C191.196,164.279,164.281,191.194,131.198,191.194z"/><path d="M131.198,101.199c-16.541,0-29.998,13.457-29.998,29.998c0,16.54,13.457,29.997,29.998,29.997s29.998-13.457,29.998-29.997 C161.196,114.656,147.739,101.199,131.198,101.199z"/></svg>`,
			() => {
				// reset startup preventions
				startup = false;
				preloadedScheme = false;

				// Trigger Modal
				Spicetify.PopupModal.display({
					title: "Comfy Settings",
					content: Spicetify.React.createElement(Content),
					isLarge: true
				});

				// Discord Text
				const header = document.querySelector(".main-trackCreditsModal-header");
				const container = document.createElement("div");
				const extraText = document.createElement("a");
				extraText.textContent = "Need support? Click here!";
				extraText.href = "https://discord.gg/rtBQX5D3bD";
				extraText.style.color = "var(--spice-notification)";

				container.appendChild(document.querySelector("h1.main-type-alto"));
				container.appendChild(extraText);
				header.prepend(container);

				// Scroll Position
				const section = document.querySelector(".main-trackCreditsModal-mainSection");
				const cache = sessionStorage.getItem("comfy-settings-scroll");
				const scrollVal = cache ? cache * (section.scrollHeight - section.clientHeight) : 0;

				section.scrollTo(null, scrollVal);
				section.addEventListener("scroll", () => {
					const scrollTop = section.scrollTop;
					const scrollHeight = section.scrollHeight - section.clientHeight;
					const scrollPercentage = scrollTop / scrollHeight;
					sessionStorage.setItem("comfy-settings-scroll", scrollPercentage);
				});
			},
			false,
			true
		);
	});

	// Preloading settings
	console.debug("[Comfy-Event]: Settings Preload Started");
	Spicetify.ReactDOM.render(Spicetify.React.createElement(Content), preloadContainer);
	Spicetify.ReactDOM.unmountComponentAtNode(preloadContainer);

	// Functions
	function getConfig(key) {
		return config[key] ?? null;
	}

	function setConfig(key, value, message, silent) {
		if (value !== getConfig(key)) {
			if (!silent) console.debug(`[Comfy-Config]: ${message ?? key + " ="}`, value);
			config[key] = value;
			localStorage.setItem("comfy:config", JSON.stringify(config));
		}
	}

	function isPromise(p) {
		if (typeof p === "object" && typeof p.then === "function") {
			return true;
		}
		return false;
	}

	function isValidUrl(urlString) {
		try {
			return Boolean(new URL(urlString));
		} catch (e) {
			return false;
		}
	}

	async function waitForDeps(dependencies, callback, element = false, elementType = "querySelector", timeout = 5000) {
		return new Promise(resolve => {
			let allDependenciesLoaded = false;
			let startTime = Date.now();

			async function checkElements() {
				const check = () =>
					Array.isArray(dependencies) ? dependencies.every(element => document[elementType](element)) : document[elementType](dependencies);
				if (check()) {
					callback?.(Array.isArray(dependencies) ? dependencies.map(d => document[elementType](d)) : document[elementType](dependencies));
					resolve();
				} else {
					const observer = new MutationObserver(() => {
						if (check()) {
							observer.disconnect();
							callback?.(Array.isArray(dependencies) ? dependencies.map(d => document[elementType](d)) : document[elementType](dependencies));
							resolve();
						}
					});
					observer.observe(document.documentElement, { childList: true, subtree: true });
				}
			}

			async function checkDependencies() {
				for (const dependency of Array.isArray(dependencies) ? dependencies : [dependencies]) {
					if (!eval(dependency)) {
						if (Date.now() - startTime < timeout) {
							setTimeout(checkDependencies, 10);
						} else {
							console.error(`[Comfy-Error]: Dependency Timeout -`, dependencies);
							resolve();
						}
						return;
					}
				}

				if (!allDependenciesLoaded) {
					allDependenciesLoaded = true;

					callback?.(Array.isArray(dependencies) ? dependencies.map(d => eval(d)) : eval(dependencies));

					resolve();
				}
			}

			element ? checkElements() : checkDependencies();
		});
	}

	async function updateBanner() {
		await waitForDeps(["Spicetify.Player.data", "Spicetify.Platform.History.location"]);

		const pathname = Spicetify.Platform.History.location.pathname;
		let source;

		if (getConfig("Custom-Image")) {
			source = getConfig("Custom-Image-URL")?.replace(/"/g, "");
		} else if (getConfig("AM-Gradient-Include-Existing-Snippet")) {
			const [isPlaylist, isArtist] = [Spicetify.URI.isPlaylistV1OrV2(pathname), Spicetify.URI.isArtist(pathname)];

			if (isPlaylist || isArtist) {
				const uri = `spotify:${isPlaylist ? "playlist" : "artist"}:${pathname.split("/").pop()}`;
				const metadata = isPlaylist
					? await Spicetify.Platform.PlaylistAPI.getMetadata(uri)
					: await Spicetify.GraphQL.Request(Spicetify.GraphQL.QueryDefinitions.queryArtistOverview, {
							uri: uri,
							includePrerelease: true,
							locale: null
					  });

				source = isPlaylist ? metadata.images[3]?.url : metadata.data.artistUnion.visuals.headerImage?.sources?.[0]?.url;
			}
		}

		source = source ?? Spicetify.Player.data.item?.metadata?.image_xlarge_url ?? Spicetify.Player.data.track.metadata.image_xlarge_url;

		frame.style.display = channels.some(channel => channel.test(pathname)) ? "" : "none";
		mainImage.src = secondaryImage.src = source;
		mainImage.style.display = source ? "" : "none";

		if (mainImage.src !== source) {
			console.debug(`[Comfy-Event]: Banner Source = ${(mainImage.src, source)}`);
		}
	}

	function updateScheme(scheme, message) {
		const marketplace = document.querySelector("body > style.marketplaceCSS.marketplaceScheme");
		const colorSchemes = getConfig("Color-Schemes");
		const existingScheme = document.querySelector("style.comfyScheme");

		existingScheme?.remove();
		if (colorSchemes[scheme] && !marketplace && scheme !== configScheme) {
			console.debug(`[Comfy-Event]: Scheme ${message ? message : "applied"} - ${scheme}`);
			scheme = colorSchemes[scheme];
		} else {
			return;
		}

		const schemeTag = document.createElement("style");
		schemeTag.classList.add("comfyScheme");
		let injectStr = ":root {";
		const themeIniKeys = Object.keys(scheme);
		themeIniKeys.forEach(key => {
			injectStr += `--spice-${key}: #${scheme[key]};`;
			injectStr += `--spice-rgb-${key}: ${hexToRGB(scheme[key])};`;
		});
		injectStr += "}";
		schemeTag.innerHTML = injectStr;
		document.body.appendChild(schemeTag);
	}

	function parseIni(data) {
		const regex = {
			section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
			param: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
			comment: /^\s*;.*$/
		};
		const value = {};
		let section = null;

		const lines = data.split(/[\r\n]+/);

		lines.forEach(function (line) {
			if (regex.comment.test(line)) {
				return;
			} else if (regex.param.test(line)) {
				if (line.includes("xrdb")) {
					delete value[section || ""];
					section = null;
					return;
				}

				const match = line.match(regex.param);

				if (match && match.length === 3) {
					if (section) {
						if (!value[section]) {
							value[section] = {};
						}
						value[section][match[1]] = match[2].split(";")[0].trim();
					}
				}
			} else if (regex.section.test(line)) {
				const match = line.match(regex.section);
				if (match) {
					value[match[1]] = {};
					section = match[1];
				}
			} else if (line.length === 0 && section) {
				section = null;
			}
		});

		return value;
	}

	function hexToRGB(hex) {
		if (hex.length === 3) {
			hex = hex
				.split("")
				.map(char => char + char)
				.join("");
		} else if (hex.length != 6) {
			throw "Only 3- or 6-digit hex colours are allowed";
		} else if (hex.match(/[^0-9a-f]/i)) {
			throw "Only hex colours are allowed";
		}

		const aRgbHex = hex.match(/.{1,2}/g);
		if (!aRgbHex || aRgbHex.length !== 3) {
			throw "Could not parse hex colour";
		}

		const aRgb = [parseInt(aRgbHex[0], 16), parseInt(aRgbHex[1], 16), parseInt(aRgbHex[2], 16)];

		return aRgb;
	}
})();
