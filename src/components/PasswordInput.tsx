"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./ui-core/input";

interface PasswordInputProps {
  className?: string;
  error?: string;
  isLoading?: boolean;
  label: string;
  password: string;
  onPasswordChange: (updatedPassword: string) => void;
}

/**
 * Renders an input field for passwords.
 * Allows the user to toggle the visibility of the password from obscured to visible.
 */
export const PasswordInput = ({
  className,
  error,
  isLoading,
  label,
  password,
  onPasswordChange,
}: PasswordInputProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={className}>
      <label htmlFor="password" className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Input
          id={`password-${label}`}
          type={isVisible ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
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
