import { useCallback, useEffect, useRef, type RefObject } from "react";
import type { WebView } from "react-native-webview";

import { useUserBindStore } from "@/store/user-bind";

const LOGIN_URL_PATTERN = "zhlgd.whut.edu.cn/tpass/login";

function buildAutoFillScript(username: string, password: string) {
  const u = JSON.stringify(username);
  const p = JSON.stringify(password);
  return `(function check(){
  var ui=document.querySelector('#un');
  var pi=document.querySelector('#pd');
  if(!ui||!pi){setTimeout(check,300);return;}
  var ns=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
  ns.call(ui,${u});ns.call(pi,${p});
  ui.dispatchEvent(new Event('input',{bubbles:true}));
  pi.dispatchEvent(new Event('input',{bubbles:true}));
  ui.dispatchEvent(new Event('change',{bubbles:true}));
  pi.dispatchEvent(new Event('change',{bubbles:true}));
  var btn=document.querySelector('#index_login_btn');
  if(btn)setTimeout(function(){btn.click();},100);
})();true;`;
}

export function useZhlgdAutoLogin(webviewRef: RefObject<WebView | null>) {
  const creds = useRef<{ username: string; password: string } | null>(null);
  const lastFilledUrl = useRef("");

  useEffect(() => {
    useUserBindStore
      .getState()
      .getCredentials()
      .then((c) => {
        creds.current = c;
      });
  }, []);

  const onLoadEnd = useCallback(
    (e: { nativeEvent: { url: string } }) => {
      const url = e.nativeEvent.url;
      if (!url.includes(LOGIN_URL_PATTERN)) {
        lastFilledUrl.current = "";
        return;
      }

      if (!creds.current || lastFilledUrl.current === url) return;
      lastFilledUrl.current = url;

      webviewRef.current?.injectJavaScript(
        buildAutoFillScript(creds.current.username, creds.current.password),
      );
    },
    [webviewRef],
  );

  return { onLoadEnd };
}
