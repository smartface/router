export type BottomSheetDetent = "medium" | "large";
export type BottomSheetOptions = {
    cornerRadius: number,
    detents: [primaryDetent: BottomSheetDetent, secondaryDetent?: BottomSheetDetent]
    isGrabberVisible: boolean
}
