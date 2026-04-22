import { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";

const REPO = "ekxpeter/apk";
const CURRENT_BUILD = Number(import.meta.env.VITE_BUILD_NUMBER || "0");
const SEEN_KEY = "fbg_update_seen_v1";

type ReleaseInfo = {
  tag_name: string;
  name: string;
  html_url: string;
  body?: string;
  assets: { name: string; browser_download_url: string; size: number }[];
};

export default function UpdateChecker() {
  const [release, setRelease] = useState<ReleaseInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
        if (!r.ok) return;
        const data: ReleaseInfo = await r.json();
        const m = /build-(\d+)/.exec(data.tag_name || "");
        const latestBuild = m ? Number(m[1]) : 0;
        const lastSeen = Number(localStorage.getItem(SEEN_KEY) || "0");
        if (latestBuild > CURRENT_BUILD && latestBuild > lastSeen) {
          setRelease(data);
        }
      } catch {
        /* offline — silent */
      }
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  if (!release || dismissed) return null;

  const apk =
    release.assets.find((a) => /release\.apk$/i.test(a.name)) ||
    release.assets.find((a) => a.name.endsWith(".apk"));
  if (!apk) return null;

  const sizeMB = (apk.size / (1024 * 1024)).toFixed(1);

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#1877F2] to-[#0D47A1] rounded-xl p-2.5 shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Update available</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {release.name || release.tag_name}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.setItem(SEEN_KEY, String(parseTagBuild(release.tag_name)));
              setDismissed(true);
            }}
            className="text-slate-400 hover:text-slate-600 p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          A new version is ready to install ({sizeMB} MB). You'll get the latest fixes and features.
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => {
              localStorage.setItem(SEEN_KEY, String(parseTagBuild(release.tag_name)));
              setDismissed(true);
            }}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Later
          </button>
          <a
            href={apk.browser_download_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1877F2] hover:bg-[#1565C0] active:bg-[#0D47A1] shadow-lg shadow-blue-500/30 transition"
          >
            <Download className="w-4 h-4" />
            Update
          </a>
        </div>
      </div>
    </div>
  );
}

function parseTagBuild(tag: string): number {
  const m = /build-(\d+)/.exec(tag || "");
  return m ? Number(m[1]) : 0;
}
