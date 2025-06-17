import { useState } from "react";

type Props = {
  onFetch: (url: string) => void;
};

const RepoInput = ({ onFetch }: Props) => {
  const [url, setUrl] = useState("");

  return (
    <div className="flex gap-4 items-center">
      <input
        className="border p-2 rounded w-full"
        type="text"
        placeholder="Enter GitHub repo URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => onFetch(url)}
      >
        Fetch Files
      </button>
    </div>
  );
};

export default RepoInput;
