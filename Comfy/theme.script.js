/* 
tofix:
- negative values
- Reloading when filtered causes options to not be applied
- fonts titles and stuff css

todo:
- add warning message if using unsupported versions
- add custom colour schemes 
- add overrides for topbar background and padding

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

	// Window Zoom Variable
	// todo: improve this? seems unoptimal but spotify messes with window.outerWidth on minimize so this is required currently
	function updateZoomVariable() {
		let prevOuterWidth = window.outerWidth;
		let prevInnerWidth = window.innerWidth;
		let prevRatio = window.devicePixelRatio;
		let startup = true;

		function checkChanges() {
			const newOuterWidth = window.outerWidth;
			const newInnerWidth = window.innerWidth;
			const newRatio = window.devicePixelRatio;
			if (startup || ((prevOuterWidth <= 160 || prevRatio !== newRatio) && (prevOuterWidth !== newOuterWidth || prevInnerWidth !== newInnerWidth))) {
				const modified = newOuterWidth / newInnerWidth || 1;
				document.documentElement.style.setProperty("--zoom", modified);
				console.debug(`[Comfy-Event]: Zoom Updated: ${newOuterWidth} / ${newInnerWidth} = ${modified}`);

				prevOuterWidth = newOuterWidth;
				prevInnerWidth = newInnerWidth;
				prevRatio = newRatio;
			}

			requestAnimationFrame(checkChanges);
		}

		checkChanges();
		startup = false;
	}

	updateZoomVariable();

	// Layout Variables
	let panelWidth = document.documentElement.style.getPropertyValue("--panel-width");
	let sidebarWidth = document.documentElement.style.getPropertyValue("--left-sidebar-width");
	document.documentElement.style.setProperty("--comfy-panel-width", `${panelWidth}px`);
	document.documentElement.style.setProperty("--comfy-left-sidebar-width", `${sidebarWidth}px`);

	new MutationObserver(mutations => {
		const newPanelWidth = mutations[0].target.style.getPropertyValue("--panel-width");
		const newSidebarWidth = mutations[0].target.style.getPropertyValue("--left-sidebar-width");
		if (newPanelWidth !== panelWidth || newSidebarWidth !== sidebarWidth) {
			const trimmedPanelWidth = parseInt(newPanelWidth);
			const trimmedSidebarWidth = parseInt(newSidebarWidth);
			document.documentElement.style.setProperty("--comfy-panel-width", `${trimmedPanelWidth}px`);
			document.documentElement.style.setProperty("--comfy-left-sidebar-width", `${trimmedSidebarWidth}px`);
			panelWidth = newPanelWidth;
			sidebarWidth = newSidebarWidth;
		}
	}).observe(document.documentElement, { attributes: true, attributeFilter: ["style"] });

	waitForDeps("Spicetify.Platform.version", version => {
		if (version >= "1.2.46.462") {
			waitForDeps(
				":root .global-nav",
				root => {
					if (!root.classList.contains("global-nav-centered")) {
						root.classList.add("global-nav-centered");
					}
				},
				true
			);
		}
	});

	// Banner Image(s)
	let channels = {
		Lyrics: { regex: /^\/lyrics$/, enabled: getConfig("Lyrics") ?? false },
		Playlist: { regex: /^\/playlist\//, enabled: getConfig("Playlist") ?? true },
		Station: { regex: /^\/station\/playlist\//, enabled: getConfig("Station") ?? true },
		Artist: { regex: /^\/artist\/(?!artists\b)\w+$/, enabled: getConfig("Artist") ?? true },
		Album: { regex: /^\/album\//, enabled: getConfig("Album") ?? true },
		Collection: { regex: /^\/collection\/tracks$/, enabled: getConfig("Collection") ?? true },
		"Your-Episodes": { regex: /^\/collection\/your-episodes$/, enabled: getConfig("Your-Episodes") ?? true },
		"Local-Files": { regex: /^\/collection\/local-files$/, enabled: getConfig("Local-Files") ?? true },
		Show: { regex: /^\/show\//, enabled: getConfig("Show") ?? true },
		Episode: { regex: /^\/episode\//, enabled: getConfig("Episode") ?? true },
		"Lyrics-Plus": { regex: /^\/lyrics-plus$/, enabled: getConfig("Lyrics-Plus") ?? true },
		User: { regex: /^\/user\/(?!users\b)\w+$/, enabled: getConfig("User") ?? true },
		Genre: { regex: /^\/genre\//, enabled: getConfig("Genre") ?? true }
	};

	const frame = document.createElement("div");
	const banner = [document.createElement("div"), document.createElement("div")];

	frame.className = "comfy-banner-frame";
	banner.forEach(image => {
		image.className = "comfy-banner-image";
		frame.append(image);
	});

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
		const ConfirmDialog = Spicetify.ReactComponent.ConfirmDialog;
		const isForwardRef = typeof ConfirmDialog === "function";
		const commonProps = {
			...props,
			isOpen: state,
			onClose: () => {
				setState(false);
				props.onClose?.();
				self.remove();
			},
			onConfirm: () => {
				setState(false);
				props.onConfirm?.();
				self.remove();
			}
		};

		Spicetify.React.useEffect(() => {
			if (state) {
				props.onOpen?.();
			}
		}, [state]);

		return isForwardRef ? ConfirmDialog(commonProps) : Spicetify.React.createElement(ConfirmDialog, commonProps);
	});

	const Section = ({ name, children, condition = true, filter }) => {
		filter = !filter || name === filter.label || filter.index === 0;

		if (condition === false) return null;

		return (
			filter &&
			Spicetify.React.createElement(
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
				className: "main-buttons-button",
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
				Spicetify.React.createElement(Toggle, {
					name,
					callback: value => {
						callback?.(value);
						setState(value);

						items.forEach(item => {
							const both = () => (item.type === Input ? "" : item.defaultVal);
							const state = getConfig(item.name) ?? both();

							setConfig(item.name, state);
							if (item.type === Toggle) {
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

	const Toggle = Spicetify.React.memo(({ name, title, desc, tippy, defaultVal, condition = true, callback, onClick }) => {
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

	const Input = Spicetify.React.memo(
		({ inputType, includePicker, name, title, desc, min, max, step, tippy, defaultVal, condition = true, callback, callbackOverride }) => {
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
				if (value !== "" || !startup || callbackOverride) {
					console.debug(`[Comfy-Callback]: ${name} =`, value);
					callback?.(value, name, defaultVal);
				}
			}, [value, name]);

			if (condition === false) return null;

			return Spicetify.React.createElement(CardLayout, {
				title,
				desc,
				tippy,
				action: [
					Spicetify.React.createElement("input", {
						type: inputType,
						className: "input",
						ref: textFieldRef,
						value,
						min: inputType === "number" ? Number(min) : null,
						max: inputType === "number" ? Number(max) : null,
						step: inputType === "number" ? Number(step) : null,
						placeholder: defaultState,
						onChange: e => setValue(e.target.value)
					}),
					includePicker &&
						Spicetify.React.createElement("input", {
							type: "color",
							className: "input",
							value,
							placeholder: defaultState,
							onChange: e => setValue(e.target.value)
						})
				]
			});
		}
	);

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
					const parent = document.querySelector("generic-modal [aria-label='Comfy Settings']");
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

	const Carousel = ({ chips, checked, setChecked }) => {
		const containerRef = Spicetify.React.useRef(null);
		const [showLeftButton, setShowLeftButton] = Spicetify.React.useState(false);
		const [showRightButton, setShowRightButton] = Spicetify.React.useState(false);
		const [startX, setStartX] = Spicetify.React.useState(0);
		const [scrollLeft, setScrollLeft] = Spicetify.React.useState(0);
		const [mouseDown, setMouseDown] = Spicetify.React.useState(false);
		const isFirstRender = Spicetify.React.useRef(true);

		const section = document.querySelector(".main-trackCreditsModal-mainSection");

		// Handle resizing and scroll visibility
		const handleResize = Spicetify.React.useCallback(() => {
			if (containerRef.current) {
				const container = containerRef.current;
				setShowLeftButton(container.scrollLeft > 0);
				setShowRightButton(container.scrollLeft < container.scrollWidth - container.clientWidth - 2);
			}
		}, []);

		Spicetify.React.useEffect(() => {
			handleResize(); // Initial call
			window.addEventListener("resize", handleResize);
			return () => window.removeEventListener("resize", handleResize);
		}, [handleResize]);

		// Scroll to active item on first render
		Spicetify.React.useEffect(() => {
			if (containerRef.current && isFirstRender.current) {
				const activeItem = containerRef.current.querySelector(`.search-searchCategory-categoryGridItem:nth-child(${checked.index + 1})`);
				if (activeItem) {
					const container = containerRef.current;
					const containerScrollLeft = container.scrollLeft;
					const containerWidth = container.clientWidth;
					const itemOffsetLeft = activeItem.offsetLeft;
					const itemWidth = activeItem.clientWidth;

					if (itemOffsetLeft < containerScrollLeft + 32 || itemOffsetLeft + itemWidth > containerScrollLeft + containerWidth - 32) {
						const scrollPosition = itemOffsetLeft - (containerWidth / 2 - itemWidth / 2);
						container.scrollTo({ left: scrollPosition, behavior: "instant" });
					}

					isFirstRender.current = false;
				}
			}
		}, [checked.index]);

		// Handle dragging
		const handleMouseDown = event => {
			setStartX(event.pageX - containerRef.current.offsetLeft);
			setScrollLeft(containerRef.current.scrollLeft);
			setMouseDown(true);
			containerRef.current.style.cursor = "grabbing";
			containerRef.current.style.userSelect = "none";
			containerRef.current.style.scrollBehavior = "auto";
		};

		const handleMouseMove = event => {
			if (!mouseDown) return;
			event.preventDefault();
			const x = event.pageX - containerRef.current.offsetLeft;
			const walk = (x - startX) * 1; // Adjust scrolling speed
			containerRef.current.scrollLeft = scrollLeft - walk;
		};

		const handleMouseUpOrLeave = () => {
			if (mouseDown) {
				containerRef.current.style.cursor = "";
				containerRef.current.style.userSelect = "";
				containerRef.current.style.scrollBehavior = "";
				setMouseDown(false);
			}
		};

		Spicetify.React.useEffect(() => {
			document.addEventListener("mouseup", handleMouseUpOrLeave);
			document.addEventListener("mousemove", handleMouseMove);
			document.addEventListener("mouseleave", handleMouseUpOrLeave);

			return () => {
				document.removeEventListener("mouseup", handleMouseUpOrLeave);
				document.removeEventListener("mousemove", handleMouseMove);
				document.removeEventListener("mouseleave", handleMouseUpOrLeave);
			};
		}, [mouseDown]);

		// Handle arrow key navigation
		const handleKeyDown = Spicetify.React.useCallback(
			event => {
				let newIndex;
				let startingIndex = checked.index;

				if (document.activeElement.classList.contains("search-searchCategory-categoryGridItem")) {
					startingIndex = Array.from(containerRef.current.querySelectorAll(".search-searchCategory-categoryGridItem")).indexOf(
						document.activeElement
					);
				}

				if (event.key === "ArrowLeft") {
					event.preventDefault();
					newIndex = startingIndex - 1;
					if (newIndex < 0) newIndex = chips.length - 1;
				} else if (event.key === "ArrowRight") {
					event.preventDefault();
					newIndex = (startingIndex + 1) % chips.length;
				} else if (event.key === "Enter") {
					const focusedChip = document.activeElement;
					const index = Array.from(containerRef.current.querySelectorAll(".search-searchCategory-categoryGridItem")).indexOf(focusedChip);
					if (index !== -1) {
						setChecked({ index, label: chips[index].label });
						return;
					}
				}

				if (newIndex !== undefined) {
					const chipElement = containerRef.current.querySelector(`.search-searchCategory-categoryGridItem:nth-child(${newIndex + 1})`);
					if (chipElement) chipElement.focus();
				}
			},
			[checked.index, chips, setChecked]
		);

		// Handle button clicks
		const handleButtonClick = direction => {
			const multiplier = direction === "LEFT" ? -1 : 1;
			containerRef.current.scrollBy({
				left: multiplier * (containerRef.current.clientWidth / 2),
				behavior: "smooth"
			});
		};

		const clickCallback = (index, label) => {
			if (scrollLeft === containerRef.current.scrollLeft) setChecked({ index, label });

			if (section) section.scrollTo(null, 0);
		};

		return Spicetify.React.createElement(
			"div",
			{ className: "search-searchCategory-SearchCategory encore-dark-theme" },
			Spicetify.React.createElement(
				"div",
				{ className: "search-searchCategory-wrapper contentSpacing" },
				Spicetify.React.createElement(
					"div",
					{
						className: `search-searchCategory-contentArea
						${showLeftButton ? "search-searchCategory-showLeftButton" : ""}
						${showRightButton ? "search-searchCategory-showRightButton" : ""}
						${showRightButton && showLeftButton ? "search-searchCategory-showLeftButton search-searchCategory-showRightButton" : ""}`
							.trim()
							.replace(/\s+/g, " ")
					},
					Spicetify.React.createElement(
						"div",
						{
							ref: containerRef,
							className: "search-searchCategory-categoryGrid",
							onScroll: handleResize,
							onKeyDown: handleKeyDown,
							role: "list",
							tabIndex: 0,
							onMouseDown: handleMouseDown
						},
						Spicetify.React.createElement(
							"div",
							{ role: "presentation" },
							chips.map((chip, index) =>
								Spicetify.React.createElement(
									"a",
									{
										key: index,
										draggable: "false",
										className: "search-searchCategory-categoryGridItem",
										tabIndex: "-1",
										onClick: () => clickCallback(index, chip.label)
									},
									Spicetify.React.createElement(
										Spicetify.ReactComponent.Chip,
										{
											isUsingKeyboard: false,
											onClick: () => clickCallback(index, chip.label),
											selected: checked.index === index,
											selectedColorSet: "invertedLight",
											tabIndex: "-1"
										},
										chip.label
									)
								)
							)
						)
					),
					Spicetify.React.createElement(
						"div",
						{ className: "search-searchCategory-carousel" },
						Spicetify.React.createElement(
							"button",
							{
								className: `search-searchCategory-carouselButton search-searchCategory-carouselButtonLeft`,
								tabIndex: -1,
								onClick: () => handleButtonClick("LEFT"),
								inert: true
							},
							Spicetify.React.createElement("svg", {
								viewBox: "0 0 16 16",
								className: "Svg-img-icon-small-textBase",
								dangerouslySetInnerHTML: { __html: Spicetify.SVGIcons["chevron-left"] }
							})
						),
						Spicetify.React.createElement(
							"button",
							{
								className: `search-searchCategory-carouselButton search-searchCategory-carouselButtonRight`,
								tabIndex: -1,
								onClick: () => handleButtonClick("RIGHT"),
								inert: true
							},
							Spicetify.React.createElement("svg", {
								viewBox: "0 0 16 16",
								className: "Svg-img-icon-small-textBase",
								dangerouslySetInnerHTML: { __html: Spicetify.SVGIcons["chevron-right"] }
							})
						)
					)
				)
			)
		);
	};

	const Content = () => {
		const defaultFilter = sessionStorage.getItem("comfy-settings-filter") ? JSON.parse(sessionStorage.getItem("comfy-settings-filter")) : null;
		const [filter, setFilter] = Spicetify.React.useState(defaultFilter ?? { index: 0, label: "All" });

		Spicetify.React.useEffect(() => {
			if (startup) {
				return;
			}
			sessionStorage.setItem("comfy-settings-filter", JSON.stringify(filter));
		}, [filter]);

		return Spicetify.React.createElement(
			"div",
			{ className: "comfy-settings" },
			Spicetify.React.createElement(Carousel, {
				chips: [
					{ label: "All" },
					{ label: "Settings" },
					{ label: "Banner Image" },
					{ label: "Cover Art" },
					{ label: "Playbar" },
					{ label: "Tracklist" },
					{ label: "Interface" },
					{ label: "Colorscheme" }
				],
				checked: filter,
				setChecked: setFilter
			}),
			Spicetify.React.createElement(Section, { name: "Colorscheme", filter }, [
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
					options: ["nord", "nord-flat", "kitty"],
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
			Spicetify.React.createElement(Section, { name: "Interface", filter }, [
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
					defaultVal: Spicetify.Platform.version >= "1.2.46.462" ? "64" : "40",
					min: "0",
					condition: Spicetify.Platform.version >= "1.2.32.997",
					callback: (value, name, defaultVal) => {
						waitForDeps(["Spicetify.CosmosAsync"], async () => {
							await Spicetify.CosmosAsync.post("sp://messages/v1/container/control", {
								type: "update_titlebar",
								height: `${(value === "0" ? "1" : value) || defaultVal}px`
							});

							document.documentElement.style.setProperty("--comfy-topbar-height", value ? value + "px" : "");
						});
					},
					callbackOverride: true
				},
				{
					type: Input,
					inputType: "number",
					name: "Button-Radius",
					title: "Button Radius",
					defaultVal: "8",
					min: "0",
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
					condition: Spicetify.Platform.version <= "1.2.46.462" && !document.querySelector(":root .global-nav"),
					callback: value => {
						if (document.querySelector(":root .global-nav")) return;

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
							type: Toggle,
							name: "Collapse-Topbar-Snippet",
							title: "Collapse List Items",
							defaultVal: true
						}
					],
					collapseItems: true
				},
				{
					type: Toggle,
					name: "Remove-DJ-Prompt",
					title: "Remove your DJ prompt",
					desc: "Hides the prompt 'Click to start listening' in the library",
					defaultVal: true
				},
				{
					type: Toggle,
					name: "Compact-Context-Menu",
					title: "Compact Context Menu",
					defaultVal: true
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
									height: "375px",
									width: "242px"
								}
							},
							Spicetify.React.createElement("img", {
								src: "https://raw.githubusercontent.com/Tetrax-10/Nord-Spotify/master/assets/font/font-url.png",
								alt: "preview",
								style: {
									height: "300px"
								}
							}),

							Spicetify.React.createElement("h4", null, "Usage:"),
							Spicetify.React.createElement("li", null, "Font Name (if installed)"),
							Spicetify.React.createElement("li", null, "URL (Google Fonts)")
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
							includePicker: true,
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
										document.documentElement.style.setProperty("--home-header-color", value);

										if (value === "") {
											main.classList.remove(name);
										} else {
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
					type: Toggle,
					name: "Horizontal-pageLinks-Snippet",
					title: "Horizontal Page Links",
					defaultVal: false,
					condition: Spicetify.Platform.version <= "1.2.46.462" && !document.querySelector(":root .global-nav")
				}
			]),
			Spicetify.React.createElement(Section, { name: "Tracklist", filter }, [
				{
					type: Toggle,
					name: "Remove-Tracklist-Index",
					title: "Remove Tracklist Index",
					desc: "Hides the numbers / count next to songs",
					defaultVal: true
				},
				{
					type: Toggle,
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
					type: Toggle,
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
					min: "0",
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
					min: "0",
					max: "1",
					step: "0.1",
					desc: "Change the opacity of the gradient (0 -> 1)",
					tippy: Spicetify.React.createElement(
						Spicetify.React.Fragment,
						null,
						Spicetify.React.createElement("h4", null, "Set to 0 for no gradient color!")
					),
					callback: value => document.documentElement.style.setProperty("--tracklist-gradient-opacity", value || "")
				}
			]),
			Spicetify.React.createElement(Section, { name: "Playbar", filter }, [
				{
					type: Toggle,
					name: "Custom-Playbar-Snippet",
					title: "Custom Playbar Layout",
					defaultVal: true,
					desc: "Comfy's out of box playbar design"
				},
				{
					type: Toggle,
					name: "Playbar-Above-Right-Panel-Snippet",
					title: "Above Right Panel",
					desc: "Moves the playbar above the right panel",
					defaultVal: false,
					condition: Spicetify.Platform.version <= "1.2.46.462" && !document.querySelector(":root .global-nav"),
					callback: value => {
						waitForDeps(
							".Root__top-container",
							topContainer => {
								const playbar = topContainer.querySelector(".Root__now-playing-bar");

								if (value) {
									const rightbar = topContainer.querySelector(".Root__right-sidebar");
									const resizeObserver = new ResizeObserver(entries => {
										if (getConfig("Playbar-Above-Right-Panel-Snippet")) {
											for (let entry of entries) {
												if (entry.target === rightbar) {
													let newWidth = entry.contentRect.width;
													if (newWidth == 0) {
														const localStorageWidth = localStorage.getItem("223ni6f2epqcidhx5etjafeai:panel-width-saved");
														if (localStorageWidth) {
															newWidth = localStorageWidth;
														} else {
															newWidth = 420;
														}
													}
													playbar.style.width = `${newWidth}px`;
													break;
												}
											}
										} else {
											resizeObserver.disconnect();
										}
									});

									resizeObserver.observe(rightbar);
								} else {
									playbar.style.width = "";
								}
							},
							true
						);
					}
				},
				{
					type: Toggle,
					name: "Smooth-Progress-Bar-Snippet",
					title: "Smooth Progress Bar",
					desc: "Makes the progress bar ease its movement giving the appearance of a smoother transition",
					defaultVal: true
				},
				{
					type: Toggle,
					name: "Hoverable-Timers-Snippet",
					title: "Hoverable Playback Timers",
					defaultVal: false
				},
				{
					type: Toggle,
					name: "Remove-Connect-Bar-Snippet",
					title: "Remove Connect Bar",
					defaultVal: false
				},
				{
					type: Toggle,
					name: "Remove-Progress-Bar-Gradient-Snippet",
					title: "Remove Progress Bar Gradient",
					defaultVal: false
				},
				{
					type: Toggle,
					name: "Remove-Lyrics-Button-Snippet",
					title: "Remove Lyrics Button",
					defaultVal: false
				}
			]),
			Spicetify.React.createElement(Section, { name: "Cover Art", filter }, [
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
							document.documentElement.style.setProperty("--cover-art-left", "");
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
							min: "0",
							callback: value => document.documentElement.style.setProperty("--cover-art-width", value ? value + "px" : "")
						},
						{
							type: Input,
							inputType: "number",
							name: "Cover-Art-Height",
							title: "Height",
							defaultVal: "84px",
							min: "0",
							callback: value => document.documentElement.style.setProperty("--cover-art-height", value ? value + "px" : "")
						},
						{
							type: Input,
							inputType: "number",
							name: "Cover-Art-Radius",
							title: "Border Radius",
							defaultVal: "8px",
							min: "0",
							callback: value => document.documentElement.style.setProperty("--cover-art-radius", value ? value + "px" : "")
						},
						{
							type: Input,
							inputType: "number",
							name: "Cover-Art-Left",
							title: "Left Margin",
							defaultVal: "0px",
							desc: "Change the distance between the cover art and the left of the playbar",
							callback: value => document.documentElement.style.setProperty("--cover-art-left", value ? value + "px" : "")
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
								Spicetify.React.createElement("li", null, "Comfy default: 20px"),
								Spicetify.React.createElement("li", null, "Spotify default: 0px")
							),
							desc: "Change the distance between the cover art and the bottom of the playbar",
							callback: value => document.documentElement.style.setProperty("--cover-art-bottom", value ? value + "px" : "")
						}
					]
				}
			]),
			Spicetify.React.createElement(Section, { name: "Banner Image", filter }, [
				{
					type: SubSection,
					name: "Header-Background",
					title: "Header Background",
					desc: "Adds a translucent background behind header text and images",
					defaultVal: false,
					callback: value => {
						if (!value) {
							document.documentElement.style.setProperty("--header-opacity", "");
						}
					},
					items: [
						{
							type: Input,
							inputType: "number",
							name: "Header-Background-Opacity",
							title: "Opacity",
							defaultVal: "0.6",
							callback: value => document.documentElement.style.setProperty("--header-opacity", value ? value : "")
						}
					],
					collapseItems: false
				},
				{
					type: SubSection,
					name: "Banner-Enabled",
					title: "Custom Banner Images",
					defaultVal: true,
					desc: "(all settings in this category will be ignored if disabled)",
					items: Object.keys(channels).map(channel => ({
						type: Toggle,
						name: channel,
						title: `${channel.replace("-", " ")} Page`,
						defaultVal: channels[channel]["enabled"],
						callback: value => {
							if (value !== channels[channel]["enabled"]) {
								channels[channel]["enabled"] = value;
								updateBanner();
							}
						}
					})),
					collapseItems: true
				},
				{
					type: Toggle,
					name: "Replace-Existing-Banners",
					title: "Replace Existing Banners",
					defaultVal: false,
					desc: "Replace any existing banners with our own - e.g artist banners, playlist banners, etc.",
					callback: updateBanner
				},
				{
					type: Toggle,
					name: "Prefer-Existing-Image",
					title: "Prefer Existing Image",
					defaultVal: false,
					desc: "If available, use existing images instead of the current playing song - e.g playlist image, album art, etc.",
					callback: updateBanner
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
						Spicetify.React.createElement("h4", null, "MacOS Note:"),
						Spicetify.React.createElement("li", null, "Disable Reduced Motion in System Preferences"),
						Spicetify.React.createElement("h4", null, "Blur (10x Value):"),
						Spicetify.React.createElement("li", null, "Recommended: 4px")
					),
					items: [
						{
							type: Toggle,
							name: "AM-Gradient-Include-Existing-Snippet",
							title: "Existing Banners",
							defaultVal: false,
							desc: "Apply the gradient to existing banners on the page (e.g. artist banners)",
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
								Spicetify.React.createElement("h4", null, "Width of circles in relation to viewport (in %)"),
								Spicetify.React.createElement("li", null, "Comfy default: 150")
							),
							callback: value => document.documentElement.style.setProperty("--gradient-width", value ? value + "%" : "")
						},
						{
							type: Input,
							inputType: "number",
							name: "Gradient-Radius",
							title: "Radius",
							desc: "Radius of circles (in %)",
							defaultVal: "50",
							min: "0",
							callback: value => document.documentElement.style.setProperty("--gradient-radius", value ? value + "%" : "")
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
				}
			]),
			Spicetify.React.createElement(Section, { name: "Settings", filter }, [
				{
					type: Toggle,
					name: "Version-Analytics",
					title: "Send Version Analytics",
					defaultVal: false,
					desc: "Help us improve by sharing your Spotify version anonymously",
					callback: async value => {
						waitForDeps("Spicetify.Platform.UserAPI", async () => {
							const endpoint = value ? "collect" : "purge";
							const user = await Spicetify.Platform.UserAPI.getUser();

							fetch(`https://included-exotic-javelin.ngrok-free.app/${endpoint}`, {
								method: "POST",
								headers: {
									"Content-Type": "application/json",
									"ngrok-skip-browser-warning": "true"
								},
								body: JSON.stringify({
									uri: await hashString(user.uri),
									spotify_version: value ? Spicetify.Platform.version : ""
								})
							})
								.then(response => response.json())
								.then(data => console.log(data))
								.catch(error => console.warn("[Comfy-Warning]: Failed to send/purge analytics:", error));
						});
					}
				},
				{
					type: Row,
					name: "setting-card setting-button-row",
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
									setState("Invalid!");
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

	const headerButton = ({ label, link, svg, viewBox }) => {
		return Spicetify.React.createElement(
			Spicetify.ReactComponent.TooltipWrapper,
			{
				label: label,
				showDelay: 200
			},
			Spicetify.React.createElement(
				"button",
				{
					className: "main-trackCreditsModal-closeBtn",
					onClick: () => window.open(link)
				},
				Spicetify.React.createElement("svg", {
					width: "18",
					height: "18",
					viewBox: viewBox,
					fill: "currentColor",
					dangerouslySetInnerHTML: {
						__html: svg
					}
				})
			)
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

				// Trigger Modal + Modal Styling
				document.getElementById("main").classList.add("Settings-Open");

				Spicetify.PopupModal.display({
					title: "Comfy Settings",
					content: Spicetify.React.createElement(Content),
					isLarge: true
				});

				document.querySelector(".main-trackCreditsModal-closeBtn[aria-label='Close']").addEventListener("click", function () {
					document.getElementById("main").classList.remove("Settings-Open");
				});

				document.querySelector("generic-modal").addEventListener("click", event => {
					if (event.target.className === "GenericModal__overlay") {
						event.preventDefault();
						document.getElementById("main").classList.remove("Settings-Open");
					}
				});

				// Social Buttons
				const header = document.querySelector(".main-trackCreditsModal-header");
				const closeButton = document.querySelector(".main-trackCreditsModal-closeBtn");
				const container = document.createElement("div");
				const socialButtons = [
					Spicetify.React.createElement(headerButton, {
						label: "Join our Discord!",
						link: "https://discord.gg/rtBQX5D3bD",
						svg: `<g xmlns="http://www.w3.org/2000/svg"><path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="currentColor" fill-rule="nonzero"></path></g>`,
						viewBox: "0 -28.5 256 256"
					}),
					Spicetify.React.createElement(headerButton, {
						label: "Visit our GitHub org!",
						link: "https://github.com/Comfy-Themes",
						svg: `<path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>`,
						viewBox: "0 0 16 16"
					})
				];

				Spicetify.ReactDOM.render(socialButtons, container);
				container.appendChild(closeButton);
				header.appendChild(container);

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

		if (getConfig("Apple-Music-Gradient-Snippet") && getConfig("AM-Gradient-Include-Existing-Snippet")) {
			const [isPlaylist, isArtist] = [Spicetify.URI.isPlaylistV1OrV2(pathname), Spicetify.URI.isArtist(pathname)];

			if (isPlaylist || isArtist) {
				const id = pathname.match(/\/(?:playlist|artist)\/([^/]+)/)[1];
				const uri = `spotify:${isPlaylist ? "playlist" : "artist"}:${id}`;
				const metadata = isPlaylist
					? await Spicetify.Platform.PlaylistAPI.getMetadata(uri)
					: await Spicetify.GraphQL.Request(
							{
								name: "queryArtistOverview",
								operation: "query",
								sha256Hash: "35648a112beb1794e39ab931365f6ae4a8d45e65396d641eeda94e4003d41497",
								value: null
							},
							{
								uri: uri,
								includePrerelease: true,
								locale: null
							}
					  );
				source = isPlaylist ? metadata.images[3]?.url : metadata.data.artistUnion.visuals.headerImage?.sources?.[0]?.url;
			}
		}

		if (!source && getConfig("Custom-Image")) {
			source = getConfig("Custom-Image-URL")?.replace(/"/g, "");
		}

		if (!source && getConfig("Prefer-Existing-Image")) {
			if (Spicetify.URI.isPlaylistV1OrV2(pathname)) {
				const uri = `spotify:playlist:${pathname.split("/").pop()}`;
				const playlist = await Spicetify.Platform.PlaylistAPI.getMetadata(uri);
				source = playlist.images[0]?.url;
			} else if (Spicetify.URI.isAlbum(pathname)) {
				await waitForDeps("Spicetify.CosmosAsync");
				const album = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/albums/${pathname.split("/").pop()}`);
				source = album.images[0]?.url;
			}
		}

		source = source ?? Spicetify.Player.data.item?.metadata?.image_xlarge_url ?? Spicetify.Player.data.track.metadata.image_xlarge_url;

		const validChannel = Object.values(channels).some(channel => channel.enabled && channel.regex.test(pathname));
		frame.style.display = validChannel ? "" : "none";
		if (getConfig("Banner-Enabled")) {
			if (!validChannel) {
				document.getElementById("main").classList.remove("Banner-Enabled");
			} else {
				document.getElementById("main").classList.add("Banner-Enabled");
			}
		}

		if (document.documentElement.style.getPropertyValue("--image-url") !== `url(${source})`) {
			console.debug(`[Comfy-Event]: Banner Source = ${source}`);

			const preloadImage = new Image();
			preloadImage.onload = function () {
				document.documentElement.style.setProperty("--image-url", `url(${source})`);
			};
			preloadImage.src = source;
		}

		banner.forEach(image => {
			image.style.display = source ? "" : "none";
		});
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

	async function hashString(str) {
		const encoder = new TextEncoder();
		const data = encoder.encode(str);
		const buffer = await crypto.subtle.digest("SHA-256", data);
		return Array.from(new Uint8Array(buffer))
			.map(b => b.toString(16).padStart(2, "0"))
			.join("");
	}
})();
