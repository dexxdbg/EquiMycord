import ErrorBoundary from "@components/ErrorBoundary";
import { EquicordDevs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Tooltip } from "@webpack/common";
import { RefObject } from "react";

type MediaRef = RefObject<HTMLVideoElement> | undefined;

export default definePlugin({
    name: "BetterVideoPlayer",
    description: "Adds Loop and Picture-in-Picture buttons to the video player.",
    authors: [EquicordDevs.creations],
    patches: [
        {
            find: "renderControls(){",
            replacement: {
                match: /onToggleMuted:this.toggleMuted,/,
                replace: "$&mediaRef:this.mediaRef,"
            }
        },
        {
            find: "AUDIO:\"AUDIO\"",
            replacement: {
                match: /sliderWrapperClassName:\i.\i\}\)\}\),/,
                replace: "$&$self.renderButtons({mediaRef:this?.props?.mediaRef}),"
            }
        }
    ],

    renderButtons: ErrorBoundary.wrap(({ mediaRef }: { mediaRef: MediaRef; }) => {
        const media = mediaRef?.current;
        if (!media || media.tagName !== "VIDEO") return null;

        return (
            <>
                <Tooltip text="Toggle Loop">
                    {tooltipProps => (
                        <button
                            {...tooltipProps}
                            style={{ cursor: "pointer", background: "none", border: "none", padding: "4px", color: "currentColor" }}
                            onClick={() => {
                                const video = mediaRef?.current;
                                if (!video) return;
                                video.loop = !video.loop;
                            }}
                        >
                            <svg width="24px" height="24px" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                            </svg>
                        </button>
                    )}
                </Tooltip>
                <Tooltip text="Picture in Picture">
                    {tooltipProps => (
                        <button
                            {...tooltipProps}
                            style={{ cursor: "pointer", background: "none", border: "none", padding: "4px", color: "currentColor" }}
                            onClick={() => {
                                const video = mediaRef?.current;
                                if (!video) return;
                                const clone = document.body.appendChild(video.cloneNode(true)) as HTMLVideoElement;
                                clone.loop = video.loop;
                                clone.style.display = "none";
                                clone.onleavepictureinpicture = () => clone.remove();

                                function launch() {
                                    clone.currentTime = video!.currentTime;
                                    clone.requestPictureInPicture();
                                    video!.pause();
                                    clone.play();
                                }

                                if (clone.readyState === 4) launch();
                                else clone.onloadedmetadata = launch;
                            }}
                        >
                            <svg width="24px" height="24px" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M21 3a1 1 0 0 1 1 1v7h-2V5H4v14h6v2H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18zm0 10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h8zm-1 2h-6v4h6v-4z" />
                            </svg>
                        </button>
                    )}
                </Tooltip>
            </>
        );
    })
});