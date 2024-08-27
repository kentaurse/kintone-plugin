const runAll = require("npm-run-all");

const ppkEnv = process.env.npm_config_ppk;

const developScript = `develop-${ppkEnv}`;

runAll([developScript, "upload"], {
  parallel: false, // 順次実行
  stdout: process.stdout,
  stdin: process.stdin,
}).catch((err) => {
  console.error("エラー発生:", err);
  if (err.results) {
    console.log("結果:", err.results);
    err.results
      .filter(({ code }) => code)
      .forEach(({ name }) => {
        console.log(`"npm run ${name}" が失敗しました`);
      });
  } else {
    console.log("結果がありません。");
  }
});
