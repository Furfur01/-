# P0 independent preview verification

> Ship asset findings below are historical and superseded by ship-assets-verification.md. The preview now uses SHA256-verified APK icons and snapshots of the current reconstructed fleet models with authored materials and vertex colors. The previous preserved-GLB / uniform steel-material caveat no longer describes the current preview.


Verified with the Codex in-app browser at 1440×900, 1280×720 and 390×844.

- Research: selected Hyperspace Drive; start deducted 320,000 metal / 640,000 crystal / 192,000 gas; cancellation restored all three starting balances. Ship-name search for 驱逐舰 produced 2 technology matches. Zoom buttons and native pointer drag changed the view. Technology graph uses catalog prerequisite edges. No browser errors or warnings observed.
- Shipyard: Cruiser and Battleship models loaded in WebGL. Battleship quantity 10 produced a 450,000 / 150,000 / 0 batch cost and 00:16:00 duration. Add and cancellation updated the queue and restored all resources. Civilian/combat categories and concept-image tabs worked.
- Responsive: no document horizontal overflow or broken images at the checked sizes. On 1280×720 the readable 82% default intentionally shows part of the tree, which can be panned; the overview control fits everything. 390px defaults to 90% focused on the selected technology. Research action and ship quantity/order action remain reachable; desktop actions stay fixed while details scroll.
- Repairs: readable tree scale and labels; tighter row spacing; fixed action areas; prevent focus-induced hidden scrolling in the tree; prioritize ship quantity; mobile button target sizes; concept-button accessible name; synchronize fleet category after reset; reduce overexposure of untextured source models.
- Caveat: preserved GLB source assets contain no texture maps, so the live viewport shows the source geometry with a steel material; detailed thumbnail art is separate.

Saved evidence:
- research-desktop-1440.jpg
- shipyard-desktop-1440.jpg
- research-desktop-1280.jpg
- shipyard-desktop-1280.jpg
- research-mobile-390.jpg
- shipyard-mobile-390.jpg

At completion the UI was reset to the technology screen with Hyperspace Drive selected, research idle, and original resource balances. Temporary viewport override was cleared. No game APIs or production files were used or modified.
