export enum VIEW_TRANSITION_LIFECYCLE_EVENT {
	BEFORE_PREPARATION = "astro:before-preparation",
	AFTER_PREPARATION = "astro:after-preparation",
	BEFORE_SWAP = "astro:before-swap",
	AFTER_SWAP = "astro:after-swap",
	PAGE_LOAD = "astro:page-load",
}

export function createInitSwapFunction(
	callback: () => void,
	pathname?: string,
	lifecycleEvent: VIEW_TRANSITION_LIFECYCLE_EVENT = VIEW_TRANSITION_LIFECYCLE_EVENT.AFTER_SWAP,
) {
	document.addEventListener(lifecycleEvent, () => {
		if (
			!pathname ||
			pathname === window.location.pathname.replace(/(.+)\/$/, "$1")
		)
			callback();
	});

	if (
		!pathname ||
		pathname === window.location.pathname.replace(/(.+)\/$/, "$1")
	)
		callback();
}
