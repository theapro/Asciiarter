import * as React from "react";

import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

export type DropZoneCardProps = {
  onFile: (file: File) => void;
  isBusy?: boolean;
  fileName?: string | null;
};

export function DropZoneCard({ onFile, isBusy, fileName }: DropZoneCardProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) onFile(file);
    },
    [onFile],
  );

  const onChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith("image/")) onFile(file);
      e.target.value = "";
    },
    [onFile],
  );

  return (
    <Card id="converter" className="scroll-mt-24">
      <CardHeader>
        <CardTitle>Converter</CardTitle>
        <CardDescription>
          Drop an image or upload one — fast, lightweight, no freezing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onChange}
          disabled={isBusy}
        />

        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={
            "relative grid min-h-[220px] place-items-center rounded-lg border border-dashed p-6 text-center transition-colors " +
            (isDragging
              ? "border-primary/70 bg-primary/10"
              : "border-border/70 bg-background/10")
          }
        >
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              {fileName ? "Loaded:" : "Supported:"}{" "}
              <span className="text-foreground">jpg / png / gif / webp</span>
            </div>
            {fileName ? (
              <div className="text-base font-medium">{fileName}</div>
            ) : (
              <div className="text-base font-medium">Drop image here</div>
            )}
            <div className="pt-2">
              <Button
                variant="secondary"
                onClick={() => inputRef.current?.click()}
                disabled={isBusy}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
