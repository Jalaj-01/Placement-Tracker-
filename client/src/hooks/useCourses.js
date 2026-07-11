import { useState, useEffect } from 'react'
import { subscribeCourses, addCourseDoc, deleteCourseDoc, updateCourseNotesDoc, updateCourseProgressDoc } from '@/services/firestoreService'

export function useCourses(uid) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setCourses([])
      setLoading(false)
      return
    }
    return subscribeCourses(uid, (data) => {
      setCourses(data)
      setLoading(false)
    })
  }, [uid])

  return {
    courses,
    loading,
    addCourse: (name, url, embedId, isPlaylist) => addCourseDoc(uid, name, url, embedId, isPlaylist),
    deleteCourse: (courseId) => deleteCourseDoc(uid, courseId),
    updateNotes: (courseId, notes) => updateCourseNotesDoc(uid, courseId, notes),
    updateProgress: (courseId, progress) => updateCourseProgressDoc(uid, courseId, progress),
  }
}
