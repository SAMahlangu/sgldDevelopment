// API Service for SGLD Backend Integration with Supabase
import { supabase } from '../config/supabase'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Authentication APIs
export const authService = {
  signup: async (email, password, name, role, additionalData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (authError) throw authError

      const { data: userData, error: dbError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email,
          name,
          role,
          status: role === 'student' ? 'active' : 'pending_approval',
          ...additionalData
        }])
        .select()
        .single()

      if (dbError) throw dbError
      return { success: true, data: userData }
    } catch (error) {
      return { error: error.message }
    }
  },

  login: async (email, password, role) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (authError) throw authError

      const { data: userData, error: dbError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .eq('role', role)
        .single()

      if (dbError) throw dbError
      return { success: true, data: userData, session: authData.session }
    } catch (error) {
      return { error: error.message }
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Student APIs
export const studentService = {
  submitConcern: async (userId, title, description) => {
    try {
      const { data, error } = await supabase
        .from('concerns')
        .insert([{
          user_id: userId,
          title,
          description,
          status: 'open',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getConcerns: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('concerns')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  votePoll: async (userId, pollId, selectedOption) => {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .insert([{
          user_id: userId,
          poll_id: pollId,
          selected_option: selectedOption,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getPolls: async () => {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select('*')

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  }
}

// News APIs
export const newsService = {
  // Upload image to storage and return URL
  uploadNewsImage: async (file, userId) => {
    try {
      if (!file) return null

      // Create file path: news/userId/timestamp-filename
      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name}`
      const filePath = `news/${userId}/${fileName}`

      // Upload file to storage bucket
      const { data, error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('news-images')
        .getPublicUrl(filePath)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error('Image upload error:', error)
      return { error: error.message }
    }
  },

  createNews: async (title, description, imageFile, userId) => {
    try {
      let imageUrl = null

      // Upload image if file is provided
      if (imageFile) {
        const uploaded = await newsService.uploadNewsImage(imageFile, userId)
        if (uploaded && !uploaded.error) {
          imageUrl = uploaded
        }
      }

      // Insert news record with image URL
      const { data, error } = await supabase
        .from('news')
        .insert([{
          title,
          description,
          image_url: imageUrl,
          created_by: userId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getNews: async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  updateNews: async (newsId, title, description, imageUrl) => {
    try {
      const { data, error } = await supabase
        .from('news')
        .update({
          title,
          description,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', newsId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  deleteNews: async (newsId) => {
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Events APIs
export const eventsService = {
  createEvent: async (title, location, date, time, description, userId) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          title,
          location,
          event_date: date,
          event_time: time,
          description,
          created_by: userId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getEvents: async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  updateEvent: async (eventId, title, location, date, time, description) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          title,
          location,
          event_date: date,
          event_time: time,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  deleteEvent: async (eventId) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Admin APIs
export const adminService = {
  // Statistics
  getDashboardStatistics: async () => {
    try {
      const { data: dashboardStats, error: statsError } = await supabase
        .rpc('get_admin_statistics')
      
      if (statsError) throw statsError
      return dashboardStats
    } catch (error) {
      return { error: error.message }
    }
  },

  // User Management
  getAllUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role, status, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getPendingUsers: async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  approveUser: async (userId) => {
    try {
      const { data, error } = await supabase.rpc('approve_pending_user', {
        user_id_param: userId
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { error: error.message }
    }
  },

  rejectUser: async (userId) => {
    try {
      const { data, error } = await supabase.rpc('reject_pending_user', {
        user_id_param: userId
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { error: error.message }
    }
  },

  suspendUser: async (userId, reason, days = null) => {
    try {
      const { data, error } = await supabase.rpc('suspend_user', {
        user_id_param: userId,
        reason_param: reason,
        days_param: days
      })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Policy Management
  createPolicy: async (title, description, content) => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .insert([{
          title,
          description,
          content,
          status: 'pending',
          created_by: (await supabase.auth.getUser()).data.user.id
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getPolicies: async (status = null) => {
    try {
      let query = supabase.from('policies').select('*')
      
      if (status) {
        query = query.eq('status', status)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  approvePolicy: async (policyId) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user.id
      
      const { data, error } = await supabase
        .from('policies')
        .update({
          status: 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString()
        })
        .eq('id', policyId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  rejectPolicy: async (policyId) => {
    try {
      const { data, error } = await supabase
        .from('policies')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', policyId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  // Reports
  createReport: async (reportType, title, data) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user.id
      
      const { data: reportData, error } = await supabase
        .from('system_reports')
        .insert([{
          report_type: reportType,
          title,
          data,
          generated_by: userId
        }])
        .select()
        .single()

      if (error) throw error
      return reportData
    } catch (error) {
      return { error: error.message }
    }
  },

  getReportsByType: async (reportType) => {
    try {
      const { data, error } = await supabase
        .from('system_reports')
        .select('*')
        .eq('report_type', reportType)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  // Audit Logs
  getAdminLogs: async (limit = 50) => {
    try {
      const { data, error } = await supabase
        .from('admin_logs')
        .select(`
          *,
          admin:admin_id(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getAuditTrail: async (limit = 100) => {
    try {
      const { data, error } = await supabase
        .from('audit_trail')
        .select(`
          *,
          user:user_id(name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  // SRC Management (for admins)
  createSRC: async (name, email, password, adminId, campus) => {
    try {
      const { data, error } = await supabase
        .from('srcs')
        .insert([{
          name,
          email,
          password,
          admin_id: adminId,
          campus,
          status: 'active',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getAdminSRCs: async (adminId) => {
    try {
      const { data, error } = await supabase
        .from('srcs')
        .select('*')
        .eq('admin_id', adminId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getSRCsByAdminAndCampus: async (adminId, campus) => {
    try {
      const { data, error } = await supabase
        .from('srcs')
        .select('*')
        .eq('admin_id', adminId)
        .eq('campus', campus)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  updateSRC: async (srcId, name, email) => {
    try {
      const { data, error } = await supabase
        .from('srcs')
        .update({
          name,
          email,
          updated_at: new Date().toISOString()
        })
        .eq('id', srcId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  deactivateSRC: async (srcId) => {
    try {
      const { data, error } = await supabase
        .from('srcs')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', srcId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  activateSRC: async (srcId) => {
    try {
      const { data, error } = await supabase
        .from('srcs')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', srcId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  deleteSRC: async (srcId) => {
    try {
      const { error } = await supabase
        .from('srcs')
        .delete()
        .eq('id', srcId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  },

  // SFC (Student Finance Coordinator) Management (for admins)
  createSFC: async (name, email, password, adminId, campus) => {
    try {
      const { data, error } = await supabase
        .from('sfcs')
        .insert([{
          name,
          email,
          password,
          admin_id: adminId,
          campus,
          status: 'active',
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getAdminSFCs: async (adminId) => {
    try {
      const { data, error } = await supabase
        .from('sfcs')
        .select('*')
        .eq('admin_id', adminId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getSFCsByAdminAndCampus: async (adminId, campus) => {
    try {
      const { data, error } = await supabase
        .from('sfcs')
        .select('*')
        .eq('admin_id', adminId)
        .eq('campus', campus)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  updateSFC: async (sfcId, name, email) => {
    try {
      const { data, error } = await supabase
        .from('sfcs')
        .update({
          name,
          email,
          updated_at: new Date().toISOString()
        })
        .eq('id', sfcId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  deactivateSFC: async (sfcId) => {
    try {
      const { data, error } = await supabase
        .from('sfcs')
        .update({
          status: 'inactive',
          updated_at: new Date().toISOString()
        })
        .eq('id', sfcId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  activateSFC: async (sfcId) => {
    try {
      const { data, error } = await supabase
        .from('sfcs')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', sfcId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  deleteSFC: async (sfcId) => {
    try {
      const { error } = await supabase
        .from('sfcs')
        .delete()
        .eq('id', sfcId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// SRC APIs
export const srcService = {
  createMeeting: async (srcId, title, date, time, location) => {
    try {
      const response = await fetch(`${API_BASE_URL}/src/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srcId, title, date, time, location })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  getMeetings: async (srcId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/src/${srcId}/meetings`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  publishUpdate: async (srcId, title, content) => {
    try {
      const response = await fetch(`${API_BASE_URL}/src/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ srcId, title, content })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  getRequests: async (srcId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/src/${srcId}/requests`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  respondToRequest: async (requestId, response) => {
    try {
      const apiResponse = await fetch(`${API_BASE_URL}/src/requests/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      })
      return await apiResponse.json()
    } catch (error) {
      return { error: error.message }
    }
  }
}

// SRC Communication APIs (Messaging & Documents)
export const communicationService = {
  // Message Functions
  sendMessage: async (srcId, adminId, senderId, senderType, message) => {
    try {
      const { data, error } = await supabase
        .from('src_admin_messages')
        .insert([{
          src_id: srcId,
          admin_id: adminId,
          sender_id: senderId,
          sender_type: senderType,
          message
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getConversation: async (srcId, adminId) => {
    try {
      const { data, error } = await supabase
        .from('src_admin_messages')
        .select('*')
        .or(`and(src_id.eq.${srcId},admin_id.eq.${adminId}),and(src_id.eq.${srcId},admin_id.eq.${adminId})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // Mark as read
      await supabase
        .from('src_admin_messages')
        .update({ read_status: true })
        .eq('src_id', srcId)
        .eq('admin_id', adminId)

      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getSRCUnreadCount: async (srcId) => {
    try {
      const { data, error, count } = await supabase
        .from('src_admin_messages')
        .select('*', { count: 'exact', head: true })
        .eq('src_id', srcId)
        .eq('read_status', false)
        .eq('sender_type', 'admin')

      if (error) throw error
      return count || 0
    } catch (error) {
      return 0
    }
  },

  getAdminUnreadCount: async (adminId) => {
    try {
      const { data, error, count } = await supabase
        .from('src_admin_messages')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', adminId)
        .eq('read_status', false)
        .eq('sender_type', 'src')

      if (error) throw error
      return count || 0
    } catch (error) {
      return 0
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const { error } = await supabase
        .from('src_admin_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Document Functions
  uploadDocument: async (file, srcId, adminId, uploadedById, uploadedByType, description) => {
    try {
      if (!file) throw new Error('No file provided')

      // Create unique file path
      const timestamp = Date.now()
      const fileName = `${uploadedByType}_${timestamp}_${file.name}`
      const filePath = `src-docs/${srcId}/${fileName}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('src-documents')
        .upload(filePath, file, { upsert: false })

      if (uploadError) throw uploadError

      // Create document record in database
      const { data, error } = await supabase
        .from('src_documents')
        .insert([{
          src_id: srcId,
          admin_id: adminId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by_id: uploadedById,
          uploaded_by_type: uploadedByType,
          description
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { error: error.message }
    }
  },

  getDocumentsForSRC: async (srcId, adminId) => {
    try {
      const { data, error } = await supabase
        .from('src_documents')
        .select('*')
        .eq('src_id', srcId)
        .eq('admin_id', adminId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getDocumentsForAdmin: async (adminId) => {
    try {
      const { data, error } = await supabase
        .from('src_documents')
        .select('*')
        .eq('admin_id', adminId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  downloadDocument: async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from('src-documents')
        .download(filePath)

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  deleteDocument: async (docId, filePath) => {
    try {
      // Delete from storage
      await supabase.storage
        .from('src-documents')
        .remove([filePath])

      // Update status in database
      const { error } = await supabase
        .from('src_documents')
        .update({ status: 'deleted' })
        .eq('id', docId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// SFC Communication APIs (Messaging & Documents)
export const sfcCommunicationService = {
  // Message Functions
  sendMessage: async (sfcId, adminId, senderId, senderType, message) => {
    try {
      const { data, error } = await supabase
        .from('sfc_admin_messages')
        .insert([{
          sfc_id: sfcId,
          admin_id: adminId,
          sender_id: senderId,
          sender_type: senderType,
          message
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getConversation: async (sfcId, adminId) => {
    try {
      const { data, error } = await supabase
        .from('sfc_admin_messages')
        .select('*')
        .or(`and(sfc_id.eq.${sfcId},admin_id.eq.${adminId}),and(sfc_id.eq.${sfcId},admin_id.eq.${adminId})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // Mark as read
      await supabase
        .from('sfc_admin_messages')
        .update({ read_status: true })
        .eq('sfc_id', sfcId)
        .eq('admin_id', adminId)

      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getSFCUnreadCount: async (sfcId) => {
    try {
      const { data, error, count } = await supabase
        .from('sfc_admin_messages')
        .select('*', { count: 'exact', head: true })
        .eq('sfc_id', sfcId)
        .eq('read_status', false)
        .eq('sender_type', 'admin')

      if (error) throw error
      return count || 0
    } catch (error) {
      return 0
    }
  },

  getAdminUnreadCount: async (adminId) => {
    try {
      const { data, error, count } = await supabase
        .from('sfc_admin_messages')
        .select('*', { count: 'exact', head: true })
        .eq('admin_id', adminId)
        .eq('read_status', false)
        .eq('sender_type', 'sfc')

      if (error) throw error
      return count || 0
    } catch (error) {
      return 0
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const { error } = await supabase
        .from('sfc_admin_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  },

  // Document Functions
  uploadDocument: async (file, sfcId, adminId, uploadedById, uploadedByType, description) => {
    try {
      if (!file) throw new Error('No file provided')

      // Create unique file path
      const timestamp = Date.now()
      const fileName = `${uploadedByType}_${timestamp}_${file.name}`
      const filePath = `sfc-docs/${sfcId}/${fileName}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('sfc-documents')
        .upload(filePath, file, { upsert: false })

      if (uploadError) throw uploadError

      // Create document record in database
      const { data, error } = await supabase
        .from('sfc_documents')
        .insert([{
          sfc_id: sfcId,
          admin_id: adminId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by_id: uploadedById,
          uploaded_by_type: uploadedByType,
          description
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { error: error.message }
    }
  },

  getDocumentsForSFC: async (sfcId, adminId) => {
    try {
      const { data, error } = await supabase
        .from('sfc_documents')
        .select('*')
        .eq('sfc_id', sfcId)
        .eq('admin_id', adminId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  getDocumentsForAdmin: async (adminId) => {
    try {
      const { data, error } = await supabase
        .from('sfc_documents')
        .select('*')
        .eq('admin_id', adminId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  downloadDocument: async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from('sfc-documents')
        .download(filePath)

      if (error) throw error
      return data
    } catch (error) {
      return { error: error.message }
    }
  },

  deleteDocument: async (docId, filePath) => {
    try {
      // Delete from storage
      await supabase.storage
        .from('sfc-documents')
        .remove([filePath])

      // Update status in database
      const { error } = await supabase
        .from('sfc_documents')
        .update({ status: 'deleted' })
        .eq('id', docId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { error: error.message }
    }
  }
}

// Common APIs
export const commonService = {
  getEvents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  getNews: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/news`)
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  },

  submitContactForm: async (name, email, subject, message) => {
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      })
      return await response.json()
    } catch (error) {
      return { error: error.message }
    }
  }
}
