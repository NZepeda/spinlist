"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";

interface PasswordInputProps {
  className?: string;
  defaultValue?: string;
  error?: string;
  id: string;
  isLoading?: boolean;
  label: string;
  name: string;
}

/**
 * Renders an input field for passwords.
 * Supports password form fields that submit native input values while preserving a local visibility toggle for the current field.
 */
export const PasswordInput = ({
  className,
  defaultValue,
  error,
  id,
  isLoading,
  label,
  name,
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          defaultValue={defaultValue}
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          placeholder="••••••••"
          aria-invalid={Boolean(error)}
          disabled={isLoading}
          required
          minLength={8}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setIsVisible(!isVisible)}
          disabled={isLoading}
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};
