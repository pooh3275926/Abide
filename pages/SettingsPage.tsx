import React, { useState } from "react";

const SettingsPage: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");

  // 📤 匯出資料（不含進度）
  const handleExport = () => {
    try {
      const data = {
        journalEntries: JSON.parse(localStorage.getItem("journalEntries") || "[]"),
        prayerItems: JSON.parse(localStorage.getItem("prayerItems") || "[]"),
        situationalPrayers: JSON.parse(localStorage.getItem("situationalPrayers") || "[]"),
        jesusSaidCards: JSON.parse(localStorage.getItem("jesusSaidCards") || "[]"),
        quickReadHistory: JSON.parse(localStorage.getItem("quickReadHistory") || "[]"),
        messageNotes: JSON.parse(localStorage.getItem("messageNotes") || "[]"),
        smallGroupShares: JSON.parse(localStorage.getItem("smallGroupShares") || "[]"),
        gracePoints: JSON.parse(localStorage.getItem("gracePoints") || "0"), // 直接匯出恩典值
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Abide-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setImportStatus("✅ 匯出成功！");
      setTimeout(() => setImportStatus(""), 3000);
    } catch (error) {
      console.error(error);
      setImportStatus("❌ 匯出失敗，請稍後再試。");
    }
  };

  // 📥 匯入資料
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    const file = fileInput.files?.[0];
    if (!file) return;

    fileInput.value = "";
    setIsImporting(true);
    setImportStatus("正在讀取檔案...");

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      setImportStatus("正在合併資料...");

      const itemKeys: (
        | "journalEntries"
        | "prayerItems"
        | "situationalPrayers"
        | "jesusSaidCards"
        | "quickReadHistory"
        | "messageNotes"
        | "smallGroupShares"
      )[] = [
        "journalEntries",
        "prayerItems",
        "situationalPrayers",
        "jesusSaidCards",
        "quickReadHistory",
        "messageNotes",
        "smallGroupShares",
      ];

      itemKeys.forEach((key) => {
        const importedItems = importedData[key] || [];
        if (!Array.isArray(importedItems)) return;

        // 直接覆蓋同 ID 項目，新增則加入
        const existingItems = JSON.parse(localStorage.getItem(key) || "[]");
        const mergedItemsMap = new Map(existingItems.map((item: any) => [item.id, item]));
        importedItems.forEach((item: any) => {
          if (item.id) mergedItemsMap.set(item.id, item);
        });
        localStorage.setItem(key, JSON.stringify(Array.from(mergedItemsMap.values())));
      });

      // 恩典值直接覆蓋
      if (typeof importedData.gracePoints === "number") {
        localStorage.setItem("gracePoints", JSON.stringify(importedData.gracePoints));
      }

      // ✅ 匯入日記後，自動更新聖經進度
      if (Array.isArray(importedData.journalEntries)) {
        const journalEntries = importedData.journalEntries;
        const progress: Record<string, Record<string, boolean>> = {};

        journalEntries.forEach((entry: any) => {
          if (entry.completed && entry.book && entry.chapter) {
            if (!progress[entry.book]) progress[entry.book] = {};
            progress[entry.book][entry.chapter] = true;
          }
        });

        localStorage.setItem("bibleTrackerProgress", JSON.stringify(progress));
        console.log("✅ 已根據日記同步更新 bibleTrackerProgress。");
      }

      setImportStatus("✅ 匯入成功！系統將於 2 秒後重新整理。");
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error(error);
      setImportStatus(
        `❌ 匯入失敗：${error instanceof Error ? error.message : "無效的 JSON 檔案。"}`
      );
      setIsImporting(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gold-dark"></h1>
        <p className="text-gray-900 text-[16px] mt-6">管理您的應用程式資料</p>
      </div>

      <div className="space-y-6">
        {/* Export Card */}
        <div className="bg-beige-50 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl" aria-hidden="true">
              📩
            </span>
            <div>
              <h2 className="text-xl font-semibold">匯出資料</h2>
              <p className="text-sm text-gray-600 mt-1">
                將您所有的靈修日記、禱告清單等資料，打包成一個 JSON 檔案下載備份（不含進度）。
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="w-full py-3 px-4 bg-beige-200 rounded-lg font-semibold transition hover:bg-beige-300 flex items-center justify-center gap-2"
          >
            <span>下載備份檔案</span>
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-beige-50 rounded-2xl shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="text-3xl" aria-hidden="true">
              💻
            </span>
            <div>
              <h2 className="text-xl font-semibold">匯入資料</h2>
              <p className="text-sm text-gray-600 mt-1">
                從備份檔案還原您的資料。匯入的資料將覆蓋恩典值，並增量 + 覆蓋其他資料。
                進度會自動根據日記完成狀態更新。
              </p>
            </div>
          </div>

          {/* ⚠️ 小提示 */}
          <div className="flex items-center gap-2 p-3 bg-gold-light/30 text-gold-dark rounded-lg text-sm">
            <span className="text-lg">⚠️</span>
            <p>匯入後，恩典值將直接覆蓋現有值，請確認後再操作。</p>
          </div>

          <label className="block w-full">
            <span
              className={`w-full py-3 px-4 bg-beige-200 rounded-lg font-semibold text-center cursor-pointer block transition hover:bg-beige-300 flex items-center justify-center gap-2 ${
                isImporting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <span>選擇 JSON 備份檔</span>
            </span>
            <input
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
              disabled={isImporting}
            />
          </label>
        </div>
      </div>

      {/* Status Message */}
      {importStatus && (
        <div
          className={`mt-6 text-center text-sm p-3 rounded-lg transition-opacity duration-300 ${
            importStatus.includes("成功")
              ? "bg-green-100 text-green-800"
              : importStatus.includes("失敗")
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          <p>{importStatus}</p>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
