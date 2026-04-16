import { NavContextMenuPatchCallback, addContextMenuPatch, removeContextMenuPatch } from "@api/ContextMenu";
import { EquicordDevs } from "@utils/constants";
import definePlugin from "@utils/types";
import { Menu } from "@webpack/common";

const videoPatch: NavContextMenuPatchCallback = (children, props) => {
    const target = props?.target as HTMLElement | null;
    const video = target?.closest("video") ?? target?.querySelector("video") ?? (target?.tagName === "VIDEO" ? target as HTMLVideoElement : null);

    if (!video) {
        children.push(
            <Menu.MenuSeparator />,
            <Menu.MenuItem
                id="bvp-not-video"
                label="фаа ватафа пепе коко не видео шнейне"
                action={() => { }}
            />
        );
        return;
    }

    children.push(
        <Menu.MenuSeparator />,
        <Menu.MenuItem
            id="bvp-loop"
            label={video.loop ? "Disable Loop" : "Enable Loop"}
            action={() => { video.loop = !video.loop; }}
        />,
        <Menu.MenuItem
            id="bvp-pip"
            label="Picture in Picture"
            action={() => {
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
        />
    );
};

export default definePlugin({
    name: "BetterVideoPlayer",
    description: "Adds Loop and Picture-in-Picture options to the video context menu.",
    authors: [EquicordDevs.creations],

    start() {
        addContextMenuPatch("message", videoPatch);
        addContextMenuPatch("image-context", videoPatch);
    },

    stop() {
        removeContextMenuPatch("message", videoPatch);
        removeContextMenuPatch("image-context", videoPatch);
    }
});