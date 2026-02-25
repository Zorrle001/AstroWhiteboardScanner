import { EditorSettings, ORIANTATION, RATIO } from "@/stores/persistantStore";
import { storedExtractCanvas } from "@/stores/store";
import { clamp } from "@/utils/utils.ts";
import { navigate } from "astro:transitions/client";

enum CORNER {
	TOP_LEFT = "topLeftCorner",
	TOP_RIGHT = "topRightCorner",
	BOTTOM_RIGHT = "bottomRightCorner",
	BOTTOM_LEFT = "bottomLeftCorner",
}

var CORNER_POINTS:
	| {
			[K in CORNER]: {
				x: number;
				y: number;
			};
	  }
	| null = null;

var scanner = new (globalThis as any).jscanify();

export async function loadImageEditor(
	imageSrc: string,
	revokeObjectURL = false,
) {
	const canvas = document.getElementById("result") as HTMLCanvasElement;
	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	const img = new globalThis.Image();
	img.onload = () => {
		console.log("Image loaded:", img);
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);

		canvas.dataset.imageLoaded = "true";
		if (revokeObjectURL) URL.revokeObjectURL(imageSrc);

		// CHECK IF OUT OF CANVAS
		for (const pointKey in CORNER_POINTS) {
			const point = CORNER_POINTS[pointKey as CORNER];
			if (
				point.x < 0 ||
				point.x > canvas.width ||
				point.y < 0 ||
				point.y > canvas.height
			) {
				console.log("Current Frame out of canvas");
				CORNER_POINTS = getDefaultCornerPoints();
				break;
			}
		}

		drawEditorFrame();
	};
	img.onerror = () => {
		console.error("Failed to load image.");
		//navigate("/", { history: "replace" });
		loadImageEditor("/bertie.jpg");
	};
	img.src = imageSrc;
}

export function attachEditorEventListeners(pathname: string = "/editor") {
	window.addEventListener("resize", () => {
		if (window.location.pathname !== pathname) return;
		console.log("REW");

		//CORNER_POINTS = getDefaultCornerPoints();
		drawEditorFrame();
	});

	var draggedCorner: null | CORNER = null;
	var storedDraggedPoint = null;
	var dragOffset = { x: 0, y: 0 };

	const canvas = document.getElementById("result") as HTMLCanvasElement;
	document.onpointerdown = (e) => {
		// document listener so that i dont have to reattach on every page switch
		if (e.target == null) return;
		if (!document.getElementById("result")?.contains(e.target as Node)) {
			return;
		}

		e.preventDefault();

		const canvas = document.getElementById("result") as HTMLCanvasElement;
		const rect = canvas.getBoundingClientRect();
		const x = ((e.pageX - rect.left) / rect.width) * canvas.width;
		const y = ((e.pageY - rect.top) / rect.height) * canvas.height;
		console.log("DOWN", x, y);

		let distance = Infinity;
		let closestPoint = null;
		for (const pointKeyStr in CORNER_POINTS) {
			const pointKey = pointKeyStr as CORNER;
			const point = CORNER_POINTS[pointKey as keyof typeof CORNER_POINTS];
			const distX = Math.abs(point.x - x);
			const distY = Math.abs(point.y - y);
			if (distX ** 2 + distY ** 2 < distance) {
				distance = distX ** 2 + distY ** 2;
				closestPoint = pointKey;
				dragOffset.x = point.x - x;
				dragOffset.y = point.y - y;
			}
		}

		console.log("CLOSEST", closestPoint);
		draggedCorner = closestPoint;
		storedDraggedPoint = closestPoint;

		document.body.classList.add("showCornerZoomCanvas");

		//drawCornerZoomCanvas(CORNER_POINTS[closestPoint]);
	};

	document.onpointermove = (e) => {
		if (draggedCorner == null || !CORNER_POINTS) return;
		e.preventDefault();

		const canvas = document.getElementById("result") as HTMLCanvasElement;

		const rect = canvas.getBoundingClientRect();
		//const x = e.pageX - rect.left;
		//const y = e.pageY - rect.top;
		const x = ((e.pageX - rect.left) / rect.width) * canvas.width;
		const y = ((e.pageY - rect.top) / rect.height) * canvas.height;

		CORNER_POINTS[draggedCorner].x = clamp(
			x + dragOffset.x,
			0,
			canvas.width,
			(clamped: number, number: number) => {
				// REDUCE OFFSET-X WHEN MOVING AGAINS BORDERS

				// LEFT SIDE CLAMPING
				if (clamped > number) {
					const canvasOffsetLeft = e.pageX - rect.left;
					if (canvasOffsetLeft <= 0) {
						dragOffset.x = 0;
					} else {
						dragOffset.x =
							-(canvasOffsetLeft / rect.width) * canvas.width;
					}
					// RIGHT SIDE CLAMPING
				} else if (clamped < number) {
					const canvasOffsetRight =
						e.pageX - (rect.width + rect.left);
					if (canvasOffsetRight >= 0) {
						dragOffset.x = 0;
					} else {
						dragOffset.x =
							-(canvasOffsetRight / rect.width) * canvas.width;
					}
				}
			},
		);
		CORNER_POINTS[draggedCorner].y = clamp(
			y + dragOffset.y,
			0,
			canvas.height,
			(clamped: number, number: number) => {
				// REDUCE OFFSET-Y WHEN MOVING AGAINS BORDERS

				// LEFT SIDE CLAMPING
				if (clamped > number) {
					const canvasOffsetTop = e.pageY - rect.top;
					if (canvasOffsetTop <= 0) {
						dragOffset.y = 0;
					} else {
						dragOffset.y =
							-(canvasOffsetTop / rect.height) * canvas.height;
					}
					// RIGHT SIDE CLAMPING
				} else if (clamped < number) {
					const canvasOffsetBottom =
						e.pageY - (rect.height + rect.top);
					if (canvasOffsetBottom >= 0) {
						dragOffset.y = 0;
					} else {
						dragOffset.y =
							-(canvasOffsetBottom / rect.height) * canvas.height;
					}
				}
			},
		);

		drawEditorFrame();
	};

	document.onpointerup = (e) => {
		if (draggedCorner != null) {
			e.preventDefault();
		}
		draggedCorner = null;

		dragOffset = { x: 0, y: 0 };

		document.body.classList.remove("showCornerZoomCanvas");
	};
}

