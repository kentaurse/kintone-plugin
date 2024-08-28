"use strict";
function main(PLUGIN_ID) {
    ("use strict");
    kintone.events.on("clicksub", async function (event) {
        const record = event.record;
        record.title.value = "title";
        //1
        kintone.app.record.set({ record });
        //2
        return event;
    });
}
main(kintone.$PLUGIN_ID);
