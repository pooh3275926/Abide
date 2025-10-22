import React, { useState } from "react";

const SettingsPage: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState("");

  // 📤 匯出資料
  const handleExport = () => {
    try {
      const data = {
        journalEntries: JSON.parse(localStorage.getItem("journalEntries") || "[]"),
        prayerItems: JSON.parse(localStorage.getItem("prayerItems") || "[]"),
        situationalPrayers: JSON.parse(localStorage.getItem("situationalPrayers") || "[]"),
        jesusSaidCards: JSON.parse(localStorage.getItem("jesusSaidCards") || "[]"),
        quickReadHistory: JSON.parse(localStorage.getItem("quickReadHistory") || "[]"),
        bibleTrackerProgress: JSON.parse(localStorage.getItem("bibleTrackerProgress") || "{}"),
        gracePoints: JSON.parse(localStorage.getItem("gracePoints") || "0"),
        darkMode: JSON.parse(localStorage.getItem("darkMode") || "false"),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `faith-journal-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      alert("✅ 匯出成功！");
    } catch (error) {
      console.error(error);
      alert("❌ 匯出失敗，請稍後再試。");
    }
  };

  // 📥 匯入資料
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = event.target;
    const file = fileInput.files?.[0];

    if (!file) {
      setImportStatus("未選擇檔案。");
      return;
    }

    // 清空 input，避免同檔案二次選擇無法觸發 onChange
    fileInput.value = "";

    setIsImporting(true);
    setImportStatus("正在讀取檔案...");

    try {
      const text = await file.text(); // ✅ 比 FileReader 更穩定
      const importedData = JSON.parse(text);

      setImportStatus("正在合併資料...");

      const itemKeys = [
        "journalEntries",
        "prayerItems",
        "situationalPrayers",
        "jesusSaidCards",
        "quickReadHistory",
      ];

      itemKeys.forEach((key) => {
        const existingItems = JSON.parse(localStorage.getItem(key) || "[]");
        const importedItems = importedData[key] || [];

        if (!Array.isArray(existingItems) || !Array.isArray(importedItems)) return;

        const existingIds = new Set(existingItems.map((item: any) => item.id));
        const newItems = importedItems.filter(
          (item: any) => item.id && !existingIds.has(item.id)
        );

        if (newItems.length > 0) {
          const merged = [...existingItems, ...newItems];
          localStorage.setItem(key, JSON.stringify(merged));
        }
      });

      // 🔸 bibleTrackerProgress 深層合併
      if (importedData.bibleTrackerProgress) {
        const existingProgress = JSON.parse(
          localStorage.getItem("bibleTrackerProgress") || "{}"
        );
        const importedProgress = importedData.bibleTrackerProgress;
        const mergedProgress = { ...existingProgress };

        for (const book in importedProgress) {
          if (!mergedProgress[book]) mergedProgress[book] = {};
          mergedProgress[book] = { ...mergedProgress[book], ...importedProgress[book] };
        }

        localStorage.setItem("bibleTrackerProgress", JSON.stringify(mergedProgress));
      }

      // 🔸 gracePoints 累加
      if (typeof importedData.gracePoints === "number") {
        const existingPoints = JSON.parse(localStorage.getItem("gracePoints") || "0");
        localStorage.setItem(
          "gracePoints",
          JSON.stringify(existingPoints + importedData.gracePoints)
        );
      }

      // 🔸 darkMode 覆寫
      if (typeof importedData.darkMode === "boolean") {
        localStorage.setItem("darkMode", JSON.stringify(importedData.darkMode));
      }

      setImportStatus("✅ 匯入成功！系統將於 2 秒後重新整理。");
      setTimeout(() => window.location.reload(), 2000);
    } catch (error) {
      console.error(error);
      setImportStatus(
        `匯入失敗：${error instanceof Error ? error.message : "無效的 JSON 檔案。"}`
      );
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4 text-center">⚙️ 設定與資料備份</h1>

      <div className="space-y-4">
        <button
          onClick={handleExport}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition"
        >
          📤 匯出所有資料
        </button>

        <label className="block w-full">
          <span className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium text-center cursor-pointer block transition">
            📥 匯入資料（JSON）
          </span>
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
        </label>

        {isImporting && (
          <p className="text-gray-600 text-sm text-center animate-pulse">
            {importStatus || "正在處理中..."}
          </p>
        )}
        {!isImporting && importStatus && (
          <p className="text-center text-gray-700">{importStatus}</p>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
