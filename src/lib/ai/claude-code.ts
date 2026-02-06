/**
 * Claude Code Integration
 *
 * Claude Code is a CLI tool for agentic coding that can be integrated
 * as an alternative to direct API calls. This is useful when:
 * 1. You want to use Claude Code's enhanced reasoning capabilities
 * 2. You need to leverage local file system access for study materials
 * 3. You want to avoid API key management in certain environments
 *
 * SETUP REQUIREMENTS:
 * - Claude Code must be installed on the host system
 * - The CLAUDE_CODE_ENABLED environment variable must be set to "true"
 * - The container must have access to the Claude Code CLI
 *
 * NOTE: This integration requires the Docker container to either:
 * 1. Mount the host's Claude Code installation, or
 * 2. Have Claude Code installed within the container
 *
 * For production deployments, the standard API approach is recommended.
 * Claude Code integration is best suited for local development or
 * self-hosted environments where CLI access is available.
 */

import { spawn } from "child_process";
import { logger } from "@/lib/logger";
import {
  parseQuizResponse,
  buildQuizPrompt,
  difficultyInstructions,
} from "./index";
import type { QuizGenerationParams } from "./index";
import type { GeneratedQuiz } from "@/types";

/**
 * Executes the Claude Code CLI safely using spawn (no shell interpolation).
 * The prompt is passed via stdin to avoid any command injection vectors.
 */
function execClaudeCode(prompt: string, timeout: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p", "-"], {
      timeout,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    child.on("error", (err: Error) => {
      reject(new Error(`Failed to spawn Claude Code process: ${err.message}`));
    });

    child.on("close", (code: number | null) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(
          new Error(
            `Claude Code exited with code ${code}: ${stderr || "(no stderr)"}`,
          ),
        );
      }
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

export async function generateWithClaudeCode(
  params: QuizGenerationParams,
): Promise<GeneratedQuiz> {
  if (process.env.CLAUDE_CODE_ENABLED !== "true") {
    throw new Error(
      "Claude Code is not enabled. Set CLAUDE_CODE_ENABLED=true and ensure Claude Code CLI is installed.",
    );
  }

  const prompt = buildQuizPrompt(
    params,
    difficultyInstructions[params.difficulty],
  );

  try {
    // Execute Claude Code CLI with the prompt
    // The --print flag outputs the response to stdout
    // The -p flag runs in non-interactive print mode
    const stdout = await execClaudeCode(prompt, 120000); // 2 minute timeout

    return parseQuizResponse(stdout);
  } catch (error) {
    logger.error({ error }, "Claude Code execution failed");
    throw new Error("Failed to generate quiz with Claude Code");
  }
}
