import React, { useState } from "react";

const URLProcessor = () => {
  const [originalURL, setOriginalURL] = useState("");
  const [slug, setSlug] = useState("");
  const [substackPostURL, setSubstackPostURL] = useState("");
  const [substackCommentsURL, setSubstackCommentsURL] = useState("");
  const [copiedType, setCopiedType] = useState(null);

  const handleOriginalURLChange = (e) => {
    const url = e.target.value;
    setOriginalURL(url);

    // Extract the slug from the URL
    const match = url.match(/\/([^\/]+)$/);
    if (match) {
      const extractedSlug = match[1];
      setSlug(extractedSlug);
      setSubstackPostURL(`https://billmei.substack.com/p/${extractedSlug}`);
      setSubstackCommentsURL(
        `https://billmei.substack.com/p/${extractedSlug}/comments`
      );
    } else {
      setSlug("");
      setSubstackPostURL("");
      setSubstackCommentsURL("");
    }
  };

  const handleCopy = (type) => {
    let content;
    switch (type) {
      case "slug":
        content = slug;
        break;
      case "substackPost":
        content = substackPostURL;
        break;
      case "substackComments":
        content = substackCommentsURL;
        break;
      default:
        return;
    }
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const copyButtonText = (type) => {
    let content;
    switch (type) {
      case "slug":
        content = "slug";
        break;
      case "substackPost":
        content = "Substack Post URL";
        break;
      case "substackComments":
        content = "Substack Comments URL";
        break;
      default:
        return;
    }
    return copiedType === type ? "Copied!" : `Copy ${content}`;
  };

  return (
    <div className="mb-8">
      <div className="mb-4">
        <label className="block mb-2">Past original URL here:</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={originalURL}
          onChange={handleOriginalURLChange}
          placeholder="https://billmei.net/blog/slug"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block mb-2">Slug:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={slug}
            readOnly
          />
          <button
            className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => handleCopy("slug")}
          >
            {copyButtonText("slug")}
          </button>
        </div>
        <div>
          <label className="block mb-2">Substack post URL:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={substackPostURL}
            readOnly
          />
          <button
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => handleCopy("substackPost")}
          >
            {copyButtonText("substackPost")}
          </button>
        </div>
        <div>
          <label className="block mb-2">Substack comments URL:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={substackCommentsURL}
            readOnly
          />
          <button
            className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            onClick={() => handleCopy("substackComments")}
          >
            {copyButtonText("substackComments")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default URLProcessor;
