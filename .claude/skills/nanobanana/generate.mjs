#!/usr/bin/env node

/**
 * Nanobanana Image Generator
 *
 * Usage: node generate.mjs "<prompt>" "<output_path>" [system_prompt_file]
 *
 * Arguments:
 *   prompt              - User prompt or content for image generation
 *   output_path         - Output file path (e.g., public/images/2025/sample.jpg)
 *   system_prompt_file  - Optional: System prompt file path (e.g., infographic.md)
 *
 * Requires GEMINI_API_KEY environment variable.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { dirname, join, resolve, isAbsolute } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function main() {
  const args = process.argv.slice(2)

  if (args.length < 2) {
    console.error(
      'Usage: node generate.mjs "<prompt>" "<output_path>" [system_prompt_file]'
    )
    console.error('')
    console.error('Arguments:')
    console.error(
      '  prompt              - User prompt or content for image generation'
    )
    console.error('  output_path         - Output file path')
    console.error(
      '  system_prompt_file  - Optional: System prompt file (e.g., infographic.md)'
    )
    process.exit(1)
  }

  const userPrompt = args[0]
  const outputPath = args[1]
  const systemPromptFile = args[2] || null

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY environment variable is not set.')
    console.error('Get your API key from: https://aistudio.google.com/apikey')
    process.exit(1)
  }

  // Read system prompt if specified
  let systemPrompt = null
  if (systemPromptFile) {
    const systemPromptPath = isAbsolute(systemPromptFile)
      ? systemPromptFile
      : join(__dirname, systemPromptFile)

    if (!existsSync(systemPromptPath)) {
      console.error(`Error: System prompt file not found: ${systemPromptPath}`)
      process.exit(1)
    }

    try {
      systemPrompt = readFileSync(systemPromptPath, 'utf-8')
      console.log(`Using system prompt: ${systemPromptFile}`)
    } catch (err) {
      console.error(`Error reading system prompt: ${err.message}`)
      process.exit(1)
    }
  }

  // Build the final prompt
  let finalPrompt
  if (systemPrompt) {
    finalPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`
  } else {
    finalPrompt = userPrompt
  }

  // Prepare the request
  const model = 'gemini-3-pro-image-preview'
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: finalPrompt
          }
        ]
      }
    ],
    generationConfig: {
      responseModalities: ['image', 'text'],
      responseMimeType: 'text/plain'
    }
  }

  console.log('Generating image with Gemini API...')

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

    const parts = candidates[0].content?.parts
    if (!parts) {
      console.error('No parts in response')
      console.error(JSON.stringify(data, null, 2))
      process.exit(1)
    }

    // Find image part
    let imageData = null
    let mimeType = null

    for (const part of parts) {
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

    console.log(`Image saved to: ${outputPath}`)
    console.log(`MIME type: ${mimeType}`)
    console.log(`Size: ${buffer.length} bytes`)
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exit(1)
  }
}

main()
