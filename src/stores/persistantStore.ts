import { persistentAtom, persistentMap } from "@nanostores/persistent";

export enum RATIO {
    AUTO = "Auto",
    "1:1" = "1:1",
    "4:3" = "4:3",
    "16:9" = "16:9",
    "2:1" = "2:1",
    "A4" = "A4",
}

export enum ORIANTATION {
    LANDSCAPE = "landscape",
    PORTRAIT = "portrait",
}

export const selectedRatio = persistentAtom<RATIO>("selectedRatio", RATIO.AUTO);

export type EditorSettingsType = {
    ratio: RATIO;
    orientation: ORIANTATION;
};

export const EditorSettings = persistentMap<EditorSettingsType>(
    "editorSettings",
    {
        ratio: RATIO["16:9"],
        orientation: ORIANTATION.LANDSCAPE,
    }
);
