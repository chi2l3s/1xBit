"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { HelpCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"

interface GameHelpModalProps {
  title: string
  description?: string
  children: ReactNode
}

export function GameHelpModal({ title, description, children }: GameHelpModalProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3 text-xs gap-1 border-dashed"
        onClick={() => setOpen(true)}
      >
        <HelpCircle className="h-3.5 w-3.5" />
        How to play
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-md rounded-2xl glass border border-border/70 p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-lg font-semibold">{title}</h2>
                  {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted/60 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="text-xs text-muted-foreground space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {children}
              </div>

              <div className="mt-4 flex justify-end">
                <Button size="sm" onClick={() => setOpen(false)}>
                  Got it
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

