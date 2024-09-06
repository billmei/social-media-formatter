import React, { useState, useEffect } from "react";
import { parse, serialize } from "parse5";

const ClipboardProcessor = () => {
  const [input, setInput] = useState("");
  const [plainTextOutput, setPlainTextOutput] = useState("");
  const [formattedOutput, setFormattedOutput] = useState("");
  const [copyStatus, setCopyStatus] = useState({
    plain: false,
    formatted: false,
  });

  const processClipboard = (text) => {
    let counter = 1;
    const referenceMap = new Map();
    const document = parse(text);

    const processNodePlainText = (node) => {
      if (node.nodeName === "#text") {
        return node.value;
      }

      if (node.nodeName === "a") {
        const content = node.childNodes.map(processNodePlainText).join("");
        if (!node.parentNode || node.parentNode.nodeName !== "sup") {
          referenceMap.set(counter, content);
          return `${content}[${counter++}]`;
        }
        return content;
      }

      if (node.nodeName === "sup") {
        const content = node.childNodes.map(processNodePlainText).join("");
        referenceMap.set(counter, content);
        return `[${counter++}]`;
      }

      if (node.nodeName === "p") {
        return "\n\n" + node.childNodes.map(processNodePlainText).join("");
      }

      if (node.nodeName === "br") {
        return "\n";
      }

      if (node.nodeName.match(/^h[1-6]$/)) {
        // Make headers bold unicode text
        const content = node.childNodes.map(processNodePlainText).join("");
        return (
          "\n\n" +
          content
            .split("")
            .map((char) => {
              if (char >= "a" && char <= "z") {
                return String.fromCodePoint(
                  char.charCodeAt(0) + ("𝗮".codePointAt(0) - "a".charCodeAt(0))
                );
              } else if (char >= "A" && char <= "Z") {
                return String.fromCodePoint(
                  char.charCodeAt(0) + ("𝗔".codePointAt(0) - "A".charCodeAt(0))
                );
              }
              return char;
            })
            .join("") +
          "\n\n"
        );
      }

      return node.childNodes
        ? node.childNodes.map(processNodePlainText).join("")
        : "";
    };

    const processNodeFormatted = (node) => {
      if (node.nodeName === "sup") {
        // Replace the `<sup>` with a `<span>`
        return {
          nodeName: "span",
          tagName: "span",
          namespaceURI: "http://www.w3.org/1999/xhtml",
          childNodes: node.childNodes.map(processNodeFormatted),
        };
      }

      // If this is a footnote, wrap it in []
      if (node.nodeName === "a" && node?.parentNode?.nodeName === "sup") {
        node.attrs = node.attrs.filter(
          // Substack already has .footnote as a classname, so we need to remove it to avoid namespace collision
          (attr) => attr.name !== "class" && attr.name !== "rel"
        );

        const openBracketNode = {
          nodeName: "#text",
          value: "[",
          parentNode: node,
        };
        const closeBracketNode = {
          nodeName: "#text",
          value: "]",
          parentNode: node,
        };

        node.childNodes = [
          openBracketNode,
          ...node.childNodes,
          closeBracketNode,
        ];
      } else if (node.childNodes) {
        node.childNodes = node.childNodes.map(processNodeFormatted);
      }

      return node;
    };

    const plainText = processNodePlainText(document)
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const formattedDocument = processNodeFormatted(document);
    const formattedHtml = serialize(formattedDocument);

    return { plainText, formattedHtml };
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText =
      e.clipboardData.getData("text/html") || e.clipboardData.getData("text");
    handleInput(pastedText);
  };

  const handleInput = (pastedText) => {
    setInput(pastedText);
    const { plainText, formattedHtml } = processClipboard(pastedText);
    setPlainTextOutput(plainText);
    setFormattedOutput(formattedHtml);
  };

  const handleCopyPlainText = () => {
    navigator.clipboard.writeText(plainTextOutput);
    setCopyStatus({ ...copyStatus, plain: true });
  };

  const handleCopyFormatted = () => {
    const blob = new Blob([formattedOutput], { type: "text/html" });
    const item = new ClipboardItem({ "text/html": blob });
    navigator.clipboard.write([item]);
    setCopyStatus({ ...copyStatus, formatted: true });
  };

  useEffect(() => {
    if (copyStatus.plain) {
      const timer = setTimeout(
        () => setCopyStatus({ ...copyStatus, plain: false }),
        2000
      );
      return () => clearTimeout(timer);
    }
  }, [copyStatus.plain]);

  useEffect(() => {
    if (copyStatus.formatted) {
      const timer = setTimeout(
        () => setCopyStatus({ ...copyStatus, formatted: false }),
        2000
      );
      return () => clearTimeout(timer);
    }
  }, [copyStatus.formatted]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Link formatter for social media
      </h1>
      <div className="mb-4">
        <label className="block mb-2">Paste your content here:</label>
        <textarea
          className="w-full h-40 p-2 border rounded"
          onPaste={handlePaste}
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Paste your content here..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-2">Plaintext output for LinkedIn:</label>
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleCopyPlainText}
          >
            {copyStatus.plain ? "Copied!" : "Copy Plain Text"}
          </button>
          <textarea
            className="w-full h-96 p-2 border rounded"
            value={plainTextOutput}
            readOnly
          />
        </div>
        <div>
          <label className="block mb-2">Formatted output for Substack:</label>
          <button
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleCopyFormatted}
          >
            {copyStatus.formatted ? "Copied!" : "Copy Formatted HTML"}
          </button>
          <textarea
            className="w-full h-96 p-2 border rounded"
            value={formattedOutput}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default ClipboardProcessor;
