import React, { useState, useEffect } from "react";
import { parse, serialize } from "parse5";

const preprocess = (text) => {
  return text.replace(/<meta[^>]*>/gi, "").replace(/style="[^"]*"/g, "");
};

const ContentProcessor = () => {
  const [input, setInput] = useState("");
  const [plainTextOutput, setPlainTextOutput] = useState("");
  const [plainTextOutputWithoutNewlines, setPlainTextOutputWithoutNewlines] =
    useState("");
  const [formattedOutput, setFormattedOutput] = useState("");
  const [copiedType, setCopiedType] = useState(null);

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
          attrs: [],
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
    const preprocessed = preprocess(pastedText);
    setInput(preprocessed);
    const { plainText, formattedHtml } = processClipboard(preprocessed);
    setPlainTextOutput(plainText);
    setPlainTextOutputWithoutNewlines(plainText.replace(/\n\n/gi, "\n"));
    setFormattedOutput(formattedHtml);
  };

  const handleCopy = (type) => {
    let content;
    switch (type) {
      case "plain":
        content = plainTextOutput;
        navigator.clipboard.writeText(content);
        break;
      case "plainWithoutNewlines":
        content = plainTextOutputWithoutNewlines;
        navigator.clipboard.writeText(content);
        break;
      case "formatted":
        content = formattedOutput;
        const blob = new Blob([content], { type: "text/html" });
        const item = new ClipboardItem({ "text/html": blob });
        navigator.clipboard.write([item]);
        break;
      default:
        return;
    }
    setCopiedType(type);
  };

  useEffect(() => {
    if (copiedType) {
      const timer = setTimeout(() => setCopiedType(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedType]);

  const copyButtonText = (type) =>
    copiedType === type
      ? "Copied!"
      : `Copy ${type === "formatted" ? "Formatted HTML" : "Plain Text"}`;

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
          <label className="block mb-2">Formatted output for Substack:</label>
          <button
            className="mt-2 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            onClick={() => handleCopy("formatted")}
          >
            {copyButtonText("formatted")}
          </button>
          <textarea
            className="w-full h-96 p-2 border rounded"
            value={formattedOutput}
            readOnly
          />
        </div>
        <div>
          <label className="block mb-2">Plaintext output for ConvertKit:</label>
          <button
            className="mt-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            onClick={() => handleCopy("plainWithoutNewlines")}
          >
            {copyButtonText("plainWithoutNewlines")}
          </button>
          <textarea
            className="w-full h-96 p-2 border rounded"
            value={plainTextOutputWithoutNewlines}
            readOnly
          />
        </div>
        <div>
          <label className="block mb-2">Plaintext output for LinkedIn:</label>
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => handleCopy("plain")}
          >
            {copyButtonText("plain")}
          </button>
          <textarea
            className="w-full h-96 p-2 border rounded"
            value={plainTextOutput}
            readOnly
          />
        </div>
      </div>
    </div>
  );
};

export default ContentProcessor;
