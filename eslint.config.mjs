import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import pluginSecurity from 'eslint-plugin-security'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

/** ESLint flat config (named export avoids import/no-anonymous-default-export). */
const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  pluginSecurity.configs.recommended,
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'node_modules/**'],
  },
  {
    rules: {
      'no-console': 'warn',
      'prefer-const': 'error',
      'security/detect-object-injection': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },
]

export default eslintConfig
