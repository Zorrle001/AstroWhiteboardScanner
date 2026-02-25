import { atom } from "nanostores";

export const storedEditorImageSrc = atom<string | null>(null);
export const storedExtractCanvas = atom<HTMLCanvasElement | null>(null);

export const pushShareUUID = atom<string | null>(null);

export const storedDeviceUUID = atom<string | null>(null);

export enum PUSH_SHARE_UPLOAD_STATE {
	NOT_UPLOADED,
	UPLOADING,
	UPLOADED,
}

export const pushShareUploadState = atom<PUSH_SHARE_UPLOAD_STATE>(
	PUSH_SHARE_UPLOAD_STATE.NOT_UPLOADED
);

export const pushShareRecievers = atom<Set<string>>(new Set());
