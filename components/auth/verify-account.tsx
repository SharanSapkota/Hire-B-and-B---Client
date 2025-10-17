"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Mail } from "lucide-react"

export function VerifyAccount() {
  const { currentUser, verifyAccount, skipVerification } = useStore()
  const [emailSent, setEmailSent] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleResendEmail = () => {
    setEmailSent(true)
    setTimeout(() => setEmailSent(false), 3000)
  }

  const handleVerify = () => {
    setIsVerifying(true)
    // Simulate verification process
    setTimeout(() => {
      verifyAccount()
      setIsVerifying(false)
    }, 1500)
  }

  const handleSkip = () => {
    skipVerification()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Account</CardTitle>
          <CardDescription>We've sent a verification link to {currentUser?.email}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {emailSent && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">Verification email sent!</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Click the verification link in your email to activate your account. If you don't see the email, check your
              spam folder.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">For demo purposes:</p>
            <Button onClick={handleVerify} className="w-full" disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Verify Account Now"}
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Didn't receive the email?{" "}
            <button onClick={handleResendEmail} className="text-primary hover:underline font-medium">
              Resend verification email
            </button>
          </div>
          <Button variant="outline" onClick={handleSkip} className="w-full bg-transparent">
            Skip for now
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
