export function fakeDelay(ms = 1500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fakeUpdateName(name) {
  await fakeDelay(1500);
  if (name.trim() === "") {
    return "名稱不能為空";
  }
  if (name.length < 2) {
    return "名稱至少需要 2 個字";
  }
  return null;
}

export async function fakeSendMessage(text) {
  await fakeDelay(2000);
  if (text.includes("error")) {
    throw new Error("發送失敗！");
  }
  return { id: Date.now(), text, timestamp: new Date().toLocaleTimeString() };
}

export async function fakeToggleLike(liked, shouldFail = false) {
  await fakeDelay(1000);
  if (shouldFail) throw new Error("API 錯誤");
  return !liked;
}

export function fakeDeleteTodo(shouldFail = false) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("刪除失敗"));
      else resolve();
    }, 1200);
  });
}

export async function fakeAddMember(name, role) {
  await fakeDelay(1500);
  if (!name.trim()) return "名稱不能為空";
  if (!role.trim()) return "角色不能為空";
  return null;
}

export function fakeLoadComments() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, author: "Alice", text: "React 19 太棒了！Actions 省了好多 code", time: "2 小時前" },
        { id: 2, author: "Bob", text: "useOptimistic 終於不用自己刻了", time: "1 小時前" },
        { id: 3, author: "Charlie", text: "ref 不用 forwardRef 真的是德政", time: "30 分鐘前" },
      ]);
    }, 2000);
  });
}
