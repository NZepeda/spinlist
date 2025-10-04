"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Command component that provides a base container for building command palettes,
 * autocomplete search interfaces, and filterable lists. Built on top of cmdk.
 *
 * @example
 * ```tsx
 * <Command>
 *   <CommandInput placeholder="Search..." />
 *   <CommandList>
 *     <CommandGroup heading="Suggestions">
 *       <CommandItem>Item 1</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </Command>
 * ```
 */
function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props}
    />
  )
}

/**
 * A modal dialog wrapper for the Command component. Displays the command palette
 * in a centered dialog with an overlay, perfect for global search features activated
 * by keyboard shortcuts.
 *
 * @param title - Screen reader title for the dialog (defaults to "Command Palette")
 * @param description - Screen reader description (defaults to "Search for a command to run...")
 * @param showCloseButton - Whether to show the close button (defaults to true)
 *
 * @example
 * ```tsx
 * <CommandDialog open={open} onOpenChange={setOpen}>
 *   <CommandInput placeholder="Type a command..." />
 *   <CommandList>
 *     <CommandGroup heading="Actions">
 *       <CommandItem>New File</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </CommandDialog>
 * ```
 */
function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Input field for the Command component with an integrated search icon.
 * Automatically filters CommandItem children based on the input value.
 *
 * @example
 * ```tsx
 * <Command>
 *   <CommandInput placeholder="Search files..." />
 * </Command>
 * ```
 */
function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

/**
 * Scrollable container for CommandGroup and CommandItem components.
 * Automatically handles keyboard navigation and manages the visible area
 * with a max height of 300px.
 *
 * @example
 * ```tsx
 * <Command>
 *   <CommandInput />
 *   <CommandList>
 *     <CommandGroup>...</CommandGroup>
 *   </CommandList>
 * </Command>
 * ```
 */
function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        className
      )}
      {...props}
    />
  )
}

/**
 * Displayed when no CommandItem components match the current search query.
 * Centered text that provides feedback when the filter yields no results.
 *
 * @example
 * ```tsx
 * <CommandList>
 *   <CommandEmpty>No results found.</CommandEmpty>
 *   <CommandGroup>...</CommandGroup>
 * </CommandList>
 * ```
 */
function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm"
      {...props}
    />
  )
}

/**
 * Groups related CommandItem components together under an optional heading.
 * Useful for categorizing search results or command options.
 *
 * @example
 * ```tsx
 * <CommandList>
 *   <CommandGroup heading="Files">
 *     <CommandItem>index.tsx</CommandItem>
 *     <CommandItem>App.tsx</CommandItem>
 *   </CommandGroup>
 *   <CommandGroup heading="Actions">
 *     <CommandItem>New File</CommandItem>
 *   </CommandGroup>
 * </CommandList>
 * ```
 */
function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  )
}

/**
 * Visual separator to divide sections within a Command component.
 * Renders as a horizontal line with subtle styling.
 *
 * @example
 * ```tsx
 * <CommandList>
 *   <CommandGroup heading="Recent">...</CommandGroup>
 *   <CommandSeparator />
 *   <CommandGroup heading="All Files">...</CommandGroup>
 * </CommandList>
 * ```
 */
function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  )
}

/**
 * Individual selectable item within a Command component. Supports keyboard navigation,
 * selection states, and can be disabled. Use the `onSelect` prop to handle item selection.
 *
 * @example
 * ```tsx
 * <CommandGroup>
 *   <CommandItem onSelect={() => openFile('index.tsx')}>
 *     <FileIcon />
 *     index.tsx
 *   </CommandItem>
 *   <CommandItem disabled>
 *     Locked File
 *   </CommandItem>
 * </CommandGroup>
 * ```
 */
function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

/**
 * Displays keyboard shortcuts aligned to the right of a CommandItem.
 * Useful for showing keyboard hints or hotkeys for commands.
 *
 * @example
 * ```tsx
 * <CommandItem>
 *   New File
 *   <CommandShortcut>⌘N</CommandShortcut>
 * </CommandItem>
 * <CommandItem>
 *   Copy
 *   <CommandShortcut>⌘C</CommandShortcut>
 * </CommandItem>
 * ```
 */
function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
