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

    if (!file) {
      return;
    }
    
    fileInput.value = "";
    setIsImporting(true);
    setImportStatus("正在讀取檔案...");

    try {
      const text = await file.text();
      const importedData = JSON.parse(text);

      setImportStatus("正在合併資料...");

      // FIX: Explicitly type `itemKeys` to ensure `key` is a string, resolving errors on lines 68 and 80.
      const itemKeys: ("journalEntries" | "prayerItems" | "situationalPrayers" | "jesusSaidCards" | "quickReadHistory")[] = [
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

      if (typeof importedData.gracePoints === "number") {
        const existingPoints = JSON.parse(localStorage.getItem("gracePoints") || "0");
        localStorage.setItem(
          "gracePoints",
          JSON.stringify(existingPoints + importedData.gracePoints)
        );
      }
      
      if (typeof importedData.darkMode === "boolean") {
        localStorage.setItem("darkMode", JSON.stringify(importedData.darkMode));
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
        <h1 className="text-3xl font-bold text-gold-dark dark:text-gold-light"></h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">管理您的應用程式資料</p>
      </div>

      <div className="space-y-6">
        {/* Export Card */}
        <div className="bg-beige-50 dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl" aria-hidden="true">📩</span>
            <div>
              <h2 className="text-xl font-semibold">匯出資料</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                將您所有的靈修日記、禱告清單、進度等資料，打包成一個 JSON 檔案下載備份。
              </p>
            </div>
          </div>
          <button
            onClick={handleExport}
            className="w-full py-3 px-4 bg-beige-200 dark:bg-gray-700 rounded-lg font-semibold transition hover:bg-beige-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
          >
            <span>下載備份檔案</span>
          </button>
        </div>
        
        {/* Import Card */}
        <div className="bg-beige-50 dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl" aria-hidden="true">💻</span>
            <div>
              <h2 className="text-xl font-semibold">匯入資料</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                從備份檔案還原您的資料。匯入的資料將會與現有資料合併，而不是覆蓋。
              </p>
            </div>
          </div>
          <label className="block w-full">
            <span className={`w-full py-3 px-4 bg-beige-200 dark:bg-gray-700 rounded-lg font-semibold text-center cursor-pointer block transition hover:bg-beige-300 dark:hover:bg-gray-600 flex items-center justify-center gap-2 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
        <div className={`mt-6 text-center text-sm p-3 rounded-lg transition-opacity duration-300 ${
            importStatus.includes('成功') ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' :
            importStatus.includes('失敗') ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' :
            'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
          }`}>
          <p>{importStatus}</p>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