export function getDefaultCornerPoints() {
	const canvas = document.getElementById("result") as HTMLCanvasElement;
	const rect = canvas.getBoundingClientRect();

	const top = rect.top;
	const left = rect.left;
	const width = rect.width;
	const height = rect.height;

	console.log({ top, left, width, height });

	return {
		topLeftCorner: { x: 0, y: 0 },
		topRightCorner: { x: canvas.width, y: 0 },
		bottomRightCorner: { x: canvas.width, y: canvas.height },
		bottomLeftCorner: { x: 0, y: canvas.height },
	};
}

export function resetCornerPoints() {
	CORNER_POINTS = getDefaultCornerPoints();
	drawEditorFrame();
}

export function drawEditorFrame() {
	const canvas = document.getElementById("result") as HTMLCanvasElement;
	const rect = canvas.getBoundingClientRect();

	const top = rect.top;
	const left = rect.left;
	const width = rect.width;
	const height = rect.height;

	//const ctx = canvas.getContext("2d");

	const overlayCanvas = document.getElementById(
		"overlayCanvas",
	) as HTMLCanvasElement;

	overlayCanvas.width = window.innerWidth;
	overlayCanvas.height = window.innerHeight;

	const overlayCtx = overlayCanvas.getContext("2d");
	if (!overlayCtx) return;

	if (!CORNER_POINTS) {
		CORNER_POINTS = getDefaultCornerPoints();
	}

	const adjustFactor =
		(overlayCanvas.width /
			parseFloat(getComputedStyle(overlayCanvas)["width"])) *
		0.5;

	overlayCtx.strokeStyle = "orange";
	overlayCtx.lineWidth = 16 * 0.2 * adjustFactor;
	overlayCtx.lineCap = "round";

	// DRAW DARK BACKGROUND
	overlayCtx.beginPath(); // Start a new path
	overlayCtx.rect(0, 0, overlayCanvas.width, overlayCanvas.height);

	overlayCtx.moveTo(
		left + (CORNER_POINTS[CORNER.TOP_LEFT].x / canvas.width) * rect.width,
		top + (CORNER_POINTS[CORNER.TOP_LEFT].y / canvas.height) * rect.height,
	);

	for (const lines of [
		[CORNER.TOP_LEFT, CORNER.TOP_RIGHT],
		[CORNER.TOP_RIGHT, CORNER.BOTTOM_RIGHT],
		[CORNER.BOTTOM_RIGHT, CORNER.BOTTOM_LEFT],
		[CORNER.BOTTOM_LEFT, CORNER.TOP_LEFT],
	]) {
		const startPoint = CORNER_POINTS[lines[0]];
		const endPoint = CORNER_POINTS[lines[1]];

		overlayCtx.lineTo(
			left + (endPoint.x / canvas.width) * rect.width,
			top + (endPoint.y / canvas.height) * rect.height,
		);
	}
	overlayCtx.closePath();
	overlayCtx.fillStyle = "rgba(0,0,0,0.35)";
	overlayCtx.fill("evenodd");

	// DRAW ORANGE FRAME
	overlayCtx.beginPath();
	overlayCtx.moveTo(
		left + (CORNER_POINTS[CORNER.TOP_LEFT].x / canvas.width) * rect.width,
		top + (CORNER_POINTS[CORNER.TOP_LEFT].y / canvas.height) * rect.height,
	);

	for (const lines of [
		[CORNER.TOP_LEFT, CORNER.TOP_RIGHT],
		[CORNER.TOP_RIGHT, CORNER.BOTTOM_RIGHT],
		[CORNER.BOTTOM_RIGHT, CORNER.BOTTOM_LEFT],
		[CORNER.BOTTOM_LEFT, CORNER.TOP_LEFT],
	]) {
		const startPoint = CORNER_POINTS[lines[0]];
		const endPoint = CORNER_POINTS[lines[1]];

		overlayCtx.lineTo(
			left + (endPoint.x / canvas.width) * rect.width,
			top + (endPoint.y / canvas.height) * rect.height,
		);
	}
	overlayCtx.closePath();
	overlayCtx.stroke();

	for (const pointKey in CORNER_POINTS) {
		const point = CORNER_POINTS[pointKey as keyof typeof CORNER_POINTS];

		overlayCtx.beginPath();
		overlayCtx.arc(
			left + (point.x / canvas.width) * rect.width,
			top + (point.y / canvas.height) * rect.height,
			16 * 0.5 * (adjustFactor * 2),
			0,
			2 * Math.PI,
		);
		overlayCtx.fillStyle = "rgba(255, 166, 0, 0.25)";
		overlayCtx.fill();
		overlayCtx.stroke();
		overlayCtx.closePath();
	}
}

