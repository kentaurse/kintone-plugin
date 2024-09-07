"use strict";
function main(PLUGIN_ID) {
    ("use strict");
    const onLoadEvent = "app.record.index.show";
    const initialEvent = ["app.record.create.show", "app.record.edit.show"];
    kintone.events.on(initialEvent, async function (event) {
        const record = event.record;
        record["title"].value = "title";
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
    kintone.events.on(buttonEvent, (event) => {
        const record = event.record;
        const keepButton = document.createElement('button');
        keepButton.id = 'keepButton';
        keepButton.innerText = '保存';
        keepButton.style.marginLeft = '8px';
        const keepSpaceField = kintone.app.record.getSpaceElement('keep');
        keepSpaceField.appendChild(keepButton);
        const generateButton = document.createElement('button');
        generateButton.id = 'generateButton';
        generateButton.innerText = '生成';
        generateButton.style.marginLeft = '8px';
        generateButton.onclick = function () {
            if (!record["notificationContent"]) {
                console.error("Field 'notificationContent' not found in the record.");
                return;
            }
            record["notificationContent"].value = `
      【対象製品】
      ガル助 ver.2 (Garoonパッケージ版/クラウド版）

      【メンテナンス内容】
      ・連携ユーザー設定画面のページネーションの動作不具合の改修
      ・施設の連携設定時に選択肢がない場合の動作不具合の改修
      ・連携ユーザー/施設連携設定画面の表示に時間がかかる場合
      　読み込み中であることがわかるよう、インジケーターを表示する変更

      【機能アップデート】
      ・ご利用のGaroon環境の予定の同期状態をご確認いただけるようになります。
      ・連携ユーザー画面/施設の連携設定画面にて1ページあたりの最大表示数を
      　100まで自由に変更いただけるようになります。
      【ユーザー様のご対応】
      アップデート内容が反映されていない場合はブラウザのスーパーリフレッシュ
      もしくはブラウザのタブを閉じ再度Garoonにアクセスしてください。

      ご不明な点がございましたらお問い合わせフォームまでご連絡いただけますようお願い申し上げます。
      ご迷惑をおかけいたしますが何卒よろしくお願いいたします。
      `;
            setTimeout(() => {
                kintone.app.record.set({ record });
            }, 0);
        };
        const generateSpaceField = kintone.app.record.getSpaceElement('generate');
        generateSpaceField.appendChild(generateButton);
        const shareButton = document.createElement('button');
        shareButton.id = 'shareButton';
        shareButton.innerText = '公開';
        shareButton.style.marginLeft = '8px';
        const shareSpaceField = kintone.app.record.getSpaceElement('share');
        shareSpaceField.appendChild(shareButton);
        return event;
    });
}
main(kintone.$PLUGIN_ID);
