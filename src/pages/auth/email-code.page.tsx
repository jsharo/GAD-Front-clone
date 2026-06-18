import { useRef, useState } from 'react'
import type { ClipboardEvent, KeyboardEvent } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { AlertCircle, MailCheck } from 'lucide-react'

const CODE_LENGTH = 6

export function EmailCodePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))

  if (!(location.state as { fromSignup?: boolean } | null)?.fromSignup) {
    return <Navigate to="/auth/signup" replace />
  }
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  const focusAt = (index: number) => inputs.current[index]?.focus()

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < CODE_LENGTH - 1) focusAt(index + 1)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      focusAt(index - 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    const next = [...digits]
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    focusAt(Math.min(pasted.length, CODE_LENGTH - 1))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < CODE_LENGTH) {
      setError('Please enter the complete 6-digit code.')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      // TODO: call verification API with code
      navigate('/auth/signin', { replace: true })
    } catch {
      setError('Invalid or expired code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center px-8 py-16 bg-scale-1 overflow-y-auto">
      <div className="w-full max-w-xs my-auto">

        {/* Mobile logo */}
        <div className="lg:hidden flex flex-col items-center mb-8">
          <img src="/logo-gad.png" alt="GAD" className="w-40 h-40 object-contain rounded-2xl bg-scale-1 p-1 mb-3" />
          <p className="font-heading font-black text-scale-5 text-base tracking-wide">CAÑAR</p>
          <p className="text-scale-4 text-[0.55rem] tracking-[0.2em] font-bold">GAD MUNICIPAL</p>
        </div>

        {/* Title */}
        <div className="mb-10">
          <h1 className="font-heading font-black text-scale-5 text-[1.9rem] tracking-[-0.02em]">
            Verify Email Code
          </h1>
          <p className="mt-2 text-sm text-scale-3 leading-relaxed flex items-center gap-2">
            <MailCheck size={15} className="flex-shrink-0 text-scale-4" />
            Enter the 6-digit code sent to your email address.
          </p>
        </div>

        {/* Global error */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-6 text-sm bg-scale-3/10 border border-scale-3/30 text-scale-4">
            <AlertCircle size={15} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-4">

          {/* Code inputs */}
          <div>
            <label className="block text-xs font-bold text-scale-3 tracking-widest mb-4">
              Verification Code
            </label>
            <div className="flex gap-2 justify-between">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el }}
                  id={`email-code-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  autoFocus={i === 0}
                  autoComplete="one-time-code"
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="w-full aspect-square text-center text-lg font-bold outline-none rounded-xl bg-scale-1 border-[1.5px] border-scale-2 text-scale-5 hover:border hover:border-solid hover:border-scale-3 active:border-transparent active:ring-[2px] active:ring-inset active:ring-scale-4 focus:border-transparent focus:bg-scale-1 focus:ring-[2px] focus:ring-inset focus:ring-scale-4 transition-all"
                />
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            id="email-code-submit"
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-scale-1 transition-all mt-2 ${
              isLoading
                ? 'bg-scale-3/50'
                : 'bg-scale-5 hover:bg-scale-3'
            }`}
          >
            {isLoading
              ? <div className="w-5 h-5 border-2 rounded-full animate-spin border-scale-1/30 border-t-scale-1" />
              : <span>Verify</span>
            }
          </button>
        </form>

        {/* Back link */}
        <div className="mt-5 text-center">
          <span className="text-sm text-scale-3">Didn't receive a code?{' '}</span>
          <Link to="/auth/signup" id="email-code-back"
            className="text-sm font-semibold transition-colors text-scale-4 hover:text-scale-5">
            Go back
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-scale-2 text-[0.65rem]">
          © {new Date().getFullYear()} GAD Municipal de Cañar
        </p>
      </div>
    </div>
  )
}
