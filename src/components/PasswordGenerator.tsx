import { useState } from "react";

const generatePassword = (length = 16) => {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

const PasswordGenerator = ({ onGenerate }: { onGenerate?: (pw: string) => void }) => {
  const [password, setPassword] = useState(generatePassword());

  const handleGenerate = () => {
    const newPassword = generatePassword();
    setPassword(newPassword);
    if (onGenerate) onGenerate(newPassword);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    alert("Password copied to clipboard!");
  };

  return (
    <div className="bg-gray-100 p-4 rounded shadow-sm mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm break-all">{password}</span>
        <div className="space-x-2">
          <button
            onClick={handleGenerate}
            className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Generate
          </button>
          <button
            onClick={handleCopy}
            className="text-sm bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-800"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;
