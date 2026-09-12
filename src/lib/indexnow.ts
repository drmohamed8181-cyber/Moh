// IndexNow submission.
//
// Google ignores IndexNow, but Bing does not, and Bing's index is what
// DuckDuckGo, Yahoo, Ecosia and Copilot search read from. For equipment a
// buyer is researching, that is a meaningful second channel, and unlike
// Search Console it needs no account: ownership is proved by serving a key
// file from the domain.
//
// The key is public by design. It has to be fetchable at the URL below for
// the protocol to work, so there is nothing here to keep secret.

export const INDEXNOW_KEY = "0c0dcd29934766f54d460987c31d6569";

const ENDPOINT = "https://api.indexnow.org/indexnow";
/** The protocol caps a single submission at 10,000 URLs. */
const MAX_URLS = 10000;

export type IndexNowResult = { submitted: number; status: number; ok: boolean; body?: string };

/**
 * Submits `urls` to IndexNow. Never throws: a search engine declining a
 * submission is not a reason to fail whatever triggered it.
 */
export async function submitToIndexNow(urls: string[], host: string): Promise<IndexNowResult> {
  const urlList = [...new Set(urls)].slice(0, MAX_URLS);
  if (urlList.length === 0) return { submitted: 0, status: 0, ok: true };

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
    });
    // 200 and 202 both mean accepted; 202 means the key is still being checked.
    const ok = response.status === 200 || response.status === 202;
    return {
      submitted: urlList.length,
      status: response.status,
      ok,
      ...(ok ? {} : { body: (await response.text()).slice(0, 200) }),
    };
  } catch (error) {
    return { submitted: 0, status: 0, ok: false, body: error instanceof Error ? error.message : "fetch failed" };
  }
}
