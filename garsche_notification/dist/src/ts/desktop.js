"use strict";
const axios = require("axios");
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = date.getHours();
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const ampm = hours < 12 ? '午前' : '午後';
    const formattedHour = hours % 12 || 12;
    return `${year}/${month}/${day} ${ampm}${formattedHour}:${minutes}`;
}
function calculateTimeDifference(date1, date2) {
    const diffInMilliseconds = date2.getTime() - date1.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / 1000 / 60);
    const hours = Math.floor(diffInMinutes / 60);
    return hours;
}
function exactlyTime(startDate) {
    if (startDate) {
        const dateObj = new Date(startDate);
        dateObj.setHours(dateObj.getHours() + 6);
        const updatedDateStr = dateObj.toString();
        return updatedDateStr;
    }
    else {
        return "";
    }
}
function main(PLUGIN_ID) {
    ("use strict");
    const onLoadEvent = "app.record.index.show";
    const initialEvent = ["app.record.create.show", "app.record.edit.show"];
    kintone.events.on(initialEvent, async function (event) {
        const record = event.record;
        record["createdAt"].disabled = true;
        record["status"].disabled = true;
        return event;
    });
    const showEvent = initialEvent.concat(["app.record.create.change.startDate", "app.record.edit.change.startDate"]);
    kintone.events.on(showEvent, function (event) {
        const record = event.record;
        if (record["startDate"].value === undefined) {
            kintone.app.record.setFieldShown("duringDate", false);
            kintone.app.record.setFieldShown("endDate", true);
        }
        else {
            kintone.app.record.setFieldShown("duringDate", true);
            kintone.app.record.setFieldShown("endDate", false);
        }
        return event;
    });
    const maintenanceEvent = initialEvent.concat(["app.record.create.change.startDate", "app.record.edit.change.startDate", "app.record.create.change.duringDate", "app.record.edit.change.duringDate", "app.record.create.change.endDate", "app.record.edit.change.endDate"]);
    kintone.events.on(maintenanceEvent, function (event) {
        const record = event.record;
        const today = new Date();
        let startDate = exactlyTime(record["startDate"].value);
        let endDate = exactlyTime(record["endDate"].value);
        const duringDate = record["duringDate"].value || null;
        record["maintenanceTime"].value = calculateTimeDifference(new Date(exactlyTime(today.toString())), new Date(endDate));
        if (startDate) {
            const newDate = new Date(startDate);
            newDate.setDate(newDate.getDate() + Number(duringDate));
            const calculatedEndDateStr = newDate.toString();
            endDate = calculatedEndDateStr;
            record["maintenanceTime"].value = calculateTimeDifference(new Date(startDate), new Date(endDate));
        }
        record["status"].value = new Date(exactlyTime(today.toString())) > new Date(endDate) ? "ドラフト" : "公開済み";
        return event;
    });
    const dropDownEvent = initialEvent.concat(["app.record.create.change.kindNotification", "app.record.edit.change.kindNotification"]);
    kintone.events.on(dropDownEvent, function (event) {
        const record = event.record;
        if (record["kindNotification"].value === "小型アップデート") {
            record.duringDate.value = 7;
        }
        if (record["kindNotification"].value === "中型アップデート") {
            record.duringDate.value = 14;
        }
        if (record["kindNotification"].value === "大型アップデート") {
            record.duringDate.value = 30;
        }
        event.record = record;
        return event;
    });
    const buttonEvent = initialEvent.concat(["app.record.detail.show"]);
    kintone.events.on(buttonEvent, async (event) => {
        let record = event.record;
        const keepButton = document.createElement("button");
        keepButton.id = "keepButton";
        keepButton.innerText = "保存";
        keepButton.style.marginLeft = "8px";
        // const keepSpaceField = kintone.app.record.getSpaceElement('keep');
        // keepSpaceField.appendChild(keepButton);
        const generateButton = document.createElement("button");
        generateButton.id = "generateButton";
        generateButton.innerText = "生成";
        generateButton.style.marginLeft = "8px";
        generateButton.onclick = async function () {
            const updatedRecord = (await kintone.app.record.get()).record;
            record = updatedRecord;
            let startDate = exactlyTime(record["startDate"].value);
            let endDate = exactlyTime(record["endDate"].value);
            const duringDate = record["duringDate"].value || null;
            let displayDate = `終了日：${endDate}`;
            if (startDate !== "") {
                const newDate = new Date(startDate);
                newDate.setDate(newDate.getDate() + Number(duringDate));
                const calculatedEndDateStr = newDate.toString();
                endDate = calculatedEndDateStr;
                displayDate = `${formatDateTime(new Date(startDate))} ～ ${formatDateTime(new Date(endDate))}`;
            }
            const content = record["content"].value || "";
            const works = record["works"].value || "";
            const system = record["system"].value || "";
            record["notificationContent"].value =
                `【メンテナンス日時】\r\n${displayDate}\r\n\r\n${content}\r\n\r\n【ユーザー様のご対応】\r\n${works}\r\n\r\n【システム停止】\r\n${system}\r\n`;
            setTimeout(() => {
                kintone.app.record.set({ record });
            }, 0);
        };
        const generateSpaceField = kintone.app.record.getSpaceElement("generate");
        generateSpaceField.appendChild(generateButton);
        const shareButton = document.createElement("button");
        shareButton.id = "shareButton";
        shareButton.innerText = "公開";
        shareButton.style.marginLeft = "8px";
        shareButton.onclick = async () => {
            const updatedRecord = (await kintone.app.record.get()).record;
            const headers = {
                "Content-Type": "application/json",
                "x-api-key": "dfSe2W4BxG8EtfH3eqVIL6001b2uD6R01FwarSAy",
                "Access-Control-Allow-Origin": "",
            };
            let startDate = exactlyTime(updatedRecord["startDate"].value);
            let endDate = new Date(exactlyTime(updatedRecord["endDate"].value));
            const dayNumber = updatedRecord["maintenanceTime"].value;
            if (startDate) {
                const newDate = new Date(startDate);
                newDate.setDate(newDate.getDate() + Number(dayNumber));
                endDate = newDate;
            }
            const data = {
                notification: {
                    created_at: Date.now(),
                    exp_date: endDate,
                    title: updatedRecord["title"].value,
                    body: updatedRecord["notificationContent"].value,
                },
            };
            try {
                const response = await axios.put("https://api.dev.garsche.net/db/notification", data, { headers });
                updatedRecord["status"].value = "公開済み";
            }
            catch (error) {
                console.error("Error:", error.response ? error.response.data : error.message);
            }
        };
        const shareSpaceField = kintone.app.record.getSpaceElement("share");
        shareSpaceField.appendChild(shareButton);
        return event;
    });
}
main(kintone.$PLUGIN_ID);
