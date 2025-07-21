import { decodeToken, generateToken, verifyToken } from '../jwt'

describe('JWT Utility Functions', () => {
  const payload = { userId: '123', email: '123@example.com' }
  let token: string

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      token = generateToken(payload.userId, payload.email)
      expect(typeof token).toBe('string')
      expect(token.split('.').length).toBe(3) // JWT has 3 parts
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid JWT token and return the payload', () => {
      const verified = verifyToken(token)
      expect(verified.userId).toBe(payload.userId)
      expect(verified.email).toBe(payload.email)
    })

    it('should throw an error for an invalid token', () => {
      const invalidToken = 'invalid.token.value'
      expect(() => verifyToken(invalidToken)).toThrow()
    })

    it('should throw an error for a token with wrong secret', () => {
      const invalidToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiaW52YWxpZCIsInJvbGVzIjpbImVycm9yIl19.oUNJj5FU7AQ_7o8vBBUjl_XoMpA6oI-981UcBAu6glM'
      expect(() => verifyToken(invalidToken)).toThrow()
    })
  })

  describe('decodeToken', () => {
    it('should decode a valid JWT token without verifying', () => {
      const decoded = decodeToken(token)
      expect(decoded.userId).toBe(payload.userId)
      expect(decoded.email).toBe(payload.email)
    })

    it('should throw an error for an invalid token', () => {
      const invalidToken = 'invalid.token.value'
      expect(() => decodeToken(invalidToken)).toThrow()
    })

    it('should decode a token with wrong secret, but right format', () => {
      const testToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYmMiLCJlbWFpbCI6ImFiY0BlbWFpbC5jb20ifQ.9QyBZEDJjjkZoe4vbTb5FWF2bOSCAdKk6cxl50QkbiQ'
      const decoded = decodeToken(testToken)
      expect(decoded.userId).toBe('abc')
      expect(decoded.email).toBe('abc@email.com')
    })
  })
})
