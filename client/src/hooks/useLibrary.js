import { useState, useEffect } from 'react'
import { subscribeLibrary, addLibraryDoc, deleteLibraryDoc } from '@/services/firestoreService'

export function useLibrary(uid) {
  const [libraryDocs, setLibraryDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setLibraryDocs([])
      setLoading(false)
      return
    }
    return subscribeLibrary(uid, (data) => {
      setLibraryDocs(data)
      setLoading(false)
    })
  }, [uid])

  return {
    libraryDocs,
    loading,
    addDoc: (name, url, type, size) => addLibraryDoc(uid, name, url, type, size),
    deleteDoc: (docId) => deleteLibraryDoc(uid, docId),
  }
}
