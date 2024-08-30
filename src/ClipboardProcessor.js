import React, { useState } from "react";

const ClipboardProcessor = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const processClipboard = (text) => {
    let counter = 1;
    const linkMap = new Map();
    const footnoteMap = new Map();

    // Step 1: Convert to plaintext and collect links and footnotes
    const plainText = text
      .replace(
        /<a(?:\s+(?:href="[^"]*")?)[^>]*>(.*?)<\/a>/gi,
        (match, content) => {
          linkMap.set(counter, content);
          return `${content}[${counter++}]`;
        }
      )
      .replace(/<sup>(\d+)<\/sup>/gi, (match, number) => {
        footnoteMap.set(counter, number);
        return `[${counter++}]`;
      })
      .replace(/<p>/gi, "\n\n") // Preserve paragraph breaks
      .replace(/<br\s*\/?>/gi, "\n") // Preserve line breaks
      .replace(/<[^>]+>/g, "") // Remove any remaining HTML tags
      .replace(/\n{3,}/g, "\n\n") // Remove excessive newlines
      .trim(); // Trim leading and trailing whitespace

    // Step 2 & 3: Generate references
    const references = [...linkMap.entries(), ...footnoteMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([index, content]) => `[${index}] ${content}`)
      .join("\n");

    return plainText + "\n\nReferences:\n" + references;
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText =
      e.clipboardData.getData("text/html") || e.clipboardData.getData("text");
    handleInput(pastedText);
  };

  const handleInput = (pastedText) => {
    setInput(pastedText);
    setOutput(processClipboard(pastedText));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
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
      <div className="mb-4">
        <label className="block mb-2">Processed output:</label>
        <textarea
          className="w-full h-40 p-2 border rounded"
          value={output}
          readOnly
        />
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        onClick={handleCopy}
      >
        Copy Processed Text
      </button>
    </div>
  );
};

export default ClipboardProcessor;
