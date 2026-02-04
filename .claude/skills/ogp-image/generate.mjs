#!/usr/bin/env node

/**
 * OGP Image Generator with Multimodal Input
 *
 * Usage: node generate.mjs "<prompt>" "<output_path>" "<system_prompt_file>" [image_paths...]
 *
 * Arguments:
 *   prompt              - Article content (Markdown)
 *   output_path         - Output file path (e.g., public/ogp/2025/sample.jpg)
 *   system_prompt_file  - System prompt file path (e.g., ogp.md)
 *   image_paths         - Optional: Reference image file paths (multiple allowed)
 *
 * Requires GEMINI_API_KEY environment variable.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join, resolve, isAbsolute, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// MIME type mapping
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
}

function getMimeType(filePath) {
  const ext = extname(filePath).toLowerCase()
  return MIME_TYPES[ext] || 'image/jpeg'
}

function imageToBase64(filePath) {
  const buffer = readFileSync(filePath)
  return buffer.toString('base64')
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 3) {
    console.error(
      'Usage: node generate.mjs "<prompt>" "<output_path>" "<system_prompt_file>" [image_paths...]'
    )
    console.error('')
    console.error('Arguments:')
    console.error('  prompt              - Article content (Markdown)')
    console.error(
      '  output_path         - Output file path (e.g., public/ogp/2025/sample.jpg)'
    )
    console.error('  system_prompt_file  - System prompt file (e.g., ogp.md)')
    console.error(
      '  image_paths         - Optional: Reference image paths (multiple allowed)'
    )
    process.exit(1)
  }

  const userPrompt = args[0]
  const outputPath = args[1]
  const systemPromptFile = args[2]
  const imagePaths = args.slice(3)

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.')
    console.error('Get your API key from: https://aistudio.google.com/apikey')
    process.exit(1)
  }

  // Read system prompt
  const systemPromptPath = isAbsolute(systemPromptFile)
    ? systemPromptFile
    : join(__dirname, systemPromptFile)

  if (!existsSync(systemPromptPath)) {
    console.error(`Error: System prompt file not found: ${systemPromptPath}`)
    process.exit(1)
  }

  let systemPrompt
  try {
    systemPrompt = readFileSync(systemPromptPath, 'utf-8')
    console.log(`Using system prompt: ${systemPromptFile}`)
  } catch (err) {
    console.error(`Error reading system prompt: ${err.message}`)
    process.exit(1)
  }

  // Build the final prompt
  const finalPrompt = `${systemPrompt}\n\n---\n\n以下の記事コンテンツからOGP画像を生成してください:\n\n${userPrompt}`

  // Build parts array for multimodal input
  const parts = [{ text: finalPrompt }]

  // Always add the logo image first
  const logoPath = join(__dirname, 'ideamans-notes-logo.png')
  if (existsSync(logoPath)) {
    try {
      const logoBase64 = imageToBase64(logoPath)
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: logoBase64
        }
      })
      console.log('Added logo image: ideamans-notes-logo.png')
    } catch (err) {
      console.warn(`Warning: Failed to read logo image: ${err.message}`)
    }
  } else {
    console.warn('Warning: Logo image not found at:', logoPath)
  }

  // Add additional images if provided
  if (imagePaths.length > 0) {
    console.log(`Processing ${imagePaths.length} reference image(s)...`)

    for (const imagePath of imagePaths) {
      if (!existsSync(imagePath)) {
        console.warn(`Warning: Image file not found, skipping: ${imagePath}`)
        continue
      }

      try {
        const imageBase64 = imageToBase64(imagePath)
        const mimeType = getMimeType(imagePath)

        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: imageBase64
          }
        })

        console.log(`  Added image: ${imagePath} (${mimeType})`)
      } catch (err) {
        console.warn(
          `Warning: Failed to read image, skipping: ${imagePath} - ${err.message}`
        )
      }
    }
  }

  // Prepare the request
  const model = 'gemini-3-pro-image-preview'
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: parts
      }
    ],
    generationConfig: {
      responseModalities: ['image', 'text'],
      responseMimeType: 'text/plain'
    }
  }

  console.log('Generating OGP image with Gemini API...')

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} ${response.statusText}`)
      console.error(errorText)
      process.exit(1)
    }

    const data = await response.json()

    // Extract image from response
    const candidates = data.candidates
    if (!candidates || candidates.length === 0) {
      console.error('No candidates in response')
      console.error(JSON.stringify(data, null, 2))
      process.exit(1)
    }

    const responseParts = candidates[0].content?.parts
    if (!responseParts) {
      console.error('No parts in response')
      console.error(JSON.stringify(data, null, 2))
      process.exit(1)
    }

    // Find image part
    let imageData = null
    let mimeType = null

    for (const part of responseParts) {
      if (part.inlineData) {
        imageData = part.inlineData.data
        mimeType = part.inlineData.mimeType
        break
      }
    }

    if (!imageData) {
      console.error('No image data in response')
      console.error(JSON.stringify(data, null, 2))
      process.exit(1)
    }

    // Decode base64 and write to file
    const buffer = Buffer.from(imageData, 'base64')

    // Create directory if needed
    const dir = dirname(resolve(outputPath))
    mkdirSync(dir, { recursive: true })

    writeFileSync(outputPath, buffer)

    console.log(`OGP image saved to: ${outputPath}`)
    console.log(`MIME type: ${mimeType}`)
    console.log(`Size: ${buffer.length} bytes`)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }
}

main()
