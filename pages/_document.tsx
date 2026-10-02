// _document.tsx
import Document, { Html, Head, Main, NextScript } from "next/document";

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head />
        <body>
          {/* <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5SJVF6S5" height="0" width="0" style={{ display: "none", visibility: "hidden" }}/></noscript> */}
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}