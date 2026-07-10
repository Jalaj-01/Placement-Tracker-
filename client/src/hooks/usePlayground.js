import { useState, useEffect } from 'react'
import { subscribePlaygroundFiles, savePlaygroundFile, deletePlaygroundFile } from '@/services/firestoreService'

export function usePlayground(uid) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) { setLoading(false); return }
    return subscribePlaygroundFiles(uid, (data) => {
      setFiles(data)
      setLoading(false)
    })
  }, [uid])

  return {
    files,
    loading,
    saveFile: (fileId, name, code) => savePlaygroundFile(uid, fileId, name, code),
    deleteFile: (fileId) => deletePlaygroundFile(uid, fileId),
  }
}
