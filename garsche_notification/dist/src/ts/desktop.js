"use strict";
function main(PLUGIN_ID) {
    ("use strict");
    kintone.events.on("", async function (event) {
        return; //return event to change kintone
    });
}
main(kintone.$PLUGIN_ID);
