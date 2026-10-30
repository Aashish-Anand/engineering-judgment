import { expect, test } from "@playwright/test";
import { pages } from "./pages";

for (const path of pages) {
  test(`${path} has a link preview`, async ({ request }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "metadata does not depend on the viewport");
    const html = await (await request.get(path)).text();
    const meta = (key: string) => html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1];

    expect(meta("og:title")).toBeTruthy();
    expect(meta("og:description")).toBeTruthy();
    expect(meta("twitter:card")).toBe("summary_large_image");
    const image = meta("og:image");
    expect(image).toBeTruthy();
    expect(meta("twitter:image")).toBe(image);

    // og:image is absolute against the site URL, so fetch its path from the test server.
    const response = await request.get(new URL(image!.replaceAll("&amp;", "&")).pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toBe("image/png");
    const png = await response.body();
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630]);
  });
}
