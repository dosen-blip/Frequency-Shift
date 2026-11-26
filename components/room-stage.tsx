import { ROOMS, type RoomName } from "./laser-room/rooms";

// The laser room behind a page that is not the home page (see components/laser-room/rooms.ts for each page's
// room). The stage is fixed behind the whole page; the band above the page's heading is where the room's neon
// hangs, and the mark in it is the box the scene fits the neon to, so the page's own layout places it.
//
// Before anything paints, a capable browser marks the page as expecting its room, so the band is there from the
// first frame and nothing moves when the room arrives. public/laser-hero.js starts the room, or takes the mark
// away again if it can't.
const EXPECT = `(function(d){try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches&&window.WebGL2RenderingContext)d.classList.add("expects-room")}catch(e){}})(document.documentElement)`;

export function RoomStage({ room }: { room: RoomName }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: EXPECT }} />
      {/* keyed by room: going from one page to another, each room gets a stage of its own, not the last one's */}
      <div className="room-stage" data-laser-stage data-room={room} aria-hidden="true" key={`stage-${room}`} />
      <div className="room-band" aria-hidden="true" key={`band-${room}`}>
        <div className="room-mark" style={{ "--room-aspect": ROOMS[room].aspect } as React.CSSProperties} />
      </div>
      <script src="/laser-hero.js" defer />
    </>
  );
}
