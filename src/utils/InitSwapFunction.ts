export function createInitSwapFunction(
	callback: () => void,
	pathname?: string
) {
	document.addEventListener("astro:after-swap", () => {
		if (!pathname || pathname === window.location.pathname) callback();
	});

	if (!pathname || pathname === window.location.pathname) callback();
}

export function createInitSwapOnPageLoadFunction(
	callback: () => void,
	pathname?: string
) {
	document.addEventListener("astro:page-load", () => {
		if (!pathname || pathname === window.location.pathname) callback();
	});

	if (!pathname || pathname === window.location.pathname) callback();
}
