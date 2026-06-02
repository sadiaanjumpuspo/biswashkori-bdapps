import { createClient } from './supabase/client'

/**
 * Uploads a business logo to the 'business-logos' public bucket.
 * Uses the business slug and original extension to create a unique filename.
 */
export async function uploadBusinessLogo(file: File, businessSlug: string): Promise<string> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const filePath = `${businessSlug}/logo-${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('business-logos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    throw new Error(`Logo upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from('business-logos').getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Uploads a business cover image to the 'business-covers' public bucket.
 */
export async function uploadBusinessCover(file: File, businessSlug: string): Promise<string> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const filePath = `${businessSlug}/cover-${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('business-covers')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    throw new Error(`Cover upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from('business-covers').getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Uploads a user avatar to the 'avatars' public bucket.
 */
export async function uploadUserAvatar(file: File, userId: string): Promise<string> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) {
    throw new Error(`Avatar upload failed: ${error.message}`)
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Uploads claim proof documents to the 'claim-documents' private bucket.
 * Returns the storage path which can be used to generate signed URLs for admins.
 */
export async function uploadClaimDocument(file: File, userId: string): Promise<string> {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/claim-${Date.now()}.${fileExt}`

  const { error } = await supabase.storage
    .from('claim-documents')
    .upload(filePath, file, {
      cacheControl: '86400',
      upsert: true,
    })

  if (error) {
    throw new Error(`Claim document upload failed: ${error.message}`)
  }

  return filePath
}

/**
 * Generates a signed access URL for a file in the private 'claim-documents' bucket.
 * Accessible only by administrators.
 */
export async function getClaimDocumentSignedUrl(filePath: string): Promise<string> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from('claim-documents')
    .createSignedUrl(filePath, 3600) // 1 hour link expiry

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }

  return data.signedUrl
}