const RATIO_TABLE: {
	[k in RATIO]: [number, number];
} = {
	Auto: [-1, -1],
	"1:1": [2480, 2480],
	"4:3": [2480, 1860],
	"16:9": [2480, 1395],
	"2:1": [2480, 1240],
	A4: [2480, 1754],
};

export function extract() {
	// @ts-ignore
	if (globalThis.cv === undefined) {
		alert("Open CV not loaded!");
		return;
	}

	const canvas = document.getElementById("result");

	const editorSettings = EditorSettings.get();
	const ratio = editorSettings.ratio;
	const orientation = editorSettings.orientation;

	if (!CORNER_POINTS) CORNER_POINTS = getDefaultCornerPoints();

	let width, height;
	if (ratio === RATIO.AUTO) {
		let width1 = Math.abs(
			CORNER_POINTS.topRightCorner.x - CORNER_POINTS.topLeftCorner.x,
		);
		let width2 = Math.abs(
			CORNER_POINTS.bottomRightCorner.x -
				CORNER_POINTS.bottomLeftCorner.x,
		);
		let widthAvg = (width1 + width2) / 2;
		let height1 = Math.abs(
			CORNER_POINTS.bottomLeftCorner.y - CORNER_POINTS.topLeftCorner.y,
		);
		let height2 = Math.abs(
			CORNER_POINTS.bottomRightCorner.y - CORNER_POINTS.topRightCorner.y,
		);
		let heightAvg = (height1 + height2) / 2;
		width = widthAvg;
		height = heightAvg;
	} else if (orientation === ORIANTATION.LANDSCAPE) {
		[width, height] = RATIO_TABLE[ratio];
	} else {
		[height, width] = RATIO_TABLE[ratio];
	}

	const extractCanvas = scanner.extractPaper(
		canvas,
		width,
		height,
		CORNER_POINTS,
	);

	storedExtractCanvas.set(extractCanvas);
	navigate("/editor-export");
}

export function flipCanvas(
	canvas: HTMLCanvasElement,
	ctx: CanvasRenderingContext2D,
	flipX: boolean,
	flipY: boolean,
) {
	if (flipY == false && flipX == false) {
		ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
	} else if (flipX == true && flipY == false) {
		ctx.save();
		ctx.scale(-1, 1);
		ctx.drawImage(canvas, 0, 0, canvas.width * -1, canvas.height);
		ctx.restore();
	} else if (flipX == false && flipY == true) {
		ctx.save();
		ctx.scale(1, -1);
		ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height * -1);
		ctx.restore();
	} else {
		ctx.save();
		ctx.scale(-1, -1);
		ctx.drawImage(canvas, 0, 0, canvas.width * -1, canvas.height * -1);
		ctx.restore();
	}
}
