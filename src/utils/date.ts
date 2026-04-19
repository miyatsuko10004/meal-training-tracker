// タイムゾーン（JST）を考慮した日付ユーティリティ

export const getTodayStr = () => {
  const now = new Date();
  const jst = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return jst.toISOString().split("T")[0];
};

export const getJSTDate = (date: Date = new Date()) => {
  return new Date(date.getTime() + (9 * 60 * 60 * 1000));
};
