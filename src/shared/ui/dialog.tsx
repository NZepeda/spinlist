"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/shared/utils/cn";

const DIALOG_PRESENTATION_CLASSES = {
  "bottom-sheet":
    "inset-x-0 bottom-0 top-auto max-h-[min(85dvh,44rem)] translate-x-0 translate-y-0 rounded-t-[1.75rem] rounded-b-none border-b-0 p-6 pb-[calc(1.5rem+var(--safe-bottom))] sm:max-w-none",
  centered:
    "top-[50%] left-[50%] max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-2xl border p-6 sm:max-w-lg",
  "full-screen":
    "inset-0 h-dvh max-h-none max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-6 pt-[calc(1.5rem+var(--safe-top))] pb-[calc(1.5rem+var(--safe-bottom))]",
} as const;

type DialogPresentation = keyof typeof DIALOG_PRESENTATION_CLASSES;

/**
 * Root component for a modal dialog. Controls the open/closed state of the dialog.
 * Uses Radix UI Dialog primitive for accessibility and keyboard interactions.
 *
 * @example
 * ```tsx
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogTrigger>Open Dialog</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Title</DialogTitle>
 *     </DialogHeader>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/**
 * Button or element that triggers the dialog to open when clicked.
 *
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button>Open Settings</Button>
 *   </DialogTrigger>
 *   <DialogContent>...</DialogContent>
 * </Dialog>
 * ```
 */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/**
 * Portal component that renders dialog content in a different part of the DOM.
 * Typically used internally by DialogContent.
 */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/**
 * Button component that closes the dialog when clicked.
 *
 * @example
 * ```tsx
 * <DialogContent>
 *   <DialogHeader>
 *     <DialogTitle>Confirmation</DialogTitle>
 *   </DialogHeader>
 *   <DialogFooter>
 *     <DialogClose asChild>
 *       <Button variant="outline">Cancel</Button>
 *     </DialogClose>
 *   </DialogFooter>
 * </DialogContent>
 * ```
 */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/**
 * Semi-transparent overlay that appears behind the dialog content.
 * Clicking it will close the dialog by default.
 */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Main container for dialog content. Centers the dialog and includes animations,
 * overlay, and an optional close button (X icon).
 *
 * @param presentation - Layout used to position the surface on screen.
 * @param showCloseButton - Whether to display the close button in top-right corner (defaults to true)
 *
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger>Open</DialogTrigger>
 *   <DialogContent showCloseButton={false}>
 *     <DialogHeader>
 *       <DialogTitle>Custom Dialog</DialogTitle>
 *       <DialogDescription>No close button</DialogDescription>
 *     </DialogHeader>
 *   </DialogContent>
 * </Dialog>
 * ```
 */
function DialogContent({
  className,
  children,
  presentation = "centered",
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  presentation?: DialogPresentation;
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed z-50 grid w-full gap-4 shadow-lg duration-200",
          DIALOG_PRESENTATION_CLASSES[presentation],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 flex size-11 items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none md:size-10 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/**
 * Header section for the dialog, typically contains DialogTitle and DialogDescription.
 * Provides consistent spacing and layout.
 *
 * @example
 * ```tsx
 * <DialogContent>
 *   <DialogHeader>
 *     <DialogTitle>Delete Account</DialogTitle>
 *     <DialogDescription>
 *       This action cannot be undone.
 *     </DialogDescription>
 *   </DialogHeader>
 * </DialogContent>
 * ```
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

/**
 * Footer section for the dialog, typically contains action buttons.
 * Responsive layout that stacks vertically on mobile and horizontally on desktop.
 *
 * @example
 * ```tsx
 * <DialogContent>
 *   <DialogHeader>
 *     <DialogTitle>Confirm Action</DialogTitle>
 *   </DialogHeader>
 *   <DialogFooter>
 *     <DialogClose asChild>
 *       <Button variant="outline">Cancel</Button>
 *     </DialogClose>
 *     <Button>Confirm</Button>
 *   </DialogFooter>
 * </DialogContent>
 * ```
 */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        // [&>*] - Means "make every direct child full-width"
        // See https://tailwindcss.com/docs/hover-focus-and-other-states#using-arbitrary-variants for more information.
        "flex flex-col-reverse gap-2 [&>*]:w-full sm:flex-row sm:justify-end sm:[&>*]:w-auto",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Title component for the dialog. Automatically linked to the dialog for accessibility.
 * Should be placed within DialogHeader.
 *
 * @example
 * ```tsx
 * <DialogHeader>
 *   <DialogTitle>Account Settings</DialogTitle>
 *   <DialogDescription>Manage your account preferences</DialogDescription>
 * </DialogHeader>
 * ```
 */
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

/**
 * Description component for the dialog. Provides additional context below the title.
 * Automatically linked to the dialog for screen reader accessibility.
 *
 * @example
 * ```tsx
 * <DialogHeader>
 *   <DialogTitle>Delete File</DialogTitle>
 *   <DialogDescription>
 *     Are you sure you want to delete this file? This action cannot be undone.
 *   </DialogDescription>
 * </DialogHeader>
 * ```
 */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
