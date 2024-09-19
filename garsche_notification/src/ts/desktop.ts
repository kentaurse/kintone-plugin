const axios = require("axios");

function main(PLUGIN_ID: string) {
  ("use strict");
  const onLoadEvent = "app.record.index.show";
  const initialEvent = ["app.record.create.show", "app.record.edit.show"];
  kintone.events.on(initialEvent, async function (event) {
    const record = event.record;
    record["createdAt"].disabled = true;
    record["status"].disabled = true;

    let startDate = record["startDate"].value || "";
    const duringDate = record["duringDate"].value || null;
    let endDate = record["endDate"].value || "";
    if (startDate !== "") {
      const newDate = new Date(startDate);
      newDate.setDate(newDate.getDate() + duringDate);
      const calculatedEndDateStr = newDate.toISOString().split("T")[0];
      endDate = calculatedEndDateStr;
    }

    const today = new Date();
    if (today > new Date(endDate)) {
      record["status"].value = "ドラフト";
    } else {
      record["status"].value = "公開済み";
    }

    return event;
  });

  const showEvent = initialEvent.concat(["app.record.create.change.startDate", "app.record.edit.change.startDate"]);
  kintone.events.on(showEvent, function (event) {
    const record = event.record;
    if (record["startDate"].value === undefined) {
      kintone.app.record.setFieldShown("duringDate", false);
      kintone.app.record.setFieldShown("endDate", true);
    } else {
      kintone.app.record.setFieldShown("duringDate", true);
      kintone.app.record.setFieldShown("endDate", false);
    }
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
      let startDate = record["startDate"].value || "";
      const duringDate = record["duringDate"].value || null;
      let endDate = record["endDate"].value || "";
      let displayDate = `終了日：${endDate}`;
      if (startDate !== "") {
        const newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + duringDate);
        const calculatedEndDateStr = newDate.toISOString().split("T")[0];
        endDate = calculatedEndDateStr;
        displayDate = `${startDate} ～ ${endDate}`;
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
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": "dfSe2W4BxG8EtfH3eqVIL6001b2uD6R01FwarSAy",
        "Access-Control-Allow-Origin": "",
      };

      const data = {
        notification: {
          created_at: Date.now(),
          exp_date: Date.now() + 30 * 24 * 60 * 60 * 1000,
          title: record["title"].value,
          body: record["notificationContent"].value,
        },
      };

      try {
        const response = await axios.put("https://api.dev.garsche.net/db/notification", data, { headers });
        record["status"].value = "公開済み";
      } catch (error: any) {
        console.error("Error:", error.response ? error.response.data : error.message);
      }
    };
    const shareSpaceField = kintone.app.record.getSpaceElement("share");
    shareSpaceField.appendChild(shareButton);

    return event;
  });
}

main(kintone.$PLUGIN_ID);
