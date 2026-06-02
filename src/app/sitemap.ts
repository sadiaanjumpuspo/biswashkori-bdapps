import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishwashkori.com'
  
  // Static routes
  const staticRoutes = [
    '',
    '/businesses',
    '/login',
    '/signup',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  try {
    const supabase = createClient()
    const { data: businesses } = await supabase
      .from('businesses')
      .select('slug, updated_at')
      .eq('is_active', true)

    if (businesses) {
      const businessRoutes = businesses.map((biz) => ({
        url: `${baseUrl}/business/${biz.slug}`,
        lastModified: new Date(biz.updated_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
      return [...staticRoutes, ...businessRoutes]
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return staticRoutes
}
