"use client";
import WebApp from "@twa-dev/sdk";
import { Telegram } from "@twa-dev/types";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactJson from 'react-json-view';

declare global {
  interface Window {
    Telegram: Telegram;
  }
}

type WebApp = Telegram["WebApp"];

export default function TgMiniApp() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [history, setHistory] = useState<number>(0);
  const [historyStart, setHistoryStart] = useState<number>(0);
  const [webApp, setWebApp] = useState<WebApp>();
  const [tgData, setTgData] = useState<WebApp['initDataUnsafe']>();
  const [isValidUser, setIsValidUser] = useState(false);

  async function fetchUser(webApp: WebApp | undefined) {
    const initData = webApp?.initData;
  
    if (!initData) {
      console.warn("InitData is ", initData);
    }
    try {
      const res = await fetch("/api/auth-tg-mini-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initData,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        console.error(error);
        throw new Error(error || "Failed to authenticate");
      }
      const allData = await res.json();
      setIsValidUser(allData.ok);
      delete allData.ok;
      setTgData(allData);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.warn(error.message);
    }
  }


  useEffect(() => {
    setHistory(() => window.history.length);
    setHistoryStart(() => window.history.length);
    
    const handleGoBack = () => {
      // Navigate back in the browser's history
      setHistory((prev) => prev - 2);
      router.back();
    };
  

    import("eruda").then((el) => el.default.init());
    WebApp.ready();
    WebApp.expand();
    
    setWebApp(WebApp);
    fetchUser(WebApp);

    WebApp?.BackButton.onClick(handleGoBack);

    return () => {
      WebApp?.BackButton.offClick(handleGoBack);
    };
  }, []);


  useEffect(() => {
    setHistory((prev) => (prev + 1));

      if (history > historyStart) {
        console.error('Button show');
        
        webApp?.BackButton.show();
      } else {
        webApp?.BackButton.hide();
      }

  }, [searchParams, pathname]);

  return (
    <div className="text-green-300 mt-5 md:mt-20 flex flex-col justify-center items-center">
      <p
        className={`font-bold text-lg ${
          !isValidUser
            ? "text-red-400"
            : "text-green-400 mb-4"
        }`}
      >
        User is {isValidUser ? '' : <span className="underline underline-offset-2 uppercase">not </span> }<span className="underline underline-offset-2 uppercase">verified</span>
      </p>

      <div className=" w-full md:w-[70%]">
      {tgData && tgData.user?.photo_url && (
        <div className="size-72 mx-auto mb-8">
          <Image
            className="object-cover object-center rounded-full"
            src={tgData.user.photo_url}
            alt="profile"
            width={500}
            height={500}
          />
        </div>
        )}
        {tgData && <ReactJson src={tgData} theme="codeschool" name="initData" displayDataTypes={ false } collapseStringsAfterLength={20} style={{ padding: "20px", boxSizing: "content-box"}} />}
      </div>
      {webApp && (
        <div className="flex justify-center items-center mt-5 md:mt-20">
          <button
            type="button"
            onClick={() => fetchUser(webApp)}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              LogIn
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
