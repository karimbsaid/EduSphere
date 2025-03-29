/* eslint-disable react/prop-types */
import { HiOutlineDocumentArrowUp } from "react-icons/hi2";
import Button from "../ui/Button";
import { useState, useRef, useEffect } from "react";

export default function FileUploader({
  acceptedTypes = "*",
  label = "Select a file",
  onFileSelect,
  file,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (file) {
      if (typeof file === "string") {
        setSelectedFile({
          url: file,
          name: file.split("/").pop().split("#")[0].split("?")[0],
          src: acceptedTypes.startsWith("image") ? file : null,
        });
      } else {
        const fileData = {
          file,
          name: file.name,
          size: file.size,
        };
        if (acceptedTypes.startsWith("image")) {
          fileData.src = URL.createObjectURL(file);
        }
        setSelectedFile(fileData);
      }
    } else {
      setSelectedFile(null);
    }
  }, [file, acceptedTypes]);

  const validateFileType = (file) => {
    if (acceptedTypes === "*") return true;
    const validTypes = acceptedTypes.split(",").map((type) => type.trim());
    return (
      validTypes.includes(file.type) ||
      validTypes.some((ext) => file.name.endsWith(ext))
    );
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!validateFileType(file)) {
        setError(`Invalid file type. Accepted types: ${acceptedTypes}`);
        return;
      }
      setError("");
      const fileData = {
        file,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      };
      if (acceptedTypes.startsWith("image")) {
        fileData.src = URL.createObjectURL(file);
      }
      setSelectedFile(fileData);
      onFileSelect(file);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError("");
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="relative">
      <input
        type="file"
        className="hidden"
        ref={inputRef}
        accept={acceptedTypes}
        onChange={handleFileChange}
      />

      <div
        className="flex flex-col items-center justify-center w-full min-h-[200px] border-2 border-dashed 
          rounded-lg p-6 transition-colors border-primary bg-primary/5 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            {selectedFile.src ? (
              <img
                src={selectedFile.src}
                alt={selectedFile.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
                <HiOutlineDocumentArrowUp className="h-8 w-8 text-primary" />
              </div>
            )}
            <div className="text-center">
              <p className="text-lg font-medium">{selectedFile.name}</p>
              {selectedFile.size && (
                <p className="text-sm text-muted-foreground">
                  {selectedFile.size}
                </p>
              )}
            </div>
            <Button
              size="sm"
              label="Select a different file"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center">
              <HiOutlineDocumentArrowUp className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Click to browse your files
              </p>
            </div>
            <Button label={label} onClick={(e) => e.stopPropagation()} />
          </div>
        )}

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
