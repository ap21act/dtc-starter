"use client"

import { deleteLineItem } from "@lib/data/cart"
import { useState } from "react"

const DeleteButton = ({
  id,
  children,
  className,
}: {
  id: string
  children?: React.ReactNode
  className?: string
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteLineItem(id)
    } catch (err) {
      console.error("Failed to delete item:", err)
      setIsDeleting(false)
    }
  }

  return (
    <button
      className={`flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <>
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: 14 }}>
            hourglass_empty
          </span>
          Removing...
        </>
      ) : (
        <>
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            delete
          </span>
          {children}
        </>
      )}
    </button>
  )
}

export default DeleteButton
