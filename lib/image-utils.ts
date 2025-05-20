// Function to get optimized image URL
export function getOptimizedImageUrl(url: string, width = 800): string {
  // If it's already a placeholder, return it
  if (!url || url.includes("/placeholder.svg")) {
    return url || `/placeholder.svg?height=${width / 2}&width=${width}`
  }

  // If it's a relative URL, return it
  if (url.startsWith("/")) {
    return url
  }

  try {
    // Check if the URL is valid
    new URL(url)

    // For external images, we can use a proxy service or return the original
    // In a production app, you might want to use a service like Cloudinary or Imgix
    return url
  } catch (error) {
    console.error("Invalid image URL:", url, error)
    return `/placeholder.svg?height=${width / 2}&width=${width}`
  }
}

// Function to extract image from article content if none is provided
export function extractImageFromContent(content: string): string | null {
  if (!content) return null

  try {
    // Simple regex to find image URLs in content
    const imgRegex = /<img.*?src=["'](.*?)["']/
    const match = content.match(imgRegex)

    if (match && match[1]) {
      return match[1]
    }

    // Try to find URLs that look like images
    const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/i
    const urlMatch = content.match(urlRegex)

    if (urlMatch && urlMatch[1]) {
      return urlMatch[1]
    }
  } catch (error) {
    console.error("Error extracting image from content:", error)
  }

  return null
}

// Function to validate image URL by checking if it loads
export async function validateImageUrl(url: string): Promise<boolean> {
  if (!url || url.includes("/placeholder.svg")) {
    return false
  }

  try {
    const response = await fetch(url, { method: "HEAD" })
    const contentType = response.headers.get("content-type")
    return response.ok && contentType ? contentType.startsWith("image/") : false
  } catch (error) {
    console.error("Error validating image URL:", error)
    return false
  }
}
