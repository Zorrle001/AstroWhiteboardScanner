import { storedDeviceUUID } from "@/stores/store";
import { v4 as uuidv4 } from "uuid";

let device_uuid = sessionStorage.getItem("DEVICE_UUID");
let device_name = sessionStorage.getItem("DEVICE_NAME");
let ALREADY_REGISTERED = true;

if (!device_uuid) {
	//device_uuid = crypto.randomUUID();
	//localStorage.setItem("DEVICE_UUID", device_uuid);
	ALREADY_REGISTERED = false;
} else {
	storedDeviceUUID.set(device_uuid);
	console.log("RELOGIN as " + device_name + " with UUID " + device_uuid);
}

ConnectWS();

function ConnectWS() {
	const WAITING_MESSAGES: Object[] = [];
	const REQUEST_CALLBACKS = new Map<string, (response: object) => {}>();

	console.log("Connect WS...");
	const socket = new WebSocket(
		"wss://api.astrowhiteboardscanner.zorrle001.dev"
	);
	// TODO REMOVE
	window.socket = socket;

	socket.onopen = () => {
		if (!ALREADY_REGISTERED) {
			// IMMER NEUER USERNAME BEI REREGISTRATION
			socket.send(
				JSON.stringify({
					id: "DEVICE_REGISTER",
				})
			);
			startKeepAlive();
		} else {
			socket.send(
				JSON.stringify({
					id: "DEVICE_LOGIN",
					device_uuid,
					device_name,
				})
			);
			startKeepAlive();
		}
	};

	socket.onmessage = (e) => {
		const msgStr = e.data;

		if (typeof msgStr !== "string" || !isValidJSON(msgStr)) return;

		const msg = JSON.parse(msgStr);
		if (msg.requestUUID) {
			const requestUUID = msg.requestUUID;
			const callback = REQUEST_CALLBACKS.get(requestUUID);
			if (callback) {
				callback(msg);
				REQUEST_CALLBACKS.delete(requestUUID);
				return;
			}
		}

		if (msg.id === "CONNECTED") {
			if (ALREADY_REGISTERED === true) {
				for (const msg of WAITING_MESSAGES) {
					socket.send(JSON.stringify(msg));
				}
			}
		} else if (msg.id === "DEVICE_REGISTER_RES") {
			const device_uuid = msg.uuid;
			storedDeviceUUID.set(device_uuid);
			const device_name = msg.name;

			if (!device_uuid || !device_name) {
				throw new Error("DEVICE_REGISTER_RES returned invalid results");
			}

			sessionStorage.setItem("DEVICE_UUID", device_uuid);
			sessionStorage.setItem("DEVICE_NAME", device_name);

			console.log(device_name, device_uuid);

			for (const msg of WAITING_MESSAGES) {
				// TODO: CHANGE HOW MSG ARE HANDLED THAT ARE SENT BEFORE SOCKET OPENED
				if (msg.device_uuid === null) {
					msg.device_uuid = device_uuid;
				}
				socket.send(JSON.stringify(msg));
			}

			// SUBSCRIPTION WIRD AKTIVIERT SOBALD SIE BENÖTIGT WIRD
			/* socket.send(
			JSON.stringify({
				id: "SUBSCRIBE_ONLINE_DEVICES",
			})
		); */
		} else if (msg.id === "SUBSCRIBE_ONLINE_DEVICES_RES") {
			const devices = msg.devices ?? [undefined, undefined];
			if (!devices) {
				throw new Error("DEVICE_REGISTER_RES returned invalid results");
			}

			if (typeof window.ON_SUBSCRIBE_ONLINE_DEVICES_RES === "function") {
				window.ON_SUBSCRIBE_ONLINE_DEVICES_RES(msg.devices);
			}
		} else if (msg.id === "PUSH_SHARE_RECIEVE") {
			const pushshare_uuid = msg.pushshare_uuid;
			const sender_name = msg.sender_name;
			const file_name = msg.file_name;

			if (!pushshare_uuid || !sender_name || !file_name) {
				console.error("RECIEVED INVALID PUSH_SHARE_RECIEVE MSG");
				return;
			}

			const event = new CustomEvent("SHOW_NOTIFICATION", {
				detail: {
					pushshare_uuid,
					sender_name,
					file_name,
				},
			});
			console.log("DISPATCH EVENT", event);
			document.dispatchEvent(event);

			if (false && "Notification" in window) {
				Notification.requestPermission().then((result) => {
					if (result === "granted") {
						if (document.hasFocus() === false) {
							new Notification("Push-Share", {
								body:
									sender_name +
									" hat dir einen Push-Share gesendet",
							});
						}
					} else {
					}
				});
			}
		}
	};

	socket.onclose = () => {
		console.error("SOCKET CLOSED");
		stopKeepAlive();
		ConnectWS();
	};

	window.sendSocketMessage = (msg: object) => {
		if (socket.readyState === socket.OPEN) {
			socket.send(JSON.stringify(msg));
		} else {
			console.warn("PUSH MSG TO WAITING LIST");
			WAITING_MESSAGES.push(msg);
		}
	};

	window.sendSocketRequest = (
		msg: object,
		callback: (response: object) => {}
	) => {
		const requestUUID = uuidv4();
		msg.requestUUID = requestUUID;

		REQUEST_CALLBACKS.set(requestUUID, callback);

		if (socket.readyState === socket.OPEN) {
			socket.send(JSON.stringify(msg));
		} else {
			console.warn("PUSH MSG TO WAITING LIST");
			WAITING_MESSAGES.push(msg);
		}
	};

	var keepAliveLoop: undefined | NodeJS.Timeout = undefined;

	function startKeepAlive() {
		stopKeepAlive();
		keepAliveLoop = setInterval(() => {
			if (socket && socket.OPEN)
				socket.send(
					JSON.stringify({
						id: "KEEP_ALIVE",
					})
				);
		}, 5000);
	}

	function stopKeepAlive() {
		if (keepAliveLoop) clearInterval(keepAliveLoop);
	}
}

function isValidJSON(str: string) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}
