import { ENV } from '../env'

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeApiResponse {
  content: Array<{ type: string; text: string }>
}

/**
 * Call Claude API directly from uni-app via uni.request.
 * Works on H5, WeChat MiniProgram, and App targets.
 *
 * WeChat MiniProgram: add api.anthropic.com to "request合法域名" whitelist
 * before release. During dev, enable "不校验合法域名" in WeChat DevTools.
 */
export function callClaude(params: {
  system: string
  messages: ClaudeMessage[]
  maxTokens?: number
  temperature?: number
}): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${ENV.CLAUDE_BASE_URL}/messages`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'x-api-key': ENV.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        // Required when calling Claude directly from a browser/MiniProgram context
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      data: {
        model: ENV.CLAUDE_MODEL,
        max_tokens: params.maxTokens ?? 1024,
        temperature: params.temperature ?? 0.7,
        system: params.system,
        messages: params.messages,
      },
      success(res) {
        if (res.statusCode === 200) {
          const data = res.data as ClaudeApiResponse
          resolve(data.content[0]?.text ?? '')
        } else {
          reject(new Error(`Claude API error ${res.statusCode}: ${JSON.stringify(res.data)}`))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg ?? 'Network error calling Claude API'))
      },
    })
  })
}
